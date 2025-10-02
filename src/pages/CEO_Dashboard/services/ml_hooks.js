// ML hooks adapter stub (mock mode)
const MOCK_MODE = true;

export async function analyzeText(texts, mode = "mock") {
  const joined = Array.isArray(texts) ? texts.join(" \n ") : String(texts || "");
  if (MOCK_MODE || mode === "mock") {
    const lower = joined.toLowerCase();
    const topics = [];
    const rootCauses = [];
    if (lower.includes("meeting") || lower.includes("meetings")) {
      topics.push("collaboration");
      rootCauses.push({ key: "too_many_meetings", explanation: "Frequent meetings reducing focus time", weight: 0.3 });
    }
    if (lower.includes("handoff") || lower.includes("handoffs") || lower.includes("blocker")) {
      topics.push("process");
      rootCauses.push({ key: "poor_handoffs", explanation: "Unclear handoffs create delays and blockers", weight: 0.25 });
    }
    if (lower.includes("budget") || lower.includes("cost")) {
      topics.push("finance");
      rootCauses.push({ key: "cost_pressure", explanation: "Budget constraints impacting execution", weight: 0.2 });
    }
    const sentiment = Math.max(-1, Math.min(1, (joined.length % 7) / 3 - 1));
    const confidence = 0.6 + 0.4 * Math.min(1, topics.length / 3);
    return {
      topics: Array.from(new Set(topics)),
      sentiment: Number(sentiment.toFixed(3)),
      rootCauses,
      confidence: Number(confidence.toFixed(3)),
      explanation: "Mock keyword-driven analysis (deterministic)",
    };
  }
  // TODO: Plug a real model endpoint here
  return {
    topics: [],
    sentiment: 0,
    rootCauses: [],
    confidence: 0,
    explanation: "Model not wired",
  };
}

export default { analyzeText };
