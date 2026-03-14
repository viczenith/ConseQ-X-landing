/**
 * 28-Parameter Analytical Framework for ConseQ-X
 *
 * Each parameter defines:
 *  - id / title / category
 *  - subMetrics: the specific indicators the CEO should track
 *  - relatedSystems: which of the 6 ConseQ-X systems influence this parameter
 *  - evaluationSource: where data comes from (assessment, upload, chat, or manual)
 *  - weight: relative importance for overall org health (1-5)
 */

export const PARAMETER_CATEGORIES = {
  STRATEGIC: "Strategic & Foundational",
  OPERATIONAL: "Operational & Process",
  PEOPLE: "People & Culture",
  FINANCIAL: "Financial & Resources",
  EXTERNAL: "External & Market",
};

export const parameters28 = [
  // ─── Strategic & Foundational (1-8) ───
  {
    id: "industry_dynamics",
    number: 1,
    title: "Industry Dynamics",
    subtitle: "Market trends and competition",
    category: PARAMETER_CATEGORIES.EXTERNAL,
    subMetrics: [
      "Market growth rate and trajectory",
      "Competitive positioning and market share",
      "Industry disruption threats",
      "Regulatory changes affecting the sector",
      "Key competitor moves and strategies",
    ],
    relatedSystems: ["interdependency", "orchestration"],
    evaluationSource: ["upload", "chat"],
    weight: 4,
  },
  {
    id: "founding_roots",
    number: 2,
    title: "Founding Roots",
    subtitle: "Mission and historical context",
    category: PARAMETER_CATEGORIES.STRATEGIC,
    subMetrics: [
      "Clarity and relevance of founding mission",
      "Alignment of current operations with original vision",
      "Historical decisions that shaped the organization",
      "Cultural DNA from founding era",
    ],
    relatedSystems: ["inlignment", "interpretation"],
    evaluationSource: ["upload", "assessment"],
    weight: 2,
  },
  {
    id: "organization",
    number: 3,
    title: "Organization",
    subtitle: "Size, locations, complexity",
    category: PARAMETER_CATEGORIES.STRATEGIC,
    subMetrics: [
      "Number of employees and locations",
      "Organizational complexity index",
      "Decision-making layers",
      "Geographic spread and coordination challenges",
    ],
    relatedSystems: ["interdependency", "orchestration"],
    evaluationSource: ["upload", "chat"],
    weight: 3,
  },
  {
    id: "leadership",
    number: 4,
    title: "Leadership",
    subtitle: "Styles and decision-making",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Leadership style distribution",
      "Decision-making speed and quality",
      "Leadership bench strength",
      "CEO-to-frontline communication effectiveness",
    ],
    relatedSystems: ["inlignment", "illustration", "interpretation"],
    evaluationSource: ["assessment", "chat"],
    weight: 5,
  },
  {
    id: "culture",
    number: 5,
    title: "Culture",
    subtitle: "Values and behaviors",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Stated values vs. lived behaviors",
      "Psychological safety index",
      "Collaboration vs. silo tendency",
      "Change receptiveness",
    ],
    relatedSystems: ["inlignment", "investigation"],
    evaluationSource: ["assessment"],
    weight: 4,
  },
  {
    id: "innovation",
    number: 6,
    title: "Innovation",
    subtitle: "New ideas and adaptability",
    category: PARAMETER_CATEGORIES.STRATEGIC,
    subMetrics: [
      "R&D investment as % of revenue",
      "Time from idea to implementation",
      "Number of new initiatives launched",
      "Innovation success rate",
    ],
    relatedSystems: ["orchestration", "investigation"],
    evaluationSource: ["assessment", "upload"],
    weight: 4,
  },
  {
    id: "strategy",
    number: 7,
    title: "Strategy",
    subtitle: "Goals and plans",
    category: PARAMETER_CATEGORIES.STRATEGIC,
    subMetrics: [
      "Strategic clarity score",
      "Strategy-to-execution gap",
      "Strategic planning cadence",
      "Competitive differentiation strength",
    ],
    relatedSystems: ["inlignment", "illustration"],
    evaluationSource: ["assessment", "upload"],
    weight: 5,
  },
  {
    id: "structure",
    number: 8,
    title: "Structure",
    subtitle: "Hierarchy and team setup",
    category: PARAMETER_CATEGORIES.OPERATIONAL,
    subMetrics: [
      "Span of control ratios",
      "Hierarchy depth vs. agility",
      "Cross-functional team effectiveness",
      "Reporting line clarity",
    ],
    relatedSystems: ["inlignment", "interdependency"],
    evaluationSource: ["assessment", "upload"],
    weight: 3,
  },

  // ─── Operational & Process (9-12) ───
  {
    id: "processes",
    number: 9,
    title: "Processes",
    subtitle: "Workflows, procedures, and routines",
    category: PARAMETER_CATEGORIES.OPERATIONAL,
    subMetrics: [
      "Process documentation completeness",
      "Process compliance rate",
      "Cycle time for key workflows",
      "Process improvement frequency",
    ],
    relatedSystems: ["orchestration", "investigation"],
    evaluationSource: ["assessment"],
    weight: 4,
  },
  {
    id: "dynamic_behavior",
    number: 10,
    title: "Dynamic Behavior",
    subtitle: "Adaptability, Speed, Agility",
    category: PARAMETER_CATEGORIES.OPERATIONAL,
    subMetrics: [
      "Response time to market changes",
      "Pivot speed on failing initiatives",
      "Crisis response effectiveness",
      "Organizational agility score",
    ],
    relatedSystems: ["orchestration", "interdependency"],
    evaluationSource: ["assessment", "chat"],
    weight: 4,
  },
  {
    id: "technology",
    number: 11,
    title: "Technology",
    subtitle: "Tools and infrastructure",
    category: PARAMETER_CATEGORIES.OPERATIONAL,
    subMetrics: [
      "Technology stack modernization level",
      "Digital transformation progress",
      "System integration completeness",
      "Technology adoption rate by staff",
    ],
    relatedSystems: ["orchestration", "illustration"],
    evaluationSource: ["upload", "chat"],
    weight: 3,
  },
  {
    id: "risk",
    number: 12,
    title: "Risk",
    subtitle: "Challenges, opportunities, and vulnerabilities",
    category: PARAMETER_CATEGORIES.STRATEGIC,
    subMetrics: [
      "Risk register completeness",
      "Risk mitigation effectiveness",
      "Opportunity identification rate",
      "Vulnerability exposure level",
    ],
    relatedSystems: ["investigation", "interpretation"],
    evaluationSource: ["assessment", "upload"],
    weight: 4,
  },

  // ─── People & Skills (13, 14, 18) ───
  {
    id: "skills",
    number: 13,
    title: "Skills",
    subtitle: "Capabilities and training",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Skills gap analysis score",
      "Training hours per employee",
      "Certification and competency rates",
      "Critical skills coverage",
    ],
    relatedSystems: ["orchestration", "interdependency"],
    evaluationSource: ["upload", "chat"],
    weight: 3,
  },
  {
    id: "resources",
    number: 14,
    title: "Resources",
    subtitle: "Budgets and assets",
    category: PARAMETER_CATEGORIES.FINANCIAL,
    subMetrics: [
      "Budget allocation vs. strategic priorities",
      "Asset utilization rate",
      "Resource availability for key initiatives",
      "Capital expenditure efficiency",
    ],
    relatedSystems: ["orchestration", "inlignment"],
    evaluationSource: ["upload"],
    weight: 4,
  },

  // ─── External (15, 16, 17) ───
  {
    id: "environment",
    number: 15,
    title: "Environment",
    subtitle: "Economic conditions & Regulatory",
    category: PARAMETER_CATEGORIES.EXTERNAL,
    subMetrics: [
      "Macroeconomic impact assessment",
      "Regulatory compliance readiness",
      "Foreign exchange exposure",
      "Political/policy risk level",
    ],
    relatedSystems: ["interpretation", "investigation"],
    evaluationSource: ["upload", "chat"],
    weight: 3,
  },
  {
    id: "goals",
    number: 16,
    title: "Goals",
    subtitle: "Objectives and Priorities",
    category: PARAMETER_CATEGORIES.STRATEGIC,
    subMetrics: [
      "Goal clarity and measurability",
      "Goal cascade effectiveness (CEO → frontline)",
      "Progress tracking cadence",
      "Goal achievement rate",
    ],
    relatedSystems: ["inlignment", "illustration"],
    evaluationSource: ["assessment", "upload"],
    weight: 4,
  },
  {
    id: "policy",
    number: 17,
    title: "Policy",
    subtitle: "Rules, compliance, and guidelines",
    category: PARAMETER_CATEGORIES.OPERATIONAL,
    subMetrics: [
      "Policy coverage completeness",
      "Policy compliance rate",
      "Policy review and update frequency",
      "Regulatory alignment score",
    ],
    relatedSystems: ["investigation", "orchestration"],
    evaluationSource: ["upload"],
    weight: 3,
  },
  {
    id: "staff_people",
    number: 18,
    title: "Staff & People",
    subtitle: "Roles, responsibility and engagement",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Role clarity score",
      "Responsibility assignment matrix (RACI) coverage",
      "Employee engagement index",
      "Internal mobility and growth opportunities",
    ],
    relatedSystems: ["interdependency", "inlignment"],
    evaluationSource: ["assessment", "upload"],
    weight: 4,
  },

  // ─── Detailed Composite Parameters (19-28) ───
  {
    id: "financials",
    number: 19,
    title: "Financials & Financial Stability",
    subtitle: "Revenue, Profit, Cash Flow, Debt, Costs, Investment",
    category: PARAMETER_CATEGORIES.FINANCIAL,
    subMetrics: [
      "Revenue growth rate",
      "Profit margins (gross, operating, net)",
      "Cash flow and liquidity ratio",
      "Debt levels and creditworthiness",
      "Cost structure efficiency",
      "Investment returns (ROIC)",
    ],
    relatedSystems: ["orchestration", "inlignment"],
    evaluationSource: ["upload"],
    weight: 5,
  },
  {
    id: "operational_efficiency",
    number: 20,
    title: "Operational Efficiency",
    subtitle: "Productivity, Process, Utilization, Delivery",
    category: PARAMETER_CATEGORIES.OPERATIONAL,
    subMetrics: [
      "Productivity metrics (revenue per employee)",
      "Process efficiency (waste reduction)",
      "Resource utilization rate",
      "Response and delivery times",
    ],
    relatedSystems: ["orchestration", "interdependency"],
    evaluationSource: ["assessment", "upload"],
    weight: 5,
  },
  {
    id: "employee_engagement",
    number: 21,
    title: "Employee Engagement & Satisfaction",
    subtitle: "Turnover, Engagement, Training, Morale",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Employee turnover rate",
      "Engagement survey scores",
      "Training and development participation",
      "Workplace morale and culture indicators",
    ],
    relatedSystems: ["inlignment", "interdependency"],
    evaluationSource: ["upload", "chat"],
    weight: 4,
  },
  {
    id: "leadership_effectiveness",
    number: 22,
    title: "Leadership Effectiveness",
    subtitle: "Stability, Succession, Communication, Decision Quality",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Leadership stability and credibility",
      "Succession planning effectiveness",
      "Communication transparency",
      "Decision-making speed and quality",
    ],
    relatedSystems: ["inlignment", "illustration", "interpretation"],
    evaluationSource: ["assessment", "chat"],
    weight: 5,
  },
  {
    id: "customer_satisfaction",
    number: 23,
    title: "Customer Satisfaction & Loyalty",
    subtitle: "Retention, NPS, Complaints, Satisfaction",
    category: PARAMETER_CATEGORIES.EXTERNAL,
    subMetrics: [
      "Customer retention and churn rates",
      "Net Promoter Score (NPS)",
      "Customer complaints and resolution rates",
      "Customer satisfaction survey results",
    ],
    relatedSystems: ["interdependency", "orchestration"],
    evaluationSource: ["upload", "chat"],
    weight: 5,
  },
  {
    id: "innovation_adaptability",
    number: 24,
    title: "Innovation & Adaptability",
    subtitle: "R&D, Adoption Speed, Flexibility, Competitiveness",
    category: PARAMETER_CATEGORIES.STRATEGIC,
    subMetrics: [
      "Investment in R&D or new initiatives",
      "Speed of innovation adoption",
      "Flexibility and resilience in adapting to change",
      "Market competitiveness and product relevance",
    ],
    relatedSystems: ["orchestration", "investigation"],
    evaluationSource: ["assessment", "upload"],
    weight: 4,
  },
  {
    id: "org_culture_alignment",
    number: 25,
    title: "Organizational Culture & Alignment",
    subtitle: "Vision-Execution, Role Clarity, Collaboration, Values",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Alignment of vision, strategy, and execution (strategic clarity)",
      "Employee alignment to organizational goals",
      "Cohesiveness and collaboration across departments",
      "Values integration and integrity",
    ],
    relatedSystems: ["inlignment", "illustration", "interdependency"],
    evaluationSource: ["assessment"],
    weight: 5,
  },
  {
    id: "compliance_risk",
    number: 26,
    title: "Compliance & Risk Management",
    subtitle: "Regulatory, Safety, Risk Exposure, Ethics",
    category: PARAMETER_CATEGORIES.OPERATIONAL,
    subMetrics: [
      "Regulatory compliance rates",
      "Incident reports and safety records",
      "Risk exposure and mitigation effectiveness",
      "Ethical standards adherence",
    ],
    relatedSystems: ["investigation", "interpretation"],
    evaluationSource: ["upload"],
    weight: 4,
  },
  {
    id: "talent_management",
    number: 27,
    title: "Talent Management & Retention",
    subtitle: "Pipeline, Succession, Competency, Performance",
    category: PARAMETER_CATEGORIES.PEOPLE,
    subMetrics: [
      "Talent pipeline robustness",
      "Succession planning effectiveness",
      "Competency and skills alignment",
      "Performance management outcomes",
    ],
    relatedSystems: ["inlignment", "interdependency"],
    evaluationSource: ["upload", "chat"],
    weight: 4,
  },
  {
    id: "market_reputation",
    number: 28,
    title: "Market Reputation & Brand Strength",
    subtitle: "Perception, Media, Brand, CSR",
    category: PARAMETER_CATEGORIES.EXTERNAL,
    subMetrics: [
      "Industry perception and reputation score",
      "Media sentiment and public relations indicators",
      "Brand visibility and equity",
      "Community relations and CSR impact",
    ],
    relatedSystems: ["illustration", "interpretation"],
    evaluationSource: ["upload", "chat"],
    weight: 3,
  },
];

