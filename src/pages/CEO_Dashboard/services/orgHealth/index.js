// src/pages/CEO_Dashboard/services/orgHealth/index.js
// Minimal OrgHealth service: ingest assessment -> map to simple metrics -> compute score -> persist -> emit events

import { computeSystemScore } from "./score";

const ORG_HEALTH_KEY = "conseqx_org_health_v1";

/**
 * Persist results per orgId (simple localStorage JSON).
 */
function readAll() {
  try {
    const raw = localStorage.getItem(ORG_HEALTH_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeAll(obj) {
  try {
    localStorage.setItem(ORG_HEALTH_KEY, JSON.stringify(obj));
  } catch {}
}

/**
 * Save a single computed system result
 */
export function saveResult(orgId, result) {
  if (!orgId) orgId = "anon";
  const all = readAll();
  const arr = all[orgId] || [];
  // Prepend newest
  arr.unshift(result);
  all[orgId] = arr.slice(0, 300); // keep a cap
  writeAll(all);

  try {
    window.dispatchEvent(new CustomEvent("conseqx:orghealth:completed", { detail: { orgId, result } }));
  } catch {}
}

/**
 * African case studies mapped per system
 */
const CASE_STUDIES = {
  interdependency: {
    company: "Dangote Group (Nigeria)",
    summary: "Dangote noticed that their cement, refinery, and sugar divisions were working in silos — teams weren't talking to each other, and it was slowing everything down. They brought in weekly triage meetings and shared playbooks so everyone knew who owned what. They tracked how long things actually took from start to finish.",
    result: "Within about 18 months, their top projects were getting done roughly 35% faster than before."
  },
  inlignment: {
    company: "Safaricom (Kenya)",
    summary: "Safaricom realised that while leadership had a clear vision for growing M-Pesa, many teams didn't really know how their daily work connected to that bigger picture. They started running quarterly goal-setting sessions that flowed from the top down, paired with honest culture-fit check-ins and coaching for senior leaders.",
    result: "Revenue went up 14% that year, and when they surveyed staff, the number of people who felt aligned with the company's direction jumped from 62% to 84%."
  },
  investigation: {
    company: "MTN Group (South Africa)",
    summary: "MTN had a problem across their 21 country operations — when things went wrong, people pointed fingers instead of digging into what actually caused the issue. They replaced the blame game with proper post-mortems where teams looked at the facts together and asked 'why did this happen?' instead of 'whose fault is this?'",
    result: "Network outages dropped by 40% in just 9 months because they were actually fixing the root causes, not just patching symptoms."
  },
  orchestration: {
    company: "Flutterwave (Nigeria)",
    summary: "Flutterwave was growing fast, but their product teams were struggling to keep up. New payment features took too long to ship because teams worked in isolation and feedback came too late. They reorganised into small, mixed-skill squads that could test ideas quickly and adjust based on what users actually needed.",
    result: "New features that used to take 8 weeks to launch were going live in about 2 and a half weeks."
  },
  illustration: {
    company: "Standard Bank (South Africa)",
    summary: "With operations across 20 countries, Standard Bank found that different teams often had completely different understandings of the same strategy. They started using visual maps and clear storytelling to make complex plans simple, so new hires and existing staff could all see the same picture.",
    result: "Teams understood the strategy 30% better, and it took 25% less time to bring new people up to speed."
  },
  interpretation: {
    company: "Andela (Pan-African)",
    summary: "Andela's engineering teams were spread across multiple African countries, and different offices often interpreted the same data in completely different ways. They ran workshops to help people frame insights consistently and filter out noise from real signals, so decisions were based on shared understanding rather than individual guesswork.",
    result: "Decision quality went up 28%, and confidence in data-driven choices jumped from 55% to 82% across the organisation."
  }
};

/**
 * Derive insights, recommendations, forecasts, and component scores from meta.subScores
 */
function enrichMeta(meta, systemId, overallScore) {
  const subScores = meta.subScores || [];
  const interp = meta.interpretation || {};

  // Build component scores from sub-assessments
  const components = {};
  subScores.forEach(sub => {
    const pct = sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : (sub.percent || 0);
    components[sub.title] = pct;
  });

  // Sort subs by score ascending to find weakest areas
  const sorted = [...subScores].sort((a, b) => {
    const pctA = a.max > 0 ? a.score / a.max : 0;
    const pctB = b.max > 0 ? b.score / b.max : 0;
    return pctA - pctB;
  });
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];

  // Generate insights from actual data — written in plain, human language
  const insights = [];
  if (interp.rating) insights.push(`Your organisation scored at the "${interp.rating}" level for this system.`);
  if (interp.interpretation) insights.push(interp.interpretation);
  if (strongest) {
    const sPct = strongest.max > 0 ? Math.round((strongest.score / strongest.max) * 100) : 0;
    insights.push(`Your strongest area is ${strongest.title}, where you scored ${sPct}%. ${strongest.interpretation?.rating ? `This puts you in the "${strongest.interpretation.rating}" category — keep doing what you're doing here.` : "This is solid — keep it up."}`);
  }
  if (weakest && weakest !== strongest) {
    const wPct = weakest.max > 0 ? Math.round((weakest.score / weakest.max) * 100) : 0;
    insights.push(`The area that needs the most attention is ${weakest.title}, sitting at ${wPct}%. ${weakest.interpretation?.rating ? `That's a "${weakest.interpretation.rating}" rating — worth prioritising.` : "This is where you'll want to focus first."}`);
  }
  // Add plain-language notes for the weakest areas
  sorted.slice(0, 2).forEach(sub => {
    if (sub.interpretation?.interpretation) {
      insights.push(`About ${sub.title} — ${sub.interpretation.interpretation}`);
    }
  });

  // Generate recommendations (Short / Mid / Long horizon) from sub-assessment data
  const shortItems = [];
  const midItems = [];
  const longItems = [];

  subScores.forEach(sub => {
    const pct = sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : 0;
    const recs = sub.interpretation?.recommendations || [];
    if (pct < 50) {
      shortItems.push(...recs.slice(0, 2).map(r => `For ${sub.title}: ${r}`));
    } else if (pct < 75) {
      midItems.push(...recs.slice(0, 1).map(r => `For ${sub.title}: ${r}`));
    } else {
      longItems.push(`${sub.title} is in good shape — keep doing what's working and check in on it regularly`);
    }
  });

  // If overall interpretation has recommendations, add them
  if (interp.recommendations && Array.isArray(interp.recommendations)) {
    shortItems.push(...interp.recommendations.slice(0, 2));
  }

  // Ensure each bucket has at least one item
  if (!shortItems.length) shortItems.push("Look at the lowest-scoring areas first and decide who should own each one");
  if (!midItems.length) midItems.push("Pick 2–3 areas scoring in the middle range and run focused improvement efforts over the next couple of months");
  if (!longItems.length) longItems.push("Build a habit of regularly checking back in on these areas — it's about making improvement stick, not just a one-time fix");

  const recommendations = [
    { title: "Do this now (next 4 weeks)", items: shortItems.slice(0, 4) },
    { title: "Work on over the next few months", items: midItems.slice(0, 4) },
    { title: "Keep an eye on over the next year", items: longItems.slice(0, 4) }
  ];

  // Generate forecasts based on score — written to sound like advice from a trusted advisor
  const forecasts = [];
  if (overallScore < 40) {
    forecasts.push({ horizon: "Next 4 weeks", text: "This needs your attention right away. If these gaps stay open, you'll keep running into delays and friction across teams. The good news is that quick wins are possible if someone takes ownership now." });
    forecasts.push({ horizon: "Next 3 months", text: "With focused effort on the weak spots, you could see real progress here. The key is assigning clear owners and checking in weekly — don't let it drift." });
    forecasts.push({ horizon: "Over the next year", text: "Lasting change here means looking at the deeper stuff — your processes, how people are measured, and what behaviours your culture rewards. It's a journey, but it's worth starting." });
  } else if (overallScore < 65) {
    forecasts.push({ horizon: "Next 4 weeks", text: "You're not in crisis, but there's room to tighten things up. Pick the weakest area, make a small change, and watch what happens. Quick wins build momentum." });
    forecasts.push({ horizon: "Next 3 months", text: "If you stay consistent with the improvements, you should see noticeable progress in at least 2–3 areas. Don't try to fix everything at once — focus beats breadth." });
    forecasts.push({ horizon: "Over the next year", text: "This system can move up a tier with steady effort. The trick is making improvement part of the routine, not a one-off project." });
  } else if (overallScore < 85) {
    forecasts.push({ horizon: "Next 4 weeks", text: "Things are working well here. This is about fine-tuning, not overhauling. Look for the small adjustments that can take you from good to great." });
    forecasts.push({ horizon: "Next 3 months", text: "Keep building on what's working. Cross-team collaboration and regular check-ins will help you stay on track and catch any slippage early." });
    forecasts.push({ horizon: "Over the next year", text: "You're well-positioned to be among the best. Stay the course and you'll likely see this become one of your organisation's standout strengths." });
  } else {
    forecasts.push({ horizon: "Next 4 weeks", text: "Excellent work here — your team clearly has this area dialled in. The focus now should be on documenting what's working so others can learn from it." });
    forecasts.push({ horizon: "Next 3 months", text: "Keep the rhythm going. Look for opportunities to share these practices with other teams or departments that might benefit." });
    forecasts.push({ horizon: "Over the next year", text: "This is already at a very high level. Consider using this area as a model for the rest of the organisation — it shows what's possible when things click." });
  }

  // Case study
  const caseStudy = CASE_STUDIES[systemId] || CASE_STUDIES.interdependency;

  return {
    ...meta,
    insights,
    recommendations,
    forecasts,
    caseStudy,
    components
  };
}

export function ingestAssessment(result = {}) {
  try {
    const orgId = result.orgId || "anon";
    const systemId = result.systemId || result.system || "general";

    const meta = result.meta || {};

    const networkDensity = typeof meta.networkDensity === "number" ? Math.max(0, Math.min(1, meta.networkDensity)) : (Number(result.score) ? Math.min(1, result.score / 100) : 0.5);
    const rawSent = typeof meta.sentiment === "number" ? meta.sentiment : null; // expected -1..1
    const sentiment = rawSent !== null ? Math.max(0, Math.min(1, (rawSent + 1) / 2)) : Math.min(1, (Number(result.score) || 0) / 100);
    const operational = typeof meta.operational === "number" ? Math.max(0, Math.min(1, meta.operational)) : Math.min(1, (Number(result.score) || 0) / 100);

    // Choose weights depending on system
    const defaultWeights = { networkDensity: 0.4, sentiment: 0.3, operational: 0.3 };
    let weights = defaultWeights;

    // Example per-system custom weights
    const systemWeights = {
      interdependency: { networkDensity: 0.6, sentiment: 0.2, operational: 0.2 },
      investigation: { networkDensity: 0.2, sentiment: 0.2, operational: 0.6 },
      inlignment: { networkDensity: 0.2, sentiment: 0.4, operational: 0.4 },
      orchestration: { networkDensity: 0.3, sentiment: 0.2, operational: 0.5 },
      illustration: { networkDensity: 0.2, sentiment: 0.5, operational: 0.3 },
      interpretation: { networkDensity: 0.2, sentiment: 0.5, operational: 0.3 }
    };
    if (systemWeights[systemId]) weights = systemWeights[systemId];

    const metrics = {
      networkDensity,
      sentiment,
      operational
    };

    const score = computeSystemScore(metrics, weights);

    const out = {
      id: result.id || `oh-${Date.now().toString(36)}`,
      orgId,
      systemId,
      score,
      breakdown: metrics,
      provenance: {
        sourceAssessmentId: result.id,
        algorithmVersion: "orghealth-v1",
        createdAt: Date.now()
      },
      timestamp: Date.now(),
      // keep original result for traceability — enriched with derived data
      original: {
        title: result.title,
        owner: result.owner,
        meta: enrichMeta(result.meta || {}, systemId, score)
      }
    };

    // Persist result
    saveResult(orgId, out);

    const recommendation = {
      id: `rec-${Date.now().toString(36)}`,
      title: `Take a closer look at ${systemId} — scored ${score}%`,
      summary: `Your ${systemId} system came in at ${score}%. Here's what drove that score: ${Object.entries(metrics).map(([k, v]) => `${k} at ${Math.round(v * 100)}%`).join(", ")}.`,
      impact: score < 60 ? "This is a high-priority area — leaving it unaddressed could cause real problems" : score < 75 ? "Worth some attention, but not urgent" : "Looking good — just keep an eye on it",
      severity: score < 60 ? "warning" : "improvement",
      predictions: {
        short: score < 60 ? "In the short term, expect some friction and delays if this isn't addressed" : "Things should stay stable in the short term",
        mid: score < 60 ? "Over the next few months, this could slow your team down if nothing changes" : "Keep up the good work and you'll see continued progress",
        long: "Over the long term, keep tracking this to spot any changes early"
      },
      evidence: [
        `Based on the ${result.id} assessment results`,
        ...(result.meta && result.meta.notes ? [result.meta.notes] : [])
      ],
      comparables: [],
      recommendedMeeting: {
        title: `Team sync on ${systemId}`,
        urgency: score < 60 ? "Soon — this week if possible" : "Within the next couple of weeks",
        attendees: ["Head of Product", "Head of Engineering", "Ops Lead"],
        proposedDurationMin: 45,
        agenda: ["Walk through the findings together", "Decide who owns what", "Agree on next steps and a check-in date"]
      },
      source: `${systemId} assessment`,
      createdAt: Date.now()
    };

    // Emit recommendation event for UI to pick up
    try {
      window.dispatchEvent(new CustomEvent("conseqx:orghealth:recommendation", { detail: { orgId, recommendations: [recommendation] } }));
    } catch {}

    return out;
  } catch (e) {
    // swallow errors (non-fatal) — real service should surface logs
    console.error("orgHealth.ingestAssessment error", e);
    return null;
  }
}

/**
 * Return persisted results for an org
 */
export function getResults(orgId) {
  const all = readAll();
  return all[orgId] || [];
}
