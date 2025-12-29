import joblib
import pandas as pd

# Charger le modèle et les infos
model = joblib.load("disease_model.pkl")
encoder = joblib.load("label_encoder.pkl")
model_columns = joblib.load("model_columns.pkl")

# Exemple de symptômes (à adapter avec de vrais noms du dataset)
symptoms_input = ["itching", "skin_rash", "nodal_skin_eruptions"]

# Créer un vecteur 0/1
input_df = pd.DataFrame(0, index=[0], columns=model_columns)

for symptom in symptoms_input:
    if symptom in input_df.columns:
        input_df.at[0, symptom] = 1

# Prédiction
prediction = model.predict(input_df)
disease = encoder.inverse_transform(prediction)[0]

print("🦠 Symptômes :", symptoms_input)
print("✅ Maladie prédite :", disease)
