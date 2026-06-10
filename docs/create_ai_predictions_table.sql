-- Run this once in your PostgreSQL database
-- to create the ai_predictions table

CREATE TABLE IF NOT EXISTS ai_predictions (
    id                   SERIAL PRIMARY KEY,
    temperature          FLOAT,
    humidity             FLOAT,
    gas_detected         FLOAT,
    air_quality          FLOAT,
    smoke_level          FLOAT,
    water_level          FLOAT,
    dust_level           FLOAT,
    vibration_level      FLOAT,
    heartbeat            FLOAT,
    risk_level           VARCHAR(50),
    anomaly_label        VARCHAR(50),
    predicted_faillure   VARCHAR(50),
    maintenance_required VARCHAR(50),
    created_at           TIMESTAMP DEFAULT NOW()
);
