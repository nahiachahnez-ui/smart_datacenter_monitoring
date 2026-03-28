import * as ss from "simple-statistics";

export function detectAnomaly(values, currentValue) {
  if (!values || values.length < 10) {
    return {
      isAnomaly: false,
      zScore: 0
    };
  }

  const mean = ss.mean(values);
  const std = ss.standardDeviation(values);

  if (std === 0) {
    return {
      isAnomaly: false,
      zScore: 0
    };
  }

  const zScore = (currentValue - mean) / std;

  return {
    zScore,
    isAnomaly: Math.abs(zScore) > 3
  };
}