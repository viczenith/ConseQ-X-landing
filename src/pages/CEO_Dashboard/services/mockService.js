import { scoreSystem, computeOrgHealth } from "../lib/scoring";
import { normalizeSystemKey, CANONICAL_SYSTEMS } from "../constants/systems";

const STORAGE_KEY = "conseqx_assessments_v1";
const FIXTURE_ORG_KEY = "CEO_DB_FIXTURES_ORG";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeAll(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

function makeRunId(prefix = "A-run") {
  const d = new Date();
  const pad = (n, w = 2) => n.toString().padStart(w, "0");
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  const rand = Math.abs(hashCode(`${prefix}-${stamp}`)).toString(36).slice(0, 4).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

function deterministicSystemMetrics(orgId, systemId) {
  // Simple deterministic pseudo-metrics seeded by org+system
  const seed = `${orgId}::${systemId}`;
  const h = Math.abs(hashCode(seed));
  // 3-5 metrics in 0..100
  const m1 = 55 + (h % 41);
  const m2 = 50 + ((h >> 3) % 46);
  const m3 = 45 + ((h >> 5) % 50);
  const m4 = 40 + ((h >> 7) % 55);
  return { throughput: m1, cycle_time: m2, quality: m3, predictability: m4 };
}

// Organizational Health Insights - demonstrating our competitive advantage over ERP/BI
function generateOrganizationalHealthInsights(latestBySys, orgHealth, confidence) {
  const systems = Object.keys(latestBySys);
  const scores = systems.map(s => latestBySys[s].score || 0);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b) / scores.length : 0;
  
  // Cultural and behavioral insights (not available in ERP/BI)
  const cultural_factors = {
    collaboration_index: Math.round((latestBySys.interdependency?.score || 50) * 0.8 + (latestBySys.alignment?.score || 50) * 0.2),
    innovation_velocity: Math.round((latestBySys.iteration?.score || 50) * 0.7 + (latestBySys.investigation?.score || 50) * 0.3),
    communication_effectiveness: latestBySys.illustration?.score || 50,
    decision_quality: latestBySys.interpretation?.score || 50,
    overall_culture_health: Math.round(avgScore * 0.9 + confidence * 100 * 0.1)
  };
  
  // Cross-system dependency analysis (unique to our platform)
  const dependencies = systems.map(sys => {
    const impactedBy = systems.filter(other => other !== sys && Math.abs((latestBySys[sys]?.score || 50) - (latestBySys[other]?.score || 50)) < 15);
    return {
      system: sys,
      depends_on: impactedBy,
      impact_strength: impactedBy.length > 0 ? 'high' : 'medium',
      bottleneck_risk: (latestBySys[sys]?.score || 50) < 40 ? 'critical' : 'low'
    };
  });
  
  // AI-driven recommendations (automated insights vs manual BI analysis)
  const recommendations = [
    {
      insight_id: "rec-001",
      action: orgHealth < 60 ? "Focus on foundational systems: Investigation and Alignment need immediate attention" : "Optimize high-performing areas for maximum impact",
      owner: orgHealth < 60 ? "Chief Operating Officer" : "Strategic Planning Team",
      priority: orgHealth < 60 ? "critical" : "normal",
      expected_impact: "+8-12% org health",
      reasoning: `Based on cross-system analysis, ${orgHealth < 60 ? 'foundational gaps' : 'optimization opportunities'} detected`
    },
    {
      insight_id: "rec-002", 
      action: cultural_factors.collaboration_index < 60 ? "Implement cross-team collaboration protocols" : "Scale successful collaboration patterns across organization",
      owner: "Head of People & Culture",
      priority: cultural_factors.collaboration_index < 60 ? "high" : "medium",
      expected_impact: "+5-8% collaboration effectiveness",
      reasoning: `Collaboration index at ${cultural_factors.collaboration_index}% indicates ${cultural_factors.collaboration_index < 60 ? 'improvement needed' : 'scaling opportunity'}`
    }
  ];
  
  // Risk identification (predictive capability)
  const risk_areas = systems.filter(s => (latestBySys[s]?.score || 0) < 45).map(s => ({
    system: s,
    risk_level: (latestBySys[s]?.score || 0) < 30 ? 'critical' : 'moderate',
    impact_radius: dependencies.find(d => d.system === s)?.depends_on.length || 0,
    mitigation_timeline: (latestBySys[s]?.score || 0) < 30 ? '30 days' : '60 days'
  }));
  
  // Improvement opportunities (prescriptive insights)
  const opportunities = systems.filter(s => (latestBySys[s]?.score || 0) > 70).map(s => ({
    system: s,
    leverage_potential: 'high',
    suggested_action: `Use ${s} strength to boost interconnected systems`,
    roi_estimate: '3-5x investment'
  }));
  
  // Transformation readiness score (unique organizational capability assessment)
  const transformation_score = Math.round(
    (cultural_factors.collaboration_index * 0.3 + 
     cultural_factors.innovation_velocity * 0.25 + 
     avgScore * 0.35 + 
     confidence * 100 * 0.1)
  );
  
  return {
    cultural_factors,
    dependencies,
    recommendations,
    risk_areas,
    opportunities,
    transformation_score
  };
}

function calculateDeltaMoM(runs, systemKey) {
  const systemRuns = runs.filter(r => normalizeSystemKey(r.systemId) === systemKey)
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  
  if (systemRuns.length < 2) return 0;
  
  const latest = systemRuns[0].score || 0;
  const previous = systemRuns[1].score || 0;
  return Number((latest - previous).toFixed(1));
}

function generateHealthIndicators(systemKey, latest) {
  const score = latest.score || 0;
  const indicators = [];
  
  if (score > 80) indicators.push('excellent_performance');
  if (score > 60) indicators.push('above_average');
  if (score < 40) indicators.push('needs_attention');
  if (score < 25) indicators.push('critical_risk');
  
  // System-specific indicators based on our organizational health model
  switch(systemKey) {
    case 'interdependency':
      if (score > 70) indicators.push('strong_collaboration');
      if (score < 50) indicators.push('siloed_operations');
      break;
    case 'iteration':
      if (score > 70) indicators.push('agile_culture');
      if (score < 50) indicators.push('slow_adaptation');
      break;
    case 'investigation':
      if (score > 70) indicators.push('data_driven');
      if (score < 50) indicators.push('limited_insights');
      break;
    case 'interpretation':
      if (score > 70) indicators.push('strategic_clarity');
      if (score < 50) indicators.push('decision_gaps');
      break;
    case 'illustration':
      if (score > 70) indicators.push('clear_communication');
      if (score < 50) indicators.push('information_bottlenecks');
      break;
    case 'alignment':
      if (score > 70) indicators.push('unified_direction');
      if (score < 50) indicators.push('misaligned_goals');
      break;
  }
  
  return indicators;
}

function identifyRiskFactors(systemKey, score) {
  const risks = [];
  
  if (score < 40) {
    risks.push({
      factor: 'performance_degradation',
      severity: score < 25 ? 'critical' : 'high',
      impact: 'Significant impact on organizational effectiveness'
    });
  }
  
  if (score < 60) {
    risks.push({
      factor: 'below_benchmark',
      severity: 'medium',
      impact: 'Operating below organizational potential'
    });
  }
  
  return risks;
}

export async function runAssessment(orgId, systemKey, options = {}) {
  const systemId = normalizeSystemKey(systemKey);
  const nowISO = new Date().toISOString();
  const metrics = deterministicSystemMetrics(orgId || "anon", systemId);
  const weights = { throughput: 1, cycle_time: 1, quality: 1, predictability: 1 };
  const { score, coverage, rationale } = scoreSystem(metrics, weights);
  const result = {
    id: makeRunId("A"),
    systemId,
    title: `${(CANONICAL_SYSTEMS.find((s) => s.key === systemId) || {}).title || systemId} Assessment`,
    score,
    coverage,
    timestamp: Date.now(),
    orgId: orgId || "anon",
    meta: { simulated: true, rationale, metrics, weights },
  };

  // persist to localStorage list for org
  const all = readAll();
  const arr = all[result.orgId] || [];
  all[result.orgId] = [result, ...arr].slice(0, 200);
  writeAll(all);

  // broadcast update
  try {
    if ("BroadcastChannel" in window) {
      const bc = new BroadcastChannel("conseqx_assessments");
      bc.postMessage({ type: "assessments:update", orgId: result.orgId, payload: all[result.orgId] });
      bc.close();
    }
  } catch {}

  return result;
}

export async function getDashboardSummary(orgId) {
  // Aggregate latest per system and compute org health
  const all = readAll();
  const list = all[orgId] || [];
  const bySys = {};
  list.forEach((r) => {
    const k = normalizeSystemKey(r.systemId);
    if (!bySys[k] || (bySys[k].timestamp || 0) < (r.timestamp || 0)) bySys[k] = r;
  });
  const systemScores = Object.keys(bySys).map((key) => ({ key, score: bySys[key].score || 0, coverage: bySys[key].coverage ?? 1 }));
  // default equal weights
  const { orgHealth, confidence, breakdown } = computeOrgHealth(systemScores);

  // light north star & recs from fixtures or defaults
  let north_star = "Increase on-time delivery by 15%";
  try {
    const fixture = JSON.parse(localStorage.getItem(FIXTURE_ORG_KEY) || "null");
    if (fixture?.north_star) north_star = fixture.north_star;
  } catch {}

  const systems = CANONICAL_SYSTEMS.map((s) => {
    const latest = bySys[s.key] || null;
    return {
      key: s.key,
      title: s.title,
      score: latest?.score || null,
      delta_mom: latest ? calculateDeltaMoM(list, s.key) : 0,
      top_insight_id: latest ? `ins-${s.key}-001` : null,
      health_indicators: latest ? generateHealthIndicators(s.key, latest) : [],
      risk_factors: latest ? identifyRiskFactors(s.key, latest.score) : []
    };
  });

  // Generate organizational health insights that demonstrate our competitive advantage
  const insights = generateOrganizationalHealthInsights(bySys, orgHealth, confidence);

  const top_recommendations = insights.recommendations;

  return {
    org_id: orgId,
    run_id: makeRunId("DASH"),
    date: new Date().toISOString(),
    org_health: orgHealth,
    confidence,
    
    // Enhanced north star with trend analysis
    north_star: {
      name: north_star,
      value: (orgHealth / 100 * 1.2).toFixed(2),
      unit: "x",
      trend: orgHealth > 70 ? "improving" : orgHealth > 50 ? "stable" : "needs_attention"
    },
    
    systems,
    top_recommendations,
    
    // Unique organizational insights that demonstrate our USP over ERP/BI
    organizational_insights: insights.cultural_factors,
    cross_system_dependencies: insights.dependencies,
    transformation_readiness: insights.transformation_score,
    
    // Predictive capabilities (competitive advantage)
    health_forecast: {
      next_30_days: Math.min(100, orgHealth + (confidence > 0.8 ? 2 : -1)),
      risk_areas: insights.risk_areas,
      improvement_opportunities: insights.opportunities
    },
    
    // Meta information about our competitive positioning
    framework_advantages: {
      vs_erp: "Provides cultural and behavioral insights beyond transactional data",
      vs_bi: "Automated organizational diagnosis vs manual dashboard building", 
      vs_consulting: "Continuous monitoring vs periodic assessments"
    }
  };
}

export function simulateImpact(orgId, systemKey, changePct = 10) {
  const systemId = normalizeSystemKey(systemKey);
  const all = readAll();
  const list = all[orgId] || [];
  const bySys = {};
  list.forEach((r) => {
    const k = normalizeSystemKey(r.systemId);
    if (!bySys[k] || (bySys[k].timestamp || 0) < (r.timestamp || 0)) bySys[k] = r;
  });
  const systemScores = CANONICAL_SYSTEMS.map((s) => {
    const cur = bySys[s.key];
    return { key: s.key, score: cur ? cur.score : 50, coverage: cur ? cur.coverage ?? 1 : 0.5 };
  });
  const base = computeOrgHealth(systemScores);
  const boosted = systemScores.map((s) => (s.key === systemId ? { ...s, score: Math.min(100, s.score * (1 + changePct / 100)) } : s));
  const after = computeOrgHealth(boosted);
  return { before: base, after };
}

export function loadFixtures() {
  // Load org_seed.json into localStorage for quick demo data
  try {
    // Note: bundlers will inline JSON imports if configured; here we fetch via dynamic import fallback.
    // In this environment, we simulate loading by embedding a small seed at runtime if not present.
    if (!localStorage.getItem(FIXTURE_ORG_KEY)) {
      const seed = {
        org_id: "org-1",
        org_name: "Demo Org",
        north_star: "Ship features faster with higher quality",
      };
      localStorage.setItem(FIXTURE_ORG_KEY, JSON.stringify(seed));
    }
  } catch {}
}

export default { runAssessment, getDashboardSummary, simulateImpact, loadFixtures };
