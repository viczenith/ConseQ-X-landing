// utils/analysisMapper.js
const COMPONENT_IMPACTS = {
  revenue: {
    positive: "Streamlined processes boost profitability through efficiency gains",
    negative: "Operational friction creates revenue leakage points"
  },
  employeeRetention: {
    positive: "Clear growth paths increase retention by 40-60%",
    negative: "Role ambiguity causes 25-40% turnover in key positions"
  },
  // ... all 48 components
};

export const mapScoreToImpact = (score, component) => {
  const threshold = score.maxScore * 0.7; // 70% threshold
  
  return score.score > threshold
    ? COMPONENT_IMPACTS[component].positive
    : COMPONENT_IMPACTS[component].negative;
};

// Example AI prompt enhancement
export const enhancePrompt = (basePrompt) => {
  return `${basePrompt}\n\n# Additional Analysis Guidelines:
  - For scores below 70%, focus on immediate remediation plans
  - For mid-range scores, suggest optimization strategies
  - For high scores, recommend reinforcement mechanisms
  - Always cross-reference impacts across at least 3 components
  - Include industry-specific benchmarks where applicable`;
};