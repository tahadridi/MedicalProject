import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# =========================
# 1. Charger le dataset
# =========================
dataset = pd.read_csv("dataset.csv")

print("✅ Dataset chargé")
print(dataset.head())

# =========================
# 2. Nettoyer les données
# =========================

# Remplacer les valeurs vides par 0
dataset = dataset.fillna(0)

# Supprimer les espaces inutiles
for col in dataset.columns:
    dataset[col] = dataset[col].astype(str).str.strip()

# =========================
# 3. Séparer X et y
# =========================
y = dataset["Disease"]
X = dataset.drop("Disease", axis=1)

# =========================
# 4. Transformer les symptômes texte en 0/1
# =========================

# Récupérer la liste de TOUS les symptômes possibles
all_symptoms = set()

for col in X.columns:
    all_symptoms.update(X[col].unique())

# Enlever le 0
all_symptoms.discard("0")

all_symptoms = sorted(list(all_symptoms))

print("✅ Nombre total de symptômes :", len(all_symptoms))

# Créer un DataFrame binaire (0/1)
X_binary = pd.DataFrame(0, index=X.index, columns=all_symptoms)

# Remplir le tableau binaire
for i, row in X.iterrows():
    for symptom in row:
        if symptom != "0":
            X_binary.at[i, symptom] = 1

X = X_binary

print("✅ Données transformées en format numérique")

# =========================
# 5. Encoder la maladie
# =========================
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# =========================
# 6. Train / Test split
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# =========================
# 7. Entraîner le modèle
# =========================
model = RandomForestClassifier(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# =========================
# 8. Évaluer le modèle
# =========================
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("✅ Accuracy du modèle :", accuracy)

# =========================
# 9. Sauvegarder
# =========================
joblib.dump(model, "disease_model.pkl")
joblib.dump(encoder, "label_encoder.pkl")
joblib.dump(X.columns.tolist(), "model_columns.pkl")

print("✅ Modèle enregistré avec succès")
