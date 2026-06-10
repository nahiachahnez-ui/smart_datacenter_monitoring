-- Run this once to add esp_id tracking to both tables

ALTER TABLE sensor_data
  ADD COLUMN IF NOT EXISTS esp_id VARCHAR(50) DEFAULT 'unknown';

ALTER TABLE ai_predictions
  ADD COLUMN IF NOT EXISTS esp_id VARCHAR(50) DEFAULT 'unknown';

-- Index for fast filtering by ESP
CREATE INDEX IF NOT EXISTS idx_sensor_data_esp_id    ON sensor_data(esp_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_esp_id ON ai_predictions(esp_id);
