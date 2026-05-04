import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

from xgboost import XGBClassifier

# =========================
# LOAD DATASET
# =========================

df = pd.read_excel(
    r"C:\Users\nahia\Desktop\python model\NEXO_FINAL_XGBOOST_DATASET_WITH_TARGETS.xlsx"
)

print("Dataset Loaded Successfully")
print(df.head())
print(df.columns)

# =========================
# ENCODE CATEGORICAL COLUMNS
# =========================

categorical_cols = [
    "cooling_status",
    "server_room_zone",
    "incident_type",
    "alert_priority"
]

label_encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

# =========================
# ENCODE TARGET COLUMNS
# =========================

target_cols = [
    "risk_level",
    "anomaly_label",
    "predicted_failure",
    "maintenance_required"
]

for col in target_cols:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    label_encoders[col] = le

# Save encoders
joblib.dump(label_encoders, "label_encoders.pkl")

print("label_encoders.pkl saved successfully.")

# =========================
# FEATURES
# =========================

features = [
    "temperature",
    "humidity",
    "gas_detected",
    "air_quality",
    "smoke_level",
    "water_level",
    "dust_level",
    "vibration_level",
    "heartbeat",
    "cooling_status",
    "cooling_efficiency",
    "server_room_zone",
    "incident_type",
    "alert_priority"
]

X = df[features]

# =========================
# MODEL 1 — XGBOOST
# TARGET: risk_level
# =========================

y_risk = df["risk_level"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_risk,
    test_size=0.2,
    random_state=42,
    stratify=y_risk
)

model_risk = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric="mlogloss"
)

model_risk.fit(X_train, y_train)

pred_risk = model_risk.predict(X_test)

print("\n========== RISK LEVEL MODEL ==========")
print("Accuracy:", accuracy_score(y_test, pred_risk))
print(classification_report(y_test, pred_risk))

joblib.dump(model_risk, "model_risk_level.pkl")

print("model_risk_level.pkl saved successfully.")

# =========================
# FUNCTION FOR SECONDARY MODELS
# =========================

def train_secondary_model(target_name, output_name):
    y = df[target_name]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=150,
        random_state=42
    )

    model.fit(X_train, y_train)

    pred = model.predict(X_test)

    print(f"\n========== {target_name.upper()} MODEL ==========")
    print("Accuracy:", accuracy_score(y_test, pred))
    print(classification_report(y_test, pred))

    joblib.dump(model, output_name)

    print(f"{output_name} saved successfully.")

# =========================
# MODEL 2 — anomaly_label
# =========================

train_secondary_model(
    "anomaly_label",
    "model_anomaly.pkl"
)

# =========================
# MODEL 3 — predicted_failure
# =========================

train_secondary_model(
    "predicted_failure",
    "model_predicted_failure.pkl"
)

# =========================
# MODEL 4 — maintenance_required
# =========================

train_secondary_model(
    "maintenance_required",
    "model_maintenance_required.pkl"
)

print("\n======================================")
print("ALL MODELS TRAINED SUCCESSFULLY")
print("READY FOR RASPBERRY PI DEPLOYMENT")
print("======================================")
