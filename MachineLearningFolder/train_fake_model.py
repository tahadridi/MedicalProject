import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.dummy import DummyClassifier
from sklearn.metrics import accuracy_score
import joblib

# =========================
# 1. Charger le dataset
# =========================
dataset = pd.read_csv("dataset.csv")
dataset = dataset.fillna(0)

for col in dataset.columns:
    dataset[col] = dataset[col].astype(str).str.strip()

# =========================
# 2. Séparer X et y
# =========================
y = dataset["Disease"]
X = dataset.drop("Disease", axis=1)

# =========================
# 3. Transformer en 0/1
# =========================
all_symptoms = set()

for col in X.columns:
    all_symptoms.update(X[col].unique())

all_symptoms.discard("0")
all_symptoms = sorted(list(all_symptoms))

X_binary = pd.DataFrame(0, index=X.index, columns=all_symptoms)

for i, row in X.iterrows():
    for symptom in row:
        if symptom != "0":
            X_binary.at[i, symptom] = 1

X = X_binary

# =========================
# 4. Encoder la maladie
# =========================
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# =========================
# 5. Train / Test split
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42
)

# =========================
# 6. MODÈLE FAIBLE (AU HASARD)
# =========================
fake_model = DummyClassifier(strategy="uniform")  # prédictions aléatoires
fake_model.fit(X_train, y_train)

# =========================
# 7. Évaluation
# =========================
y_pred = fake_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("❌ Accuracy du modèle FAIBLE :", accuracy)

# =========================
# 8. Sauvegarde (pour preuve)
# =========================
joblib.dump(fake_model, "fake_model.pkl")
joblib.dump(encoder, "label_encoder_fake.pkl")
joblib.dump(X.columns.tolist(), "model_columns_fake.pkl")

print("❌ Faux modèle sauvegardé")
