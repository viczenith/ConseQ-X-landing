export const rubrics = {
  ///////////////////////////
  // System of Alignment  //
  ///////////////////////////
  systemAlignment: {
    id: 'systemAlignment',
    title: 'System of Alignment',
    sections: [
      // 1. Vision‑to‑Behavior Alignment Test
      {
        key: 'visionBehavior',
        title: 'Vision‑to‑Behavior Alignment Test',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do employees regularly reference the vision or mission in discussions or meetings?' },
          { key: 'q2', text: 'Do leaders model the vision in both behavior and decision logic?' },
          { key: 'q3', text: 'Do performance reviews or team rituals reinforce the vision?' },
          { key: 'q4', text: 'Is it clear how each role contributes to realizing the vision?' },
          { key: 'q5', text: 'Are employees recognized for actions that align with the mission?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Vision‑Driven Culture' },
          { min: 16, max: 20, rating: 'Mostly Aligned' },
          { min: 11, max: 15, rating: 'Patchy Alignment' },
          { min: 5,  max: 10, rating: 'Disconnected' }
        ]
      },                                                                        
      // 2. Goal Harmony Assessment
      {
        key: 'goalHarmony',
        title: 'Goal Harmony Assessment',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do individuals know how their goals link to organizational strategy?' },
          { key: 'q2', text: 'Are departmental goals explicitly derived from strategic goals?' },
          { key: 'q3', text: 'Do leaders discuss strategy during goal setting?' },
          { key: 'q4', text: 'Are team KPIs tracked alongside strategic metrics?' },
          { key: 'q5', text: 'Do teams collaborate on joint success metrics?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Unified Goal System' },
          { min: 16, max: 20, rating: 'Partially Cascaded' },
          { min: 11, max: 15, rating: 'Fragmented Targets' },
          { min: 5,  max: 10, rating: 'Goal Chaos' }
        ]
      },                                                                        
      // 3. Structural‑Strategy Fit Review
      {
        key: 'structuralStrategy',
        title: 'Structural‑Strategy Fit Review',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do teams understand how their role aligns with strategic priorities?' },
          { key: 'q2', text: 'Do decision rights align with speed and priority of tasks?' },
          { key: 'q3', text: 'Are spans of control manageable for effective oversight?' },
          { key: 'q4', text: 'Do cross‑functional collaborations flow without hierarchy blocks?' },
          { key: 'q5', text: 'Is structure reviewed when strategy shifts?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Optimal Strategic Fit' },
          { min: 16, max: 20, rating: 'Mostly Supportive' },
          { min: 11, max: 15, rating: 'Misaligned Architecture' },
          { min: 5,  max: 10, rating: 'Structure–Strategy Conflict' }
        ]
      },                                                                        
      // 4. Cultural Fit to Execution Index
      {
        key: 'culturalFit',
        title: 'Cultural Fit to Execution Index',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do cultural norms reward delivery, not just effort or loyalty?' },
          { key: 'q2', text: 'Are decisions made with clarity and speed?' },
          { key: 'q3', text: 'Are risk‑taking and initiative encouraged by culture?' },
          { key: 'q4', text: 'Are accountability systems consistent with stated values?' },
          { key: 'q5', text: 'Do teams operate with urgency where needed?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Culture Accelerates Execution' },
          { min: 16, max: 20, rating: 'Supportive But Slow' },
          { min: 11, max: 15, rating: 'Contradictory Culture' },
          { min: 5,  max: 10, rating: 'Toxic or Confused Culture' }
        ]
      },                                                                        
      // 5. Incentive System Coherence Test
      {
        key: 'incentiveCoherence',
        title: 'Incentive System Coherence Test',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are incentives linked directly to strategic goals or KPIs?' },
          { key: 'q2', text: 'Do rewards encourage teamwork and shared results?' },
          { key: 'q3', text: 'Is reward fairness perceived and supported by transparency?' },
          { key: 'q4', text: 'Have incentives led to undesired behaviors (e.g., hoarding)?' },
          { key: 'q5', text: 'Has employee feedback led to updates in incentive design?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Strategic Incentive Engine' },
          { min: 16, max: 20, rating: 'Mostly Supportive Rewards' },
          { min: 11, max: 15, rating: 'Misguided or Mixed Signals' },
          { min: 5,  max: 10, rating: 'Disruptive Incentives' }
        ]
      }
    ],
    // Overall sum interpretation
    totalRanges: [
      { min: 105, max: 125, rating: 'Systemically Aligned' },
      { min: 85,  max: 104, rating: 'Operationally Aligned' },
      { min: 65,  max: 84,  rating: 'Fragmented Alignment' },
      { min: 5,   max: 64,  rating: 'Systemic Misalignment' }
    ]
  },

  //////////////////////////////////////////////////////
  // System of Interdependency & Interaction         //
  //////////////////////////////////////////////////////
  systemInterdependency: {
    id: 'systemInterdependency',
    title: 'System of Interdependency & Interaction',
    sections: [
      // 1. Core Response Behaviors (CRBs)
      {
        key: 'coreResponseBehaviors',
        title: 'Core Response Behaviors (CRBs)',
        weight: 10,
        questions: [
          { key: 'q1',  text: 'Does your organization quickly adjust its strategy in response to emerging crises?' },
          { key: 'q2',  text: 'Does your team document and review lessons from past crises?' },
          { key: 'q3',  text: 'Are unconventional solutions welcomed during high‑pressure moments?' },
          { key: 'q4',  text: 'Do crisis‑time decisions reflect your core values?' },
          { key: 'q5',  text: 'Is integrity upheld during crisis response?' },
          { key: 'q6',  text: 'Does leadership messaging remain consistent and values‑driven?' },
          { key: 'q7',  text: 'Do responses result in long‑term resolution?' },
          { key: 'q8',  text: 'Is reputational damage minimized or reversed?' },
          { key: 'q9',  text: 'Do stakeholders express increased confidence after crises?' },
          { key: 'q10', text: 'Are risks identified and addressed before they escalate?' },
          { key: 'q11', text: 'Does your organization take early action during instability?' },
          { key: 'q12', text: 'Is scenario planning or war‑gaming used for preparedness?' },
          { key: 'q13', text: 'Do cross‑functional teams collaborate clearly during crises?' },
          { key: 'q14', text: 'Are team roles clear during high‑stakes events?' },
          { key: 'q15', text: 'Is there a no‑blame, solution‑focus culture during setbacks?' }
        ],
        scoring: { yes: 10, notSure: 5, no: 1 },
        ranges: [
          { min: 40, max: 50, rating: 'Highly Constructive CRBs' },
          { min: 25, max: 39, rating: 'Moderate CRBs' },
          { min: 10, max: 24, rating: 'Detrimental CRBs' }
        ]
      },                                                                        
      // 2. Internal Client Satisfaction
      {
        key: 'internalClientSat',
        title: 'Internal Client Satisfaction',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are service requests typically acknowledged within 24 hours?' },
          { key: 'q2', text: 'Do service teams inform clients of delays or issues?' },
          { key: 'q3', text: 'Is final output reviewed for accuracy before delivery?' },
          { key: 'q4', text: 'Do teams communicate clear deliverables, timelines, and scope?' },
          { key: 'q5', text: 'Is there a process for internal clients to raise concerns?' },
          { key: 'q6', text: 'Have internal clients expressed appreciation for professionalism?' },
          { key: 'q7', text: 'Do teams offer solutions beyond the original request?' },
          { key: 'q8', text: 'Are deliverables aligned with client goals?' },
          { key: 'q9', text: 'Are clients regularly engaged for feedback?' },
          { key: 'q10', text: 'Has feedback led to service improvements?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 41, max: 50, rating: 'Excellent Service Culture' },
          { min: 31, max: 40, rating: 'Good But Uneven' },
          { min: 21, max: 30, rating: 'Needs Redesign' },
          { min: 10, max: 20, rating: 'Service Dysfunction' }
        ]
      },                                                                        
      // 3. Dependency Mapping
      {
        key: 'dependencyMapping',
        title: 'Dependency Mapping',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Is each dependency’s purpose defined and agreed?' },
          { key: 'q2', text: 'Is the relationship documented (SOPs, RACI, SLAs)?' },
          { key: 'q3', text: 'Would failure of this dependency cause serious disruption?' },
          { key: 'q4', text: 'Is communication structured and frequent?' },
          { key: 'q5', text: 'Are responses within an agreed turnaround time?' },
          { key: 'q6', text: 'Has dependency quality improved in the last 6 months?' },
          { key: 'q7', text: 'Are risks of disruption identified and documented?' },
          { key: 'q8', text: 'Have dependency failures resulted in missed goals or rework?' },
          { key: 'q9', text: 'Is there a feedback mechanism between teams?' },
          { key: 'q10', text: 'Has this dependency been reviewed cross‑functionally in the last year?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 41, max: 50, rating: 'Healthy & Resilient' },
          { min: 31, max: 40, rating: 'Stable but Needs Attention' },
          { min: 21, max: 30, rating: 'Vulnerable or Misaligned' },
          { min: 10, max: 20, rating: 'High‑Risk Dependency' }
        ]
      },                                                                        
      // 4. Cross‑Team Trust & Flow Index
      {
        key: 'trustFlow',
        title: 'Cross‑Team Trust & Flow Index',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do teams address breakdowns directly before escalating?' },
          { key: 'q2', text: 'Are requests and feedback acknowledged within 24 hours?' },
          { key: 'q3', text: 'Are joint goals reviewed together, not separately?' },
          { key: 'q4', text: 'Is there a routine for cross‑team engagement?' },
          { key: 'q5', text: 'Do teams resolve disagreements through open dialogue?' },
          { key: 'q6', text: 'Have both teams co‑designed or retro‑reviewed together?' },
          { key: 'q7', text: 'Do teams share information proactively?' },
          { key: 'q8', text: 'Do teams express confidence in each other’s follow‑through?' },
          { key: 'q9', text: 'Have they exchanged constructive feedback and acted on it?' },
          { key: 'q10',text: 'Are escalations rare and a last resort?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 41, max: 50, rating: 'High Trust & Flow' },
          { min: 31, max: 40, rating: 'Acceptable' },
          { min: 21, max: 30, rating: 'Moderate Risk' },
          { min: 10, max: 20, rating: 'Critical Breakdown' }
        ]
      },                                                                        
      // 5. Silo Impact Scorecard
      {
        key: 'siloImpact',
        title: 'Silo Impact Scorecard',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do teams consult each other before shared‑workflow decisions?' },
          { key: 'q2', text: 'Are handovers free from duplication?' },
          { key: 'q3', text: 'Do deliverable timelines support each other’s goals?' },
          { key: 'q4', text: 'Have teams missed learnings due to no knowledge sharing?' },
          { key: 'q5', text: 'Does leadership reinforce functional isolation?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'No Silo Present' },
          { min: 16, max: 20, rating: 'Manageable Risk' },
          { min: 11, max: 15, rating: 'High Silo Risk' },
          { min: 5,  max: 10, rating: 'Severe Silo Zone' }
        ]
      },                                                                        
      // 6. Interaction Breakdown Risk Audit
      {
        key: 'interactionBreakdown',
        title: 'Interaction Breakdown Risk Audit',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are roles and responsibilities clear in each interaction?' },
          { key: 'q2', text: 'Does interaction happen regularly and predictably?' },
          { key: 'q3', text: 'Is interaction tied to decisions or milestones?' },
          { key: 'q4', text: 'Do parties follow up in a timely manner?' },
          { key: 'q5', text: 'Is interaction respectful and are tensions handled constructively?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Strong Interaction' },
          { min: 16, max: 20, rating: 'Needs Tuning' },
          { min: 11, max: 15, rating: 'Warning Zone' },
          { min: 5,  max: 10, rating: 'Breakdown Risk' }
        ]
      }
    ]
    // (No aggregated totalRanges for interdependency—interpret per-section)
  },

  ////////////////////////////////////
  // System of Orchestration       //
  ////////////////////////////////////
  systemOrchestration: {
    id: 'systemOrchestration',
    title: 'System of Orchestration',
    sections: [
      {
        key: 'adaptiveCapacity',
        title: 'Adaptive Capacity Assessment',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Does the organization adapt rapidly to external changes?' },
          { key: 'q2', text: 'Are feedback loops intentionally built into planning processes?' },
          { key: 'q3', text: 'Do individuals and teams adjust based on real-time signals?' },
          { key: 'q4', text: 'Are outdated methods challenged regularly?' },
          { key: 'q5', text: 'Do teams re-orchestrate their routines when priorities shift?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Highly Adaptive' },
          { min: 16, max: 20, rating: 'Adaptive with Constraints' },
          { min: 11, max: 15, rating: 'Reactive Under Pressure' },
          { min: 5,  max: 10, rating: 'Rigid & Vulnerable' }
        ]
      },
      {
        key: 'feedbackLoop',
        title: 'Feedback Loop Effectiveness Test',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Is feedback captured from all levels in the organization?' },
          { key: 'q2', text: 'Are feedback insights visibly acted upon?' },
          { key: 'q3', text: 'Do leadership teams proactively seek internal feedback?' },
          { key: 'q4', text: 'Is anonymous feedback encouraged and protected?' },
          { key: 'q5', text: 'Does feedback improve daily execution and strategy?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Highly Effective' },
          { min: 16, max: 20, rating: 'Effective but Blind-Spotted' },
          { min: 11, max: 15, rating: 'Weak Insight Conversion' },
          { min: 5,  max: 10, rating: 'Token Feedback Culture' }
        ]
      },
      {
        key: 'learningCycle',
        title: 'Learning Cycle Health Diagnostic',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are team debriefs used to improve future actions?' },
          { key: 'q2', text: 'Are learnings from failures shared openly?' },
          { key: 'q3', text: 'Do leaders model curiosity and improvement?' },
          { key: 'q4', text: 'Is learning built into weekly or monthly routines?' },
          { key: 'q5', text: 'Are learnings retained and reapplied systemically?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Healthy Learning Loop' },
          { min: 16, max: 20, rating: 'Informal Learning Culture' },
          { min: 11, max: 15, rating: 'Fragmented Learning' },
          { min: 5,  max: 10, rating: 'Learning Gaps' }
        ]
      },
      {
        key: 'processEvolution',
        title: 'Process Evolution Maturity Test',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are operational processes regularly reviewed?' },
          { key: 'q2', text: 'Do teams have permission to evolve their ways of working?' },
          { key: 'q3', text: 'Are tools and workflows optimized frequently?' },
          { key: 'q4', text: 'Is inefficiency called out and addressed?' },
          { key: 'q5', text: 'Are past process changes evaluated for impact?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Evolving & Measured' },
          { min: 16, max: 20, rating: 'Improvement-Friendly' },
          { min: 11, max: 15, rating: 'Operational Inertia' },
          { min: 5,  max: 10, rating: 'Stagnant Systems' }
        ]
      },
      {
        key: 'experimentalCulture',
        title: 'Experimental Culture Index',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are experiments actively encouraged at all levels?' },
          { key: 'q2', text: 'Do teams document outcomes of small tests?' },
          { key: 'q3', text: 'Is failure treated as a learning input?' },
          { key: 'q4', text: 'Do teams frequently test new ways of working?' },
          { key: 'q5', text: 'Is experimentation supported with resources?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Experimentation-Driven' },
          { min: 16, max: 20, rating: 'Supported Exploration' },
          { min: 11, max: 15, rating: 'Hesitant Culture' },
          { min: 5,  max: 10, rating: 'Risk-Averse System' }
        ]
      }
    ],
    totalRanges: [
      { min: 105, max: 125, rating: 'Engineered Orchestration System' },
      { min: 85,  max: 104, rating: 'Mature and Responsive System' },
      { min: 65,  max: 84,  rating: 'Developing System' },
      { min: 45,  max: 64,  rating: 'Reactive and Isolated' },
      { min: 25,  max: 44,  rating: 'Fragile and Static' }
    ]
  },

  //////////////////////////////////////
  // System of Illustration          //
  //////////////////////////////////////
  systemIllustration: {
    id: 'systemIllustration',
    title: 'System of Illustration',
    sections: [
      {
        key: 'strategicClarity',
        title: 'Strategic Illustration Clarity Audit',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Is there a clear visual representation of your organizational strategy?' },
          { key: 'q2', text: 'Can staff articulate the strategy using those visuals?' },
          { key: 'q3', text: 'Do leaders reuse the same diagrams when communicating direction?' },
          { key: 'q4', text: 'Have visuals been updated based on feedback within the last 12 months?' },
          { key: 'q5', text: 'Are visuals embedded in onboarding and trainings?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Fully Embedded Visual Strategy' },
          { min: 16, max: 20, rating: 'Mixed Visual Use' },
          { min: 11, max: 15, rating: 'Unclear or Underused Visuals' },
          { min: 5,  max: 10, rating: 'No Visual Culture' }
        ]
      },
      {
        key: 'modelFluency',
        title: 'Internal Model Fluency & Utility Diagnostic',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are internal models used regularly in decision‑making?' },
          { key: 'q2', text: 'Can non‑leaders explain key frameworks?' },
          { key: 'q3', text: 'Have teams adapted models for their context?' },
          { key: 'q4', text: 'Do staff know where to seek help when visuals are unclear?' },
          { key: 'q5', text: 'Are models referenced in cross‑departmental discussions?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'High Model Literacy' },
          { min: 16, max: 20, rating: 'Moderate Fluency' },
          { min: 11, max: 15, rating: 'Inconsistent Understanding' },
          { min: 5,  max: 10, rating: 'Modeling Deficiency' }
        ]
      },
      {
        key: 'messageResonance',
        title: 'Message Resonance & Storytelling Culture Check',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Can staff recall an internal story or metaphor that guided action?' },
          { key: 'q2', text: 'Are stories referenced in decision discussions?' },
          { key: 'q3', text: 'Do rituals or symbols reinforce key messages?' },
          { key: 'q4', text: 'Have outdated campaigns been retired when they lost impact?' },
          { key: 'q5', text: 'Is there clear evidence of behavior change linked to a campaign?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Strong Story Culture' },
          { min: 16, max: 20, rating: 'Some Resonance' },
          { min: 11, max: 15, rating: 'Low Recall or Impact' },
          { min: 5,  max: 10, rating: 'Message Fatigue' }
        ]
      },
      {
        key: 'visualIntegration',
        title: 'Visual Communication Integration Assessment',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are dashboards and reports primarily visual?' },
          { key: 'q2', text: 'Do teams prefer diagrams over text in meetings?' },
          { key: 'q3', text: 'Is visual content prioritized in training materials?' },
          { key: 'q4', text: 'Can newcomers interpret visuals without extra context?' },
          { key: 'q5', text: 'Are visual tools used across all functions?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Visual-First Culture' },
          { min: 16, max: 20, rating: 'Balanced Use' },
          { min: 11, max: 15, rating: 'Text-Dominant' },
          { min: 5,  max: 10, rating: 'Poor Visual Accessibility' }
        ]
      },
      {
        key: 'leadershipVisual',
        title: 'Visual Literacy in Leadership Evaluation',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do leaders use hand‑drawn visuals when explaining strategy?' },
          { key: 'q2', text: 'Are diagrams a default in leadership briefings?' },
          { key: 'q3', text: 'Do mentors use models in coaching sessions?' },
          { key: 'q4', text: 'Are metaphors and symbols consistent across leaders?' },
          { key: 'q5', text: 'Is visual framing taught to new managers?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Visual Leadership Culture' },
          { min: 16, max: 20, rating: 'Emerging Visual Fluency' },
          { min: 11, max: 15, rating: 'Text-Dominant Leadership Style' },
          { min: 5,  max: 10, rating: 'Visual Thinking Deficit' }
        ]
      }
    ]
  },

  //////////////////////////////////////
  // System of Interpretation        //
  //////////////////////////////////////
  systemInterpretation: {
    id: 'systemInterpretation',
    title: 'System of Interpretation',
    sections: [
      {
        key: 'framingConsistency',
        title: 'Insight Framing Consistency Assessment',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do departments define key metrics the same way?' },
          { key: 'q2', text: 'Has leadership set standard framing principles?' },
          { key: 'q3', text: 'Are project charters aligned in terminology?' },
          { key: 'q4', text: 'Do reviews call out inconsistent framing?' },
          { key: 'q5', text: 'Have framing mistakes caused delays?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Unified Strategic Understanding' },
          { min: 16, max: 20, rating: 'Coordinated but Not Synced' },
          { min: 11, max: 15, rating: 'Mixed Signal Culture' },
          { min: 5,  max: 10, rating: 'Fragmented Insight Environment' }
        ]
      },
      {
        key: 'sensemaking',
        title: 'Sensemaking and Meaning Alignment Test',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do teams reach the same conclusions on shared data?' },
          { key: 'q2', text: 'Is ambiguity openly discussed in planning?' },
          { key: 'q3', text: 'Are postmortems held after key events?' },
          { key: 'q4', text: 'Have misinterpretations led to project issues?' },
          { key: 'q5', text: 'Are symbolic changes interpreted consistently?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Aligned Understanding' },
          { min: 16, max: 20, rating: 'Coordinated but with Gaps' },
          { min: 11, max: 15, rating: 'Partial Agreement Only' },
          { min: 5,  max: 10, rating: 'Interpretive Chaos' }
        ]
      },
      {
        key: 'narrativeIntegrity',
        title: 'Narrative Integrity Review',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are strategic messages repeated consistently?' },
          { key: 'q2', text: 'Do employees cite the same reasons for priorities?' },
          { key: 'q3', text: 'Do internal docs reflect a coherent story?' },
          { key: 'q4', text: 'Are success/failure stories shared regularly?' },
          { key: 'q5', text: 'Have conflicting narratives caused confusion?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Cohesive Narrative Culture' },
          { min: 16, max: 20, rating: 'Partially Aligned Narratives' },
          { min: 11, max: 15, rating: 'Fragmented Message Zones' },
          { min: 5,  max: 10, rating: 'Cultural Narrative Breakdown' }
        ]
      },
      {
        key: 'signalNoise',
        title: 'Signal-to-Noise Ratio Audit',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are only a few high‑signal metrics reviewed?' },
          { key: 'q2', text: 'Are redundant reports discontinued?' },
          { key: 'q3', text: 'Can staff distinguish signal vs. distraction?' },
          { key: 'q4', text: 'Has noise led to bad decisions?' },
          { key: 'q5', text: 'Is training provided on signal interpretation?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Signal-Driven Organization' },
          { min: 16, max: 20, rating: 'Insight-Focused but Patchy' },
          { min: 11, max: 15, rating: 'Mixed Signal Prioritization' },
          { min: 5,  max: 10, rating: 'Noise-Dominated Organization' }
        ]
      },
      {
        key: 'insightTransfer',
        title: 'Cross-Level Insight Transfer Scorecard',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Are frontline insights elevated to leadership?' },
          { key: 'q2', text: 'Are leadership insights shared with frontline?' },
          { key: 'q3', text: 'Do recurring rituals share insights across levels?' },
          { key: 'q4', text: 'Do mid‑level managers translate insights?' },
          { key: 'q5', text: 'Have transfer breakdowns led to errors?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Dynamic Cross-Level Insight Org' },
          { min: 16, max: 20, rating: 'Structured but Incomplete Flow' },
          { min: 11, max: 15, rating: 'Passive or Interrupted Loops' },
          { min: 5,  max: 10, rating: 'Insight Bottlenecked or Trapped' }
        ]
      }
    ]
  },

  //////////////////////////////////////
  // System of Investigation          //
  //////////////////////////////////////
  systemInvestigation: {
    id: 'systemInvestigation',
    title: 'System of Investigation',
    sections: [
      {
        key: 'blameVsDiagnosis',
        title: 'Blame vs. System Diagnosis Index',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Is the first reaction to find the cause, not the culprit?' },
          { key: 'q2', text: 'Do leaders protect individuals while diagnosing systems?' },
          { key: 'q3', text: 'Are structural flaws openly identified?' },
          { key: 'q4', text: 'Can anyone report breakdowns without fear?' },
          { key: 'q5', text: 'Do post‑failure changes address system issues?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'System-Focused Learning Culture' },
          { min: 16, max: 20, rating: 'System-Aware but Person-Sensitive' },
          { min: 11, max: 15, rating: 'Mixed Mode with Blame Triggers' },
          { min: 5,  max: 10, rating: 'Blame-Oriented Response Culture' }
        ]
      },
      {
        key: 'dataDiscovery',
        title: 'Data-to-Discovery Maturity Assessment',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do teams have real‑time access to relevant data?' },
          { key: 'q2', text: 'Is data used for root‑cause, not just reporting?' },
          { key: 'q3', text: 'Are anomalies actively investigated?' },
          { key: 'q4', text: 'Do hidden issues emerge through analysis?' },
          { key: 'q5', text: 'Do insights translate into decisions?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Insight-Driven Org' },
          { min: 16, max: 20, rating: 'Analytical but Not Exploratory' },
          { min: 11, max: 15, rating: 'Metrics Over Insight' },
          { min: 5,  max: 10, rating: 'Static and Reporting-Only' }
        ]
      },
      {
        key: 'investigativeRigor',
        title: 'Investigative Rigor Assessment',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do teams use structured tools (5 Whys, fishbone)?' },
          { key: 'q2', text: 'Are biases challenged during investigations?' },
          { key: 'q3', text: 'Is evidence required for conclusions?' },
          { key: 'q4', text: 'Are alternative hypotheses tested?' },
          { key: 'q5', text: 'Do multi‑disciplinary groups run investigations?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Root Cause Leadership' },
          { min: 16, max: 20, rating: 'Solid but Inconsistent' },
          { min: 11, max: 15, rating: 'Reactive and Bias-Prone' },
          { min: 5,  max: 10, rating: 'Surface-Level & Subjective' }
        ]
      },
      {
        key: 'failureAnalysis',
        title: 'Failure Analysis Culture Survey',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Can staff admit failures without fear?' },
          { key: 'q2', text: 'Are post‑failure lessons shared organization‑wide?' },
          { key: 'q3', text: 'Do failure reviews follow a structured template?' },
          { key: 'q4', text: 'Are corrective actions visibly implemented?' },
          { key: 'q5', text: 'Is psychological safety maintained after errors?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'High Learning Culture' },
          { min: 16, max: 20, rating: 'Positive but Patchy' },
          { min: 11, max: 15, rating: 'Cautious Culture' },
          { min: 5,  max: 10, rating: 'Fear & Avoidance Culture' }
        ]
      },
      {
        key: 'rootCauseDepth',
        title: 'Root Cause Depth Audit',
        weight: 5,
        questions: [
          { key: 'q1', text: 'Do investigations distinguish symptoms from system issues?' },
          { key: 'q2', text: 'Are repeated failures treated as signals?' },
          { key: 'q3', text: 'Do actions address upstream structural flaws?' },
          { key: 'q4', text: 'Is cross‑functional insight sought?' },
          { key: 'q5', text: 'Are tools and methods consistently applied?' }
        ],
        scoring: { yes: 5, notSure: 3, no: 1 },
        ranges: [
          { min: 21, max: 25, rating: 'Systemic Mindset' },
          { min: 16, max: 20, rating: 'Structured but Limited' },
          { min: 11, max: 15, rating: 'Symptom-Centric Tendency' },
          { min: 5,  max: 10, rating: 'Crisis Mode & Surface Fixes' }
        ]
      }
    ]
  }


};

// scoring helpers
export function scoreSection(section, answers) {
  return section.questions.reduce((sum, q, idx) => {
    const resp = answers[q.key] || answers[idx] || 'no';
    return sum + (section.scoring[resp] || 0);
  }, 0);
}

export function interpretTotal(ranges, total) {
  const bucket = ranges.find(r => total >= r.min && total <= r.max);
  return bucket ? bucket.rating : 'Unrated';
}