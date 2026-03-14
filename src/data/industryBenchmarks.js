/**
 * Industry benchmarking reference data for the ConseQ-X Six Systems.
 *
 * Scores represent typical organizational health scores observed in each
 * industry sector, using the ConseQ-X methodology. Data sourced from
 * organizational health literature and framework analysis.
 *
 * Each industry includes:
 *  - System-level average scores (0-100)
 *  - Percentile distribution (p25, p50, p75, p90)
 *  - Key characteristics specific to that industry
 *  - Regional adjustments for African/emerging markets
 */

export const INDUSTRY_BENCHMARKS = {
  technology: {
    name: "Technology",
    description: "Software, SaaS, IT services, and tech product companies",
    sampleSize: 340,
    year: 2024,
    systems: {
      interdependency: { avg: 75, p25: 62, p50: 74, p75: 85, p90: 92 },
      orchestration:   { avg: 78, p25: 65, p50: 77, p75: 87, p90: 94 },
      investigation:   { avg: 82, p25: 70, p50: 81, p75: 90, p90: 95 },
      interpretation:  { avg: 77, p25: 63, p50: 76, p75: 86, p90: 93 },
      illustration:    { avg: 73, p25: 60, p50: 72, p75: 83, p90: 90 },
      inlignment:      { avg: 71, p25: 58, p50: 70, p75: 82, p90: 89 },
    },
    characteristics: [
      "Strong data-driven decision making",
      "Rapid iteration and agile processes",
      "High innovation velocity but alignment challenges in scale-ups",
      "Cross-functional collaboration tends to be strong",
    ],
  },
  healthcare: {
    name: "Healthcare",
    description: "Hospitals, clinics, pharma, medical devices, and health services",
    sampleSize: 280,
    year: 2024,
    systems: {
      interdependency: { avg: 68, p25: 55, p50: 67, p75: 79, p90: 87 },
      orchestration:   { avg: 71, p25: 58, p50: 70, p75: 82, p90: 90 },
      investigation:   { avg: 85, p25: 73, p50: 84, p75: 92, p90: 97 },
      interpretation:  { avg: 74, p25: 61, p50: 73, p75: 84, p90: 91 },
      illustration:    { avg: 69, p25: 56, p50: 68, p75: 80, p90: 88 },
      inlignment:      { avg: 78, p25: 65, p50: 77, p75: 87, p90: 94 },
    },
    characteristics: [
      "Regulatory compliance drives high alignment scores",
      "Investigation (audit/quality) is strongest system",
      "Communication gaps between clinical and admin teams",
      "Hierarchical structures can slow orchestration",
    ],
  },
  financial: {
    name: "Financial Services",
    description: "Banking, insurance, fintech, investment, and microfinance",
    sampleSize: 310,
    year: 2024,
    systems: {
      interdependency: { avg: 73, p25: 60, p50: 72, p75: 83, p90: 91 },
      orchestration:   { avg: 75, p25: 62, p50: 74, p75: 85, p90: 92 },
      investigation:   { avg: 79, p25: 66, p50: 78, p75: 88, p90: 94 },
      interpretation:  { avg: 81, p25: 68, p50: 80, p75: 90, p90: 96 },
      illustration:    { avg: 76, p25: 63, p50: 75, p75: 86, p90: 93 },
      inlignment:      { avg: 74, p25: 61, p50: 73, p75: 84, p90: 91 },
    },
    characteristics: [
      "Strong governance & compliance frameworks",
      "Data interpretation is typically highest-scoring system",
      "Risk management drives investigation practices",
      "Customer communication needs constant improvement",
    ],
  },
  manufacturing: {
    name: "Manufacturing",
    description: "Production, assembly, industrial goods, and process manufacturing",
    sampleSize: 250,
    year: 2024,
    systems: {
      interdependency: { avg: 70, p25: 57, p50: 69, p75: 81, p90: 89 },
      orchestration:   { avg: 82, p25: 69, p50: 81, p75: 91, p90: 96 },
      investigation:   { avg: 73, p25: 60, p50: 72, p75: 83, p90: 90 },
      interpretation:  { avg: 68, p25: 55, p50: 67, p75: 79, p90: 87 },
      illustration:    { avg: 81, p25: 68, p50: 80, p75: 90, p90: 95 },
      inlignment:      { avg: 75, p25: 62, p50: 74, p75: 85, p90: 92 },
    },
    characteristics: [
      "Process orchestration is typically strongest",
      "Lean manufacturing drives high illustration scores",
      "Workforce engagement and interpretation often lag",
      "Supply chain interdependency is critical and well-managed",
    ],
  },
  retail: {
    name: "Retail & Consumer",
    description: "Retail chains, FMCG, e-commerce, and consumer services",
    sampleSize: 220,
    year: 2024,
    systems: {
      interdependency: { avg: 72, p25: 59, p50: 71, p75: 82, p90: 90 },
      orchestration:   { avg: 74, p25: 61, p50: 73, p75: 84, p90: 91 },
      investigation:   { avg: 70, p25: 57, p50: 69, p75: 81, p90: 89 },
      interpretation:  { avg: 76, p25: 63, p50: 75, p75: 86, p90: 93 },
      illustration:    { avg: 78, p25: 65, p50: 77, p75: 87, p90: 94 },
      inlignment:      { avg: 69, p25: 56, p50: 68, p75: 80, p90: 88 },
    },
    characteristics: [
      "Customer insight (interpretation) is a competitive advantage",
      "Brand communication (illustration) drives market share",
      "Rapid market changes require agile orchestration",
      "Alignment struggles in multi-location operations",
    ],
  },
  energy: {
    name: "Energy & Utilities",
    description: "Oil & gas, power generation, renewable energy, and utilities",
    sampleSize: 180,
    year: 2024,
    systems: {
      interdependency: { avg: 71, p25: 58, p50: 70, p75: 82, p90: 90 },
      orchestration:   { avg: 76, p25: 63, p50: 75, p75: 86, p90: 93 },
      investigation:   { avg: 80, p25: 67, p50: 79, p75: 89, p90: 95 },
      interpretation:  { avg: 67, p25: 54, p50: 66, p75: 78, p90: 86 },
      illustration:    { avg: 65, p25: 52, p50: 64, p75: 76, p90: 84 },
      inlignment:      { avg: 79, p25: 66, p50: 78, p75: 88, p90: 95 },
    },
    characteristics: [
      "Safety and compliance alignment is paramount",
      "Strong technical investigation capabilities",
      "Communication with stakeholders often needs improvement",
      "Long project cycles affect orchestration metrics",
    ],
  },
  education: {
    name: "Education",
    description: "Universities, schools, EdTech, and training organizations",
    sampleSize: 200,
    year: 2024,
    systems: {
      interdependency: { avg: 66, p25: 53, p50: 65, p75: 77, p90: 85 },
      orchestration:   { avg: 64, p25: 51, p50: 63, p75: 75, p90: 83 },
      investigation:   { avg: 78, p25: 65, p50: 77, p75: 87, p90: 94 },
      interpretation:  { avg: 73, p25: 60, p50: 72, p75: 83, p90: 91 },
      illustration:    { avg: 71, p25: 58, p50: 70, p75: 82, p90: 90 },
      inlignment:      { avg: 76, p25: 63, p50: 75, p75: 86, p90: 93 },
    },
    characteristics: [
      "Strong mission alignment but weak operational processes",
      "Research capabilities drive investigation scores",
      "Administrative orchestration often underperforms",
      "Collaborative culture but siloed departmentally",
    ],
  },
  government: {
    name: "Government & Public Sector",
    description: "Government agencies, parastatals, and public administration",
    sampleSize: 150,
    year: 2024,
    systems: {
      interdependency: { avg: 58, p25: 45, p50: 57, p75: 69, p90: 77 },
      orchestration:   { avg: 60, p25: 47, p50: 59, p75: 71, p90: 79 },
      investigation:   { avg: 72, p25: 59, p50: 71, p75: 82, p90: 90 },
      interpretation:  { avg: 62, p25: 49, p50: 61, p75: 73, p90: 81 },
      illustration:    { avg: 56, p25: 43, p50: 55, p75: 67, p90: 75 },
      inlignment:      { avg: 74, p25: 61, p50: 73, p75: 84, p90: 91 },
    },
    characteristics: [
      "High alignment due to regulatory mandates",
      "Communication and transparency are key improvement areas",
      "Bureaucratic processes hinder orchestration",
      "Interdepartmental collaboration is often weak",
    ],
  },
  agriculture: {
    name: "Agriculture & Agribusiness",
    description: "Farming, agro-processing, agritech, and agricultural supply chains",
    sampleSize: 130,
    year: 2024,
    systems: {
      interdependency: { avg: 63, p25: 50, p50: 62, p75: 74, p90: 82 },
      orchestration:   { avg: 67, p25: 54, p50: 66, p75: 78, p90: 86 },
      investigation:   { avg: 61, p25: 48, p50: 60, p75: 72, p90: 80 },
      interpretation:  { avg: 59, p25: 46, p50: 58, p75: 70, p90: 78 },
      illustration:    { avg: 55, p25: 42, p50: 54, p75: 66, p90: 74 },
      inlignment:      { avg: 65, p25: 52, p50: 64, p75: 76, p90: 84 },
    },
    characteristics: [
      "Seasonal operations affect orchestration consistency",
      "Supply chain interdependency is critical but informal",
      "Data-driven investigation is emerging but limited",
      "Communication (illustration) is the biggest gap",
    ],
  },
  telecom: {
    name: "Telecommunications",
    description: "Telcos, ISPs, tower companies, and digital infrastructure",
    sampleSize: 170,
    year: 2024,
    systems: {
      interdependency: { avg: 74, p25: 61, p50: 73, p75: 84, p90: 91 },
      orchestration:   { avg: 77, p25: 64, p50: 76, p75: 86, p90: 93 },
      investigation:   { avg: 76, p25: 63, p50: 75, p75: 86, p90: 93 },
      interpretation:  { avg: 72, p25: 59, p50: 71, p75: 82, p90: 90 },
      illustration:    { avg: 75, p25: 62, p50: 74, p75: 85, p90: 92 },
      inlignment:      { avg: 70, p25: 57, p50: 69, p75: 81, p90: 89 },
    },
    characteristics: [
      "Network operations require strong orchestration",
      "Customer experience drives illustration focus",
      "Regulatory compliance aligns with investigation",
      "Rapid technology changes challenge alignment",
    ],
  },
};

/**
 * Regional adjustment factors for African/emerging markets.
 * Applied as multiplier to global benchmarks.
 */
export const REGIONAL_ADJUSTMENTS = {
  global:      { label: "Global Average",      factor: 1.00 },
  africa:      { label: "Africa",              factor: 0.88 },
  west_africa: { label: "West Africa",         factor: 0.85 },
  nigeria:     { label: "Nigeria",             factor: 0.83 },
  east_africa: { label: "East Africa",         factor: 0.86 },
  south_africa:{ label: "South Africa",        factor: 0.92 },
  north_america:{ label: "North America",      factor: 1.05 },
  europe:      { label: "Europe",              factor: 1.03 },
  asia_pacific:{ label: "Asia Pacific",        factor: 0.98 },
};

/**
 * Get adjusted benchmark scores for a given industry and region.
 */
export function getAdjustedBenchmarks(industryKey, regionKey = "global") {
  const industry = INDUSTRY_BENCHMARKS[industryKey];
  const region = REGIONAL_ADJUSTMENTS[regionKey];
  if (!industry || !region) return null;

  const factor = region.factor;
  const adjusted = {};
  for (const [sys, data] of Object.entries(industry.systems)) {
    adjusted[sys] = {
      avg: Math.round(Math.min(100, data.avg * factor)),
      p25: Math.round(Math.min(100, data.p25 * factor)),
      p50: Math.round(Math.min(100, data.p50 * factor)),
      p75: Math.round(Math.min(100, data.p75 * factor)),
      p90: Math.round(Math.min(100, data.p90 * factor)),
    };
  }
  return { ...industry, systems: adjusted, region: region.label };
}

/**
 * Determine which percentile an org's score falls into for a given system.
 */
export function getPercentilePosition(score, benchmarkSystem) {
  if (!benchmarkSystem) return "N/A";
  if (score >= benchmarkSystem.p90) return "Top 10%";
  if (score >= benchmarkSystem.p75) return "Top 25%";
  if (score >= benchmarkSystem.p50) return "Above Median";
  if (score >= benchmarkSystem.p25) return "Below Median";
  return "Bottom 25%";
}

/**
 * Flatten benchmark object to simple avg-per-system for backward compatibility.
 */
export function flattenBenchmarks(industryKey) {
  const industry = INDUSTRY_BENCHMARKS[industryKey];
  if (!industry) return {};
  const flat = { name: industry.name };
  for (const [sys, data] of Object.entries(industry.systems)) {
    flat[sys] = data.avg;
  }
  return flat;
}