/**
 * Derive parameter scores from the 6-system assessment scores.
 * Each parameter's score = weighted average of its related systems' scores.
 * Parameters that require uploaded data (evaluationSource includes only "upload")
 * get a special "data_needed" status.
 *
 * @param {Object} systemScores - { systemId: { systemScore, maxSystemScore, ... } }
 * @returns {Array} - enriched parameters with computed scores
 */
export function evaluateParameters(systemScores) {
  const sysPcts = {};
  for (const [id, data] of Object.entries(systemScores)) {
    sysPcts[id] = data.maxSystemScore > 0
      ? Math.round((data.systemScore / data.maxSystemScore) * 100)
      : null;
  }

  return parameters28.map(param => {
    const hasAssessmentSource = param.evaluationSource.includes("assessment");
    const relatedScores = param.relatedSystems
      .map(sysId => sysPcts[sysId])
      .filter(s => s !== null && s !== undefined);

    if (relatedScores.length === 0 && !hasAssessmentSource) {
      return {
        ...param,
        score: null,
        status: "data_needed",
        statusLabel: "Upload data to evaluate",
        confidence: 0,
      };
    }

    if (relatedScores.length === 0) {
      return {
        ...param,
        score: null,
        status: "not_assessed",
        statusLabel: "Complete related assessments",
        confidence: 0,
      };
    }

    const avgScore = Math.round(relatedScores.reduce((a, b) => a + b, 0) / relatedScores.length);
    const confidence = Math.round((relatedScores.length / param.relatedSystems.length) * 100);

    let status, statusLabel;
    if (avgScore >= 70) { status = "strong"; statusLabel = "Strong"; }
    else if (avgScore >= 40) { status = "needs_work"; statusLabel = "Needs Work"; }
    else { status = "critical"; statusLabel = "Critical"; }

    return {
      ...param,
      score: avgScore,
      status,
      statusLabel,
      confidence,
    };
  });
}

/**
 * Group evaluated parameters by category for display.
 */
export function groupParametersByCategory(evaluatedParams) {
  const groups = {};
  for (const param of evaluatedParams) {
    const cat = param.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(param);
  }
  return groups;
}

/**
 * Compute overall parameter health summary.
 */
export function getParameterSummary(evaluatedParams) {
  const scored = evaluatedParams.filter(p => p.score !== null);
  const avgScore = scored.length > 0
    ? Math.round(scored.reduce((s, p) => s + p.score, 0) / scored.length)
    : 0;
  const critical = scored.filter(p => p.status === "critical").length;
  const needsWork = scored.filter(p => p.status === "needs_work").length;
  const strong = scored.filter(p => p.status === "strong").length;
  const dataNeeded = evaluatedParams.filter(p => p.status === "data_needed").length;
  const notAssessed = evaluatedParams.filter(p => p.status === "not_assessed").length;

  return {
    totalParameters: 28,
    assessed: scored.length,
    avgScore,
    critical,
    needsWork,
    strong,
    dataNeeded,
    notAssessed,
    coveragePercent: Math.round((scored.length / 28) * 100),
  };
}
