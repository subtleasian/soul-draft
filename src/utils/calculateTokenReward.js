// src/utils/calculateTokenReward.js (Frontend-safe version)

export function calculateTokenReward(scores = {}) {
  const multiplier = 20;

  const heuristicsByDimension = {
    cognitive: {
      clarity: 1.0,
      conceptualComplexity: 0.8,
      counterfactualThinking: 1.0,
      originality: 0.7,
      criticalThinking: 1.0,
      metaphorDensity: 0.5,
      temporalReasoning: 0.6
    },
    emotional: {
      emotionalGranularity: 1.0,
      emotionalIntensity: 1.0,
      polarityRange: 0.5,
      emotionalRisk: 0.8,
      empathy: 1.0,
      selfCompassion: 0.8,
      emotionalInversion: 0.2
    },
    identity: {
      selfInsight: 1.0,
      valueSalience: 1.0,
      agency: 0.8,
      traitInferenceConfidence: 0.6
    },
    linguistic: {
      lexicalRichness: 0.7,
      syntacticComplexity: 0.8,
      fluency: 1.0,
      verbosity: -0.4,
      repetitiveness: -0.6
    },
    socialEthical: {
      moralReasoning: 1.0,
      perspectiveTaking: 1.0,
      culturalAwareness: 0.8,
      socialDesirabilityBias: -0.5
    }
  };

  const byDimension = {};
  let total = 0;

  for (const [dimension, heuristics] of Object.entries(heuristicsByDimension)) {
    const domainScores = scores[dimension] || {};
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(heuristics)) {
      const value = domainScores[key];
      if (typeof value === "number") {
        weightedSum += value * weight;
        totalWeight += Math.abs(weight);
      }
    }

    const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const reward = Math.round(normalizedScore * multiplier);
    byDimension[dimension] = reward;
    total += reward;
  }

  return {
    total,
    byDimension
  };
}
