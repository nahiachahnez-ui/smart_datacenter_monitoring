# mqtt_ai_engine.py

import joblib
import pandas as pd
import psycopg2
import paho.mqtt.client as mqtt

# =====================================
# LOAD AI MODELS
# =====================================

model_risk = joblib.load("model_risk_level.pkl")
model_anomaly = joblib.load("model_anomaly.pkl")
model_failure = joblib.load("model_predicted_failure.pkl")
model_maintenance = joblib.load("model_maintenance_required.pkl")

label_encoders = joblib.load("label_encoders.pkl")

print("AI Models Loaded Successfully")

# =====================================
# POSTGRESQL CONFIG
# =====================================

DB_HOST = "192.168.1.4"
DB_NAME = "datacenter"
DB_USER = "postgres"
DB_PASSWORD = "chahnouzette"   

def connect_db():
    
    return psycopg2.connect(
        host="192.168.1.4",
        database="datacenter",  
        user="postgres",
        password="chahnouzette",
        port="5432"
    )
    

# =====================================
# MQTT CONFIG
# =====================================

MQTT_BROKER = "localhost"
MQTT_PORT = 1883

TOPICS = [
    ("nexo/datacenter/temperature", 0),
    ("nexo/datacenter/humidity", 0),
    ("nexo/datacenter/gas", 0),
    ("nexo/datacenter/air", 0),
    ("nexo/datacenter/water", 0),
    ("nexo/datacenter/smoke", 0),
    ("nexo/datacenter/dust", 0),
    ("nexo/datacenter/vibration", 0),
    ("nexo/datacenter/heartbeat", 0)
]

# =====================================
# SENSOR DATA BUFFER
# =====================================

# If sensor missing -> model still predicts using fallback values
sensor_data = {
    "temperature": None,
    "humidity": None,
    "gas_detected": None,
    "air_quality": None,
    "smoke_level": None,
    "water_level": None,
    "dust_level": None,
    "vibration_level": None,
    "heartbeat": None
}

# Default fallback values if sensor is missing
FALLBACK_VALUES = {
    "temperature": 24,
    "humidity": 55,
    "gas_detected": 0,
    "air_quality": 800,
    "smoke_level": 0,
    "water_level": 0,
    "dust_level": 5,
    "vibration_level": 1,
    "heartbeat": 1
}

# Static values
DEFAULTS = {
    "cooling_status": "stable",
    "cooling_efficiency": 85,
    "server_room_zone": "Zone_A",
    "incident_type": "normal",
    "alert_priority": "P4"
}

# =====================================
# LABEL ENCODER
# =====================================

def encode_value(column, value):
    encoder = label_encoders[column]
    return encoder.transform([str(value)])[0]

# =====================================
# SAVE TO DATABASE
# =====================================

def save_to_database(data, predictions):
    try:
        conn = connect_db()
        cursor = conn.cursor()

        query = """
        INSERT INTO ai_predictions (
            temperature,
            humidity,
            gas_detected,
            air_quality,
            smoke_level,
            water_level,
            dust_level,
            vibration_level,
            heartbeat,
            risk_level,
            anomaly_label,
            predicted_failure,
            maintenance_required
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        values = (
            data["temperature"],
            data["humidity"],
            data["gas_detected"],
            data["air_quality"],
            data["smoke_level"],
            data["water_level"],
            data["dust_level"],
            data["vibration_level"],
            data["heartbeat"],
            predictions["risk_level"],
            predictions["anomaly_label"],
            predictions["predicted_failure"],
            predictions["maintenance_required"]
        )

        cursor.execute(query, values)
        conn.commit()

        cursor.close()
        conn.close()

        print("Prediction saved to PostgreSQL")

    except Exception as e:
        print("Database Error:", e)


# PREDICTION ENGINE


def run_prediction():
    try:
        final_input = {}
        missing_sensors = []

        for sensor in sensor_data:
            if sensor_data[sensor] is None:
                final_input[sensor] = FALLBACK_VALUES[sensor]
                missing_sensors.append(sensor)
            else:
                final_input[sensor] = sensor_data[sensor]

        if missing_sensors:
            print("\nWARNING: Missing sensor data detected")
            print("Using fallback values for:", missing_sensors)

        input_data = pd.DataFrame([{
            "temperature": final_input["temperature"],
            "humidity": final_input["humidity"],
            "gas_detected": final_input["gas_detected"],
            "air_quality": final_input["air_quality"],
            "smoke_level": final_input["smoke_level"],
            "water_level": final_input["water_level"],
            "dust_level": final_input["dust_level"],
            "vibration_level": final_input["vibration_level"],
            "heartbeat": final_input["heartbeat"],
            "cooling_status": encode_value(
                "cooling_status",
                DEFAULTS["cooling_status"]
            ),
            "cooling_efficiency": DEFAULTS["cooling_efficiency"],
            "server_room_zone": encode_value(
                "server_room_zone",
                DEFAULTS["server_room_zone"]
            ),
            "incident_type": encode_value(
                "incident_type",
                DEFAULTS["incident_type"]
            ),
            "alert_priority": encode_value(
                "alert_priority",
                DEFAULTS["alert_priority"]
            )
        }])

        pred_risk = model_risk.predict(input_data)[0]
        pred_anomaly = model_anomaly.predict(input_data)[0]
        pred_failure = model_failure.predict(input_data)[0]
        pred_maintenance = model_maintenance.predict(input_data)[0]

        risk_label = label_encoders["risk_level"].inverse_transform([pred_risk])[0]
        anomaly_label = label_encoders["anomaly_label"].inverse_transform([pred_anomaly])[0]
        failure_label = label_encoders["predicted_failure"].inverse_transform([pred_failure])[0]
        maintenance_label = label_encoders["maintenance_required"].inverse_transform([pred_maintenance])[0]

        predictions = {
            "risk_level": risk_label,
            "anomaly_label": anomaly_label,
            "predicted_failure": failure_label,
            "maintenance_required": maintenance_label
        }

        print("\n===== AI PREDICTION =====")
        print(predictions)

        save_to_database(final_input, predictions)

    except Exception as e:
        print("Prediction Error:", e)

# =====================================
# MQTT CALLBACKS
# =====================================

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT Broker")

    for topic in TOPICS:
        client.subscribe(topic)

def on_message(client, userdata, msg):
    topic = msg.topic
    payload = msg.payload.decode()

    print(f"Received -> {topic}: {payload}")

    topic_map = {
        "nexo/datacenter/temperature": "temperature",
        "nexo/datacenter/humidity": "humidity",
        "nexo/datacenter/gas": "gas_detected",
        "nexo/datacenter/air": "air_quality",
        "nexo/datacenter/water": "water_level",
        "nexo/datacenter/smoke": "smoke_level",
        "nexo/datacenter/dust": "dust_level",
        "nexo/datacenter/vibration": "vibration_level",
        "nexo/datacenter/heartbeat": "heartbeat"
    }

    if topic in topic_map:
        key = topic_map[topic]
        sensor_data[key] = float(payload)

    run_prediction()

# =====================================
# START MQTT CLIENT
# =====================================

client = mqtt.Client()

client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT, 60)

client.loop_forever()
