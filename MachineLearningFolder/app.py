import os
import joblib
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# =========================
# Charger modèle et colonnes
# =========================
model = joblib.load("disease_model.pkl")
encoder = joblib.load("label_encoder.pkl")
model_columns = joblib.load("model_columns.pkl")  # liste de tous les symptômes (en colonnes)

print("✅ Modèle, encodeur et colonnes chargés.")

# =========================
# Charger les CSV optionnels
# =========================
def safe_read_csv(path):
    if os.path.exists(path):
        print(f"✅ Fichier trouvé : {path}")
        return pd.read_csv(path)
    else:
        print(f"⚠️ Fichier NON trouvé : {path} (fonctionnalité réduite)")
        return None

description_df = safe_read_csv("symptom_description.csv")
precaution_df = safe_read_csv("symptom_precaution.csv")
severity_df = safe_read_csv("symptom_severity.csv")

for df in [description_df, precaution_df, severity_df]:
    if df is not None:
        for col in df.columns:
            df[col] = df[col].astype(str).str.strip()

# =========================
# FastAPI app + CORS
# =========================
app = FastAPI(title="Disease Prediction API")

# ⚠️ CORS pour autoriser les appels depuis ton frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # tu peux limiter plus tard
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SymptomsRequest(BaseModel):
    symptoms: list[str]

def calculate_severity(symptoms_list):
    if severity_df is None:
        return None
    total = 0
    for s in symptoms_list:
        row = severity_df[severity_df["Symptom"] == s]
        if not row.empty:
            try:
                total += int(row["weight"].values[0])
            except:
                pass
    return total

@app.get("/")
def home():
    return {"message": "API Disease Prediction OK ✅"}

# ➜ ENDPOINT pour que le frontend récupère la liste des symptômes
@app.get("/symptoms")
def get_symptoms():
    return {"symptoms": model_columns}

# ➜ ENDPOINT principal de prédiction
@app.post("/predict")
def predict(request: SymptomsRequest):
    symptoms_list = request.symptoms

    # vecteur 0/1
    input_df = pd.DataFrame(0, index=[0], columns=model_columns)
    for symptom in symptoms_list:
        if symptom in input_df.columns:
            input_df.at[0, symptom] = 1

    # prédiction + probas
    probas = model.predict_proba(input_df)[0]
    max_proba = float(probas.max())
    pred_index = probas.argmax()
    disease = encoder.inverse_transform([pred_index])[0]

    # top 3 maladies
    import numpy as np
    top_k = 3
    top_indices = np.argsort(probas)[::-1][:top_k]
    top_diseases = encoder.inverse_transform(top_indices)
    top_scores = [float(probas[i]) for i in top_indices]

    # description
    if description_df is not None:
        desc_row = description_df[description_df["Disease"] == disease]
        if not desc_row.empty:
            desc = desc_row["Description"].values[0]
        else:
            desc = "Aucune description disponible."
    else:
        desc = "Fichier symptom_description.csv manquant."

    # précautions
    precautions = []
    if precaution_df is not None:
        prec_row = precaution_df[precaution_df["Disease"] == disease]
        if not prec_row.empty:
            precautions = [val for val in prec_row.values[0][1:] if val != "0"]
    else:
        precautions = ["Fichier symptom_precaution.csv manquant."]

    severity_score = calculate_severity(symptoms_list)

    return {
        "input_symptoms": symptoms_list,
        "disease": disease,
        "confidence": max_proba,
        "top_predictions": [
            {"disease": d, "probability": p} for d, p in zip(top_diseases, top_scores)
        ],
        "description": desc,
        "precautions": precautions,
        "severity_score": severity_score,
    }
