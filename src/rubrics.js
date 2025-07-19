export const rubrics = [
  // System of Interdependency & Interaction
  {
    id: "interdependency",
    title: "The System of Interdependency & Interaction",
    icon: "🔗",
    description:
      "This captures how parts of the organization rely on each other. This system emphasizes that everything in an organization is connected.",
    goal:
      "Identify where collaboration is likely to fail between teams, departments, or individuals",
    isInterdependency: true,
    subAssessments: [
      // 1. Core Response Behaviors
      {
        id: "crb",
        title: "Core Response Behaviors (CRBs)",
        description:
          "Assess whether your organization’s crisis responses are constructive (aligned, adaptive, resilient) or detrimental (reactive, misaligned, short-term).",
        questions: [
          {
            statement:
              "Does your organization quickly adjust its strategy in response to emerging crises?",
            clarification:
              "Think of a recent crisis—how fast did your strategy shift?"
          },
          {
            statement:
              "Does your team document and review lessons from past crises to avoid repeat failures?",
            clarification: "E.g., retrospective sessions, updated playbooks."
          },
          {
            statement:
              "Are unconventional or innovative solutions welcomed during high-pressure moments?",
            clarification:
              "Are new ideas explored instead of reverting to defaults?"
          },
          {
            statement:
              "Do crisis-time decisions consistently reflect your organization’s core values?",
            clarification:
              "Consider if ethical commitments are maintained under pressure."
          },
          {
            statement:
              "Is there evidence that integrity is upheld during crisis response—even at cost?",
            clarification: "Were shortcuts or ethical compromises avoided?"
          },
          {
            statement:
              "Does leadership messaging remain consistent and values-driven throughout crises?",
            clarification:
              "Messaging tone: does it match long-term vision or just spin?"
          },
          {
            statement:
              "Do your crisis responses result in long-term resolution rather than temporary relief?",
            clarification: "Did the issue resurface due to incomplete fixes?"
          },
          {
            statement:
              "Is reputational damage minimized or reversed after crisis handling?",
            clarification: "Public or partner trust recovered/improved?"
          },
          {
            statement:
              "Do stakeholders express increased confidence in leadership after crises?",
            clarification: "Client/employee feedback, engagement, media tone."
          },
          {
            statement:
              "Are risks regularly identified and addressed before they escalate?",
            clarification: "Routine risk reviews, red flags tracked."
          },
          {
            statement:
              "Does your organization take early action during signs of instability?",
            clarification: "E.g., preemptive hiring freeze, early supply shifts."
          },
          {
            statement:
              "Is scenario planning or war-gaming used for crisis preparedness?",
            clarification:
              "Think of future simulations or contingency drills."
          },
          {
            statement:
              "Do cross-functional teams collaborate clearly during crises?",
            clarification: "Look for shared crisis boards, joint task forces."
          },
          {
            statement:
              "Are team roles and responsibilities clear during high-stakes events?",
            clarification: "Ambiguity reduced or leadership overlaps?"
          },
          {
            statement:
              "Is there a culture that avoids blame and focuses on solutions during setbacks?",
            clarification: "Who gets questioned first—the person or the system?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 10,
            meaning: "The behavior is consistently practiced and reinforced."
          },
          {
            label: "Not Sure",
            score: 5,
            meaning: "The behavior may exist but isn’t reliably applied."
          },
          {
            label: "No",
            score: 1,
            meaning: "The behavior is absent or contradicted."
          }
        ],
        scoreInterpretation: [
          {
            range: [40, 50],
            rating: "✅ Highly Constructive CRBs",
            interpretation:
              "Your organization is resilient, values-driven, and learns from crises."
          },
          {
            range: [25, 39],
            rating: "🟡 Moderate CRBs",
            interpretation:
              "Some strengths, but inconsistencies in adaptability or alignment. Improve loops and protocols."
          },
          {
            range: [10, 24],
            rating: "🔴 Detrimental CRBs",
            interpretation:
              "Fixes are reactive and misaligned. Conduct root cause analysis using 5 Whys."
          }
        ]
      },

      // 2. Internal Client Satisfaction
      {
        id: "internal-client",
        title: "Internal Client Satisfaction",
        description:
          "To objectively assess how well internal teams serve each other as clients, using clear, real‑world behavior and performance indicators.",
        questions: [
          {
            statement:
              "Are service requests typically acknowledged within 24 hours of being sent?",
            clarification:
              "Think about the average time between a request and a response."
          },
          {
            statement:
              "Do service teams inform clients when there are delays or issues fulfilling requests?",
            clarification: "Was the client updated before escalation?"
          },
          {
            statement:
              "Is the final output often reviewed by the service team for accuracy before delivery?",
            clarification: "Do errors get caught internally or by the client?"
          },
          {
            statement:
              "Do service teams communicate clearly what is being delivered, by when, and how?",
            clarification: "Were timelines and scope made clear from the start?"
          },
          {
            statement:
              "Is there a process for internal clients to raise concerns and receive follow‑up?",
            clarification: "Think of helpdesks, ticketing, or feedback forms."
          },
          {
            statement:
              "Have internal teams received direct appreciation from clients for their professionalism?",
            clarification: "Check emails, messages, or mentions in review."
          },
          {
            statement:
              "Do internal service teams routinely offer solutions beyond what was requested?",
            clarification:
              "Examples of proactive problem‑solving or added insights."
          },
          {
            statement:
              "Are deliverables from internal teams consistently aligned with what the requesting team needs to meet its own goals?",
            clarification: "Do they improve or complicate the requester’s job?"
          },
          {
            statement:
              "Are internal clients regularly engaged for feedback on how to improve the service?",
            clarification: "Surveys, check‑ins, reviews, etc."
          },
          {
            statement:
              "Has the service team adjusted its delivery methods or tools based on past client feedback?",
            clarification: "Evidence of evolution or fixed style?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning: "The behavior is consistently practiced, visible, and known."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "There may be examples, but not consistent or widely known."
          },
          {
            label: "No",
            score: 1,
            meaning: "The behavior is not present or not practiced."
          }
        ],
        scoreInterpretation: [
          {
            range: [41, 50],
            rating: "✅ Excellent Service Culture",
            interpretation:
              "Recognize teams and share practices across departments."
          },
          {
            range: [31, 40],
            rating: "🟡 Good But Uneven",
            interpretation:
              "Focus on consistency and stretch feedback loops."
          },
          {
            range: [21, 30],
            rating: "⚠️ Needs Redesign",
            interpretation:
              "Initiate service dialogue and set joint service‑level expectations."
          },
          {
            range: [10, 20],
            rating: "🔴 Service Dysfunction",
            interpretation:
              "Urgent attention, retraining, and accountability reset needed."
          }
        ]
      },

      // 3. Dependency Mapping
      {
        id: "dependency-mapping",
        title: "Dependency Mapping",
        description:
          "Help leaders and teams assess the strength, clarity, and risks of their operational interdependencies.",
        questions: [
          {
            statement:
              "Is the reason why your team depends on this other team or process clearly defined and agreed on?",
            clarification: "Purpose alignment — why the dependency exists."
          },
          {
            statement:
              "Is the dependency relationship documented (SOPs, RACI, SLAs) or just assumed?",
            clarification: "Check for shared clarity in procedures."
          },
          {
            statement:
              "Would it cause serious disruption if this team did not deliver as expected?",
            clarification:
              "Criticality — how vital is their function to your work?"
          },
          {
            statement:
              "Is communication between both teams structured and frequent, or only reactive?",
            clarification:
              "Interaction rhythm — think beyond emergency communication."
          },
          {
            statement:
              "When you make a request, do you receive a response within an agreed or predictable time?",
            clarification: "Reliability of turnaround."
          },
          {
            statement:
              "Has the quality or reliability of this dependency improved in the last 6 months?",
            clarification: "Trajectory — improving or stagnant."
          },
          {
            statement:
              "Are risks of disruption known and documented (e.g., team gaps, tools, delays)?",
            clarification: "Vulnerability — is there awareness and mitigation?"
          },
          {
            statement:
              "Have issues with this dependency resulted in missed goals, rework, or reputational damage?",
            clarification: "Consequences of failure."
          },
          {
            statement:
              "Is there a feedback mechanism in place between your team and theirs?",
            clarification: "Can you share or receive feedback easily?"
          },
          {
            statement:
              "Has this dependency been reviewed in a cross‑functional forum in the last year?",
            clarification:
              "Governance — reviewed jointly or in isolation?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning: "The behavior is consistent, visible, and documented."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "The behavior may exist but is not clear, consistent, or agreed."
          },
          {
            label: "No",
            score: 1,
            meaning: "The condition is absent or contradicted."
          }
        ],
        scoreInterpretation: [
          {
            range: [41, 50],
            rating: "✅ Healthy & Resilient",
            interpretation:
              "Monitor and maintain trust and communication systems."
          },
          {
            range: [31, 40],
            rating: "🟡 Stable but Needs Attention",
            interpretation:
              "Clarify documentation, track trends, improve turnaround."
          },
          {
            range: [21, 30],
            rating: "⚠️ Vulnerable or Misaligned",
            interpretation:
              "Start dependency audit and process redesign."
          },
          {
            range: [10, 20],
            rating: "🔴 High-Risk Dependency",
            interpretation:
              "Escalate and launch urgent dependency reset or intervention."
          }
        ]
      },

      // 4. Cross‑Team Trust & Flow Index
      {
        id: "trust-flow",
        title: "Cross‑Team Trust and Flow Index",
        description:
          "To measure trust, feedback loops, and communication fluidity between departments or cross‑functional teams.",
        questions: [
          {
            statement:
              "Do teams address issues or breakdowns directly with each other before escalating?",
            clarification:
              "E.g., Teams try resolution together before looping in leadership."
          },
          {
            statement:
              "Are requests and feedback acknowledged within 24 hours in most cross‑team interactions?",
            clarification: "Confirmation of receipt and expectations."
          },
          {
            statement:
              "Are joint team goals reviewed together rather than assumed independently?",
            clarification: "Shared OKRs or planning rituals."
          },
          {
            statement:
              "Is there an established routine (weekly, biweekly) where these two teams engage?",
            clarification: "Scheduled sync‑ups or structured updates."
          },
          {
            statement:
              "When there’s disagreement, do teams resolve through open dialogue rather than avoidance or passive pushback?",
            clarification:
              "Feedback loops, retrospectives, open challenge channels."
          },
          {
            statement:
              "Have representatives of both teams attended a learning, retrospective, or co‑design session in the past 6 months?",
            clarification: "Collaborative settings beyond firefighting."
          },
          {
            statement:
              "Do both teams contribute information proactively, without needing to be asked?",
            clarification:
              "E.g., usage data, timelines, changes shared unprompted."
          },
          {
            statement:
              "Do teams express confidence in each other’s follow‑through?",
            clarification:
              "Reliability patterns in hitting joint deliverables."
          },
          {
            statement:
              "Have both teams given each other constructive feedback and acted on it?",
            clarification: "Documented feedback, post‑action improvements."
          },
          {
            statement:
              "Are escalations rare and typically the last resort?",
            clarification: "Is direct problem‑solving the norm?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning: "The behavior is consistent, observable, and well‑practiced."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Some evidence, but unclear, inconsistent, or indirect."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "The behavior is absent or not occurring with regularity."
          }
        ],
        scoreInterpretation: [
          {
            range: [41, 50],
            rating: "✅ High Trust & Flow",
            interpretation:
              "Maintain momentum, document practices, and model to other units."
          },
          {
            range: [31, 40],
            rating: "🟡 Acceptable",
            interpretation:
              "Identify weak areas and improve routines, especially proactive sharing."
          },
          {
            range: [21, 30],
            rating: "⚠️ Moderate Risk",
            interpretation:
              "Facilitate cross‑functional reviews, align communication cadence."
          },
          {
            range: [10, 20],
            rating: "🔴 Critical Breakdown",
            interpretation:
              "Escalate to leadership, launch trust reset, and clarify inter‑team purpose."
          }
        ]
      },

      // 5. Silo Impact Scorecard
      {
        id: "silo-impact",
        title: "Silo Impact Scorecard",
        description:
          "To evaluate the presence and cost of silos in decision‑making, delivery, and learning across functions or units.",
        questions: [
          {
            statement:
              "Do both teams consult each other before making decisions that impact shared workflows?",
            clarification:
              "Checks for upstream‑downstream awareness and consultation."
          },
          {
            statement:
              "Are handovers or transitions between these teams free from duplicated work or redundant checks?",
            clarification:
              "E.g., does the same data or task get redone or verified twice unnecessarily?"
          },
          {
            statement:
              "Do the two teams have aligned timelines or deliverables that directly support each other’s goals?",
            clarification:
              "Conflict in deadlines, sequence gaps, or delivery mismatch are red flags."
          },
          {
            statement:
              "Have either team missed out on learnings, mistakes, or innovations due to lack of knowledge sharing?",
            clarification:
              "Check if problems were solved by one team but repeated by another."
          },
          {
            statement:
              "Does leadership from either team reinforce functional isolation—implicitly or explicitly?",
            clarification:
              "Look for signaling: do leaders reward turf, autonomy, or cross‑pollination?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "The condition is fully true and visible in practice."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "The condition may exist but is not clearly observable or consistent."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "The condition is absent or not practiced at all."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "✅ No Silo Present",
            interpretation:
              "Leverage as best practice; formalize as internal benchmark."
          },
          {
            range: [16, 20],
            rating: "🟡 Manageable Risk",
            interpretation:
              "Clarify interfaces and build shared delivery frameworks."
          },
          {
            range: [11, 15],
            rating: "⚠️ High Silo Risk",
            interpretation:
              "Launch cross‑functional workshops; initiate leadership accountability."
          },
          {
            range: [5, 10],
            rating: "🔴 Severe Silo Zone",
            interpretation:
              "Escalate to executive level; redesign org interfaces and KPIs."
          }
        ]
      },

      // 6. Interaction Breakdown Risk Audit
      {
        id: "breakdown-risk",
        title: "Interaction Breakdown Risk Audit",
        description:
          "To detect where collaboration is likely to fail due to unclear, irregular, or broken interaction links.",
        questions: [
          {
            statement:
              "Are the roles and responsibilities of both parties clearly defined in the interaction?",
            clarification:
              "Interaction Clarity — E.g., each team knows what they owe and expect."
          },
          {
            statement:
              "Does this interaction happen regularly and predictably?",
            clarification:
              "Interaction Frequency — E.g., weekly handoffs, biweekly syncs."
          },
          {
            statement:
              "Is the interaction directly tied to work outputs or decisions that matter?",
            clarification:
              "Purpose Alignment — E.g., tied to a milestone, delivery, or performance trigger."
          },
          {
            statement:
              "Do both parties follow up or respond to requests in a timely manner?",
            clarification:
              "Responsiveness — E.g., is the loop closed consistently?"
          },
          {
            statement:
              "Is the interaction respectful, and are tensions handled constructively?",
            clarification:
              "Friction/Tension — Is it safe to challenge or raise issues?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "This condition is consistently observed across interactions."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Evidence is limited or inconsistent."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "This condition is absent or contradicted."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "✅ Strong Interaction",
            interpretation:
              "Maintain cadence, leverage as collaboration model."
          },
          {
            range: [16, 20],
            rating: "🟡 Needs Tuning",
            interpretation:
              "Clarify expectations, refine timing or communication."
          },
          {
            range: [11, 15],
            rating: "⚠️ Warning Zone",
            interpretation:
              "Hold conversation to address ambiguity or misalignment."
          },
          {
            range: [5, 10],
            rating: "🔴 Breakdown Risk",
            interpretation:
              "Immediate redesign of the relationship and process."
          }
        ]
      }
    ],
    // overall total
    totalScoreInterpretation: [
      {
        range: [126, 150],
        rating: "✅ Systemically Interconnected",
        interpretation:
          "Interactions, trust, service behaviors, and dependencies are high‑performing, resilient, and well‑coordinated across units. The system adapts, informs, and elevates collaboration as a core asset."
      },
      {
        range: [101, 125],
        rating: "🟡 Functionally Aligned but Isolated Zones",
        interpretation:
          "Most relationships and dependencies are working, but there are minor silos, lagging routines, or inconsistent follow‑up practices. Targeted resets or clarifications are required."
      },
      {
        range: [76, 100],
        rating: "⚠️ Fragmented or Overloaded System",
        interpretation:
          "Weak routines, unclear roles, poor service reliability, and dependency misunderstandings persist across units. High coordination cost. Requires structural clarity and inter‑team protocols."
      },
      {
        range: [30, 75],
        rating: "🔴 Crisis of Collaboration",
        interpretation:
          "Trust is low, handovers break, teams escalate rather than collaborate. Silo thinking and firefighting dominate. Requires full interdependency reset, leadership realignment, and interface redesign."
      }
    ]
  },

  // System of Inlignment
  {
    id: 'inlignment',
    title: "The System of Inlignment",
    icon: "🎯",
    description:
      "A fusion of 'alignment' and 'inline'—ensuring all components work seamlessly toward the same objectives.",
    goal: "Ensure daily decisions reflect the organization's stated vision and mission",
    subAssessments: [
      {
        id: 'vision-behavior',
        title: 'Vision‑to‑Behavior Alignment Test',
        description:
          "Track whether daily behaviors and decisions reflect the organization’s stated vision and mission.",
        questions: [
          {
            statement:
              'Do employees regularly reference the vision or mission in discussions or meetings?',
            clarification: 'E.g., project justifications refer to the mission.'
          },
          {
            statement:
              'Do leaders model the vision in both behavior and decision logic?',
            clarification: 'Consistency between stated values and actions.'
          },
          {
            statement:
              'Do performance reviews or team rituals reinforce the vision?',
            clarification: 'Vision embedded in evaluations or check‑ins.'
          },
          {
            statement:
              'Is it clear how each role contributes to realizing the vision?',
            clarification: 'Role‑to‑vision traceable connection.'
          },
          {
            statement:
              'Are employees recognized for actions that align with the mission?',
            clarification: 'Shout‑outs, rewards, storytelling.'
          }
        ],
        scoringRubric: [
          { label: 'Yes', score: 5, meaning: 'Condition is consistently observed.' },
          { label: 'Not Sure', score: 3, meaning: 'Condition may exist but lacks clarity.' },
          { label: 'No', score: 1, meaning: 'Condition is absent or not practiced.' }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: 'Vision‑Driven Culture',
            interpretation: 'Strong behavioral alignment across all levels.'
          },
          {
            range: [16, 20],
            rating: 'Mostly Aligned',
            interpretation: 'Good alignment with occasional disconnects.'
          },
          {
            range: [11, 15],
            rating: 'Patchy Alignment',
            interpretation: 'Inconsistent reference to vision in daily work.'
          },
          {
            range: [5, 10],
            rating: 'Disconnected',
            interpretation: 'Vision is mostly abstract or unknown.'
          }
        ]
      },

      {
        id: 'goal-harmony',
        title: 'Goal Harmony Assessment',
        description:
          "Evaluate how well team, departmental, and individual goals cascade and contribute to strategic objectives.",
        questions: [
          {
            statement:
              'Do individuals know how their goals link to organizational strategy?',
            clarification: 'Ask how team deliverables support big‑picture plans.'
          },
          {
            statement:
              'Are departmental goals explicitly derived from strategic goals?',
            clarification: 'Mapped goals visible in team plans.'
          },
          {
            statement:
              'Do leaders discuss strategy during goal setting?',
            clarification: 'Mention of strategic priorities during planning.'
          },
          {
            statement:
              'Are team KPIs tracked alongside strategic metrics?',
            clarification: 'Dashboard visibility or alignment.'
          },
          {
            statement:
              'Do teams collaborate on joint success metrics?',
            clarification: 'Cross‑functional shared KPIs or OKRs.'
          }
        ],
        scoringRubric: [
          { label: 'Yes', score: 5, meaning: 'Condition is consistently observed.' },
          { label: 'Not Sure', score: 3, meaning: 'Condition may exist but lacks clarity.' },
          { label: 'No', score: 1, meaning: 'Condition is absent or not practiced.' }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: 'Unified Goal System',
            interpretation: 'All teams connect their work to strategy.'
          },
          {
            range: [16, 20],
            rating: 'Partially Cascaded',
            interpretation: 'Some goal alignment with blind spots.'
          },
          {
            range: [11, 15],
            rating: 'Fragmented Targets',
            interpretation: 'Teams set isolated goals.'
          },
          {
            range: [5, 10],
            rating: 'Goal Chaos',
            interpretation: 'Little to no connection to organizational strategy.'
          }
        ]
      },

      {
        id: 'structural-strategy',
        title: 'Structural‑Strategy Fit Review',
        description:
          'Determine whether the current organizational structure supports and enables the desired strategy.',
        questions: [
          {
            statement:
              'Do teams understand how their role aligns with strategic priorities?',
            clarification: 'Strategic clarity in job descriptions.'
          },
          {
            statement:
              'Do decision rights align with speed and priority of tasks?',
            clarification: 'Quick decisions at the right level.'
          },
          {
            statement:
              'Are spans of control manageable for effective oversight?',
            clarification: 'Not overly flat or bottlenecked.'
          },
          {
            statement:
              'Do cross‑functional collaborations flow without hierarchy blocks?',
            clarification: 'Joint task forces or squads work smoothly.'
          },
          {
            statement:
              'Is structure reviewed when strategy shifts?',
            clarification: 'Realignments after major changes?'
          }
        ],
        scoringRubric: [
          { label: 'Yes', score: 5, meaning: 'Condition is consistently observed.' },
          { label: 'Not Sure', score: 3, meaning: 'Condition may exist but lacks clarity.' },
          { label: 'No', score: 1, meaning: 'Condition is absent or not practiced.' }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: 'Optimal Strategic Fit',
            interpretation: 'Structure supports fast and aligned decisions.'
          },
          {
            range: [16, 20],
            rating: 'Mostly Supportive',
            interpretation: 'Minor structural inefficiencies exist.'
          },
          {
            range: [11, 15],
            rating: 'Misaligned Architecture',
            interpretation: 'Structure creates drag or confusion.'
          },
          {
            range: [5, 10],
            rating: 'Structure–Strategy Conflict',
            interpretation: 'Reform required to enable execution.'
          }
        ]
      },

      {
        id: 'cultural-fit',
        title: 'Cultural Fit to Execution Index',
        description:
          'Measure whether organizational values and behaviors enable or block effective execution of strategy.',
        questions: [
          {
            statement:
              'Do cultural norms reward delivery, not just effort or loyalty?',
            clarification: 'Outcomes celebrated over inputs.'
          },
          {
            statement:
              'Are decisions made with clarity and speed?',
            clarification: 'Frictionless sign‑offs, low rework.'
          },
          {
            statement:
              'Are risk‑taking and initiative encouraged by culture?',
            clarification: 'Innovation stories or safety to try.'
          },
          {
            statement:
              'Are accountability systems consistent with stated values?',
            clarification: 'Responsibility aligns with empowerment.'
          },
          {
            statement:
              'Do teams operate with urgency where needed?',
            clarification: 'Pace matches stakes.'
          }
        ],
        scoringRubric: [
          { label: 'Yes', score: 5, meaning: 'Condition is consistently observed.' },
          { label: 'Not Sure', score: 3, meaning: 'Condition may exist but lacks clarity.' },
          { label: 'No', score: 1, meaning: 'Condition is absent or not practiced.' }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: 'Culture Accelerates Execution',
            interpretation: 'Behavioral norms enhance delivery.'
          },
          {
            range: [16, 20],
            rating: 'Supportive But Slow',
            interpretation: 'Values in place but inconsistently applied.'
          },
          {
            range: [11, 15],
            rating: 'Contradictory Culture',
            interpretation: 'Culture blocks execution.'
          },
          {
            range: [5, 10],
            rating: 'Toxic or Confused Culture',
            interpretation: 'Values and performance are at odds.'
          }
        ]
      },

      {
        id: 'incentive-system',
        title: 'Incentive System Coherence Test',
        description:
          'Audit whether reward and recognition systems drive aligned and desirable behaviors in line with strategy and culture.',
        questions: [
          {
            statement:
              'Are incentives linked directly to strategic goals or KPIs?',
            clarification: 'Bonus criteria tied to mission.'
          },
          {
            statement:
              'Do rewards encourage teamwork and shared results?',
            clarification: 'Group awards or team performance points.'
          },
          {
            statement:
              'Is reward fairness perceived and supported by transparency?',
            clarification: 'Pay equity and promotion clarity.'
          },
          {
            statement:
              'Have incentives led to undesired behaviors?',
            clarification: 'Conflict, rework, resentment patterns.'
          },
          {
            statement:
              'Has employee feedback ever led to updates in incentive design?',
            clarification: 'Input‑led changes documented?'
          }
        ],
        scoringRubric: [
          { label: 'Yes', score: 5, meaning: 'Condition is consistently observed.' },
          { label: 'Not Sure', score: 3, meaning: 'Condition may exist but lacks clarity.' },
          { label: 'No', score: 1, meaning: 'Condition is absent or not practiced.' }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: 'Strategic Incentive Engine',
            interpretation: 'Rewards consistently align with goals.'
          },
          {
            range: [16, 20],
            rating: 'Mostly Supportive Rewards',
            interpretation: 'Incentives mostly help, with some gaps.'
          },
          {
            range: [11, 15],
            rating: 'Misguided or Mixed Signals',
            interpretation: 'Reward systems may conflict with vision.'
          },
          {
            range: [5, 10],
            rating: 'Disruptive Incentives',
            interpretation: 'Rewards harm alignment or behavior.'
          }
        ]
      }
    ],
    // Overall
    totalScoreInterpretation: [
      {
        range: [105, 125],
        rating: '✅ Systemically Aligned',
        interpretation:
          'Vision, goals, structure, culture, and incentives are mutually reinforcing.'
      },
      {
        range: [85, 104],
        rating: '🟡 Operationally Aligned',
        interpretation:
          'Most levers are aligned, but some areas need reinforcement or clarification.'
      },
      {
        range: [65, 84],
        rating: '⚠️ Fragmented Alignment',
        interpretation:
          'Significant gaps exist—teams may pull in different directions at times.'
      },
      {
        range: [5, 64],
        rating: '🔴 Systemic Misalignment',
        interpretation:
          'Fundamental misalignment—urgent, organization‑wide realignment required.'
      }
    ]
  },

  // System of Investigation
  {
    id: "investigation",
    title: "The System of Investigation",
    icon: "🔎",
    description:
      "How an organization digs for answers and keeps looking for the 'whys' of incidents to understand root causes.",
    goal:
      "Measure how thoroughly and objectively problems are probed during incident reviews",
    subAssessments: [
      // 1. Blame vs. System Diagnosis Index
      {
        id: "blame-diagnosis",
        title: "Blame vs. System Diagnosis Index",
        description:
          "Detect whether your organization scapegoats individuals during problems and crises, or responds by diagnosing and redesigning systems to prevent recurrence.",
        questions: [
          {
            statement:
              'When a failure occurs, is the first question typically "Who is responsible?" rather than "What broke in the system?"',
            clarification:
              "Check how leadership or teams react during errors—do they seek a culprit or a cause?"
          },
          {
            statement:
              "In moments of crisis or mistakes, do leaders publicly protect individuals while directing focus to the system?",
            clarification:
              "Think of leadership statements after breakdowns—are they about system correction or personal blame?"
          },
          {
            statement:
              "Are process gaps, unclear expectations, or outdated workflows openly identified as contributors to poor outcomes?",
            clarification:
              "Was the root cause ever traced to a structural flaw rather than a person?"
          },
          {
            statement:
              "Do staff feel safe admitting mistakes or raising breakdowns without fear of embarrassment or punishment?",
            clarification:
              "Would a junior staff member raise a concern during a crisis meeting?"
          },
          {
            statement:
              "After failures, are changes made to tools, structures, or workflows rather than just disciplinary actions?",
            clarification:
              "What structural upgrades have occurred following a major error?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "The condition is consistently true and reflected in actions."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "The condition may exist but is not consistent or clear."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "The condition is absent or contradicted in practice."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔧 System‑Focused Learning Culture",
            interpretation:
              "Scale practices; share investigation principles across the organization."
          },
          {
            range: [16, 20],
            rating: "⚙️ System‑Aware but Person‑Sensitive",
            interpretation:
              "Clarify diagnostic protocols and improve leader response coaching."
          },
          {
            range: [11, 15],
            rating: "⚠️ Mixed Mode with Blame Triggers",
            interpretation:
              "Introduce systemic review models; train leaders in non‑blaming facilitation."
          },
          {
            range: [5, 10],
            rating: "🚨 Blame‑Oriented Response Culture",
            interpretation:
              "Redesign response systems; pause punitive protocols; build trust‑first investigations."
          }
        ]
      },

      // 2. Data-to-Discovery Maturity Assessment
      {
        id: "data-discovery",
        title: "Data-to-Discovery Maturity Assessment",
        description:
          "Evaluate how well your organization uses data to uncover hidden operational insights rather than simply reporting metrics.",
        questions: [
          {
            statement:
              "Do teams across departments have real-time access to clean, relevant data?",
            clarification:
              "E.g., dashboards or shared data tools available without delay."
          },
          {
            statement:
              "Is data used for root cause analysis or trend discovery, not just reporting?",
            clarification:
              "Beyond KPIs—are there investigations into patterns and deviations?"
          },
          {
            statement:
              "When unexpected data trends arise, are they actively questioned and explored?",
            clarification:
              "Does a spike or drop trigger inquiry or just notation?"
          },
          {
            statement:
              "Do you routinely discover operational issues that weren’t visible until data revealed them?",
            clarification:
              "Hidden workflow bottlenecks or delays spotted via analysis."
          },
          {
            statement:
              "Do insights from data lead to concrete decisions or process changes?",
            clarification:
              "E.g., dashboards trigger reallocations, reviews, or redesigns."
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "Data practices are robust, accessible, and actively drive insight."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Data exists but is not reliably used for discovery."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "Data is siloed, outdated, or only used for basic reporting."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔬 Insight‑Driven Org",
            interpretation:
              "Scale models, automate insight loops, embed discovery into strategy."
          },
          {
            range: [16, 20],
            rating: "📈 Analytical but Not Exploratory",
            interpretation:
              "Invest in data storytelling, diagnostic dashboards, curiosity training."
          },
          {
            range: [11, 15],
            rating: "📊 Metrics Over Insight",
            interpretation:
              "Develop cross‑functional insight reviews; challenge surface‑level reporting."
          },
          {
            range: [5, 10],
            rating: "💤 Static and Reporting‑Only",
            interpretation:
              "Rebuild data pipelines, empower teams to ask better questions."
          }
        ]
      },

      // 3. Investigative Rigor Assessment
      {
        id: "investigative-rigor",
        title: "Investigative Rigor Assessment",
        description:
          "Measure how thoroughly and objectively problems are probed during incident reviews, diagnoses, or systemic evaluations.",
        questions: [
          {
            statement:
              'When issues arise, do teams ask multiple "why" questions to reach underlying causes?',
            clarification: "Look for inquiry beyond the surface symptom."
          },
          {
            statement:
              "Are biases (e.g., departmental, leadership, prior beliefs) actively challenged during investigations?",
            clarification: "Do people openly test each other’s assumptions?"
          },
          {
            statement:
              "Are tools like 5 Whys, Fishbone, or Causal Loop Diagrams regularly used to diagnose issues?",
            clarification:
              "Is there a structured method for finding causes?"
          },
          {
            statement:
              "Do teams require data or evidence to support conclusions, rather than relying on opinions?",
            clarification: "Decisions validated through observation, metrics."
          },
          {
            statement:
              "Are multiple possible causes examined before selecting a solution?",
            clarification:
              "Are ideas tested or compared, not just accepted first pass?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "Structured, bias‑aware, evidence‑driven inquiry is standard practice."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Inquiry happens but lacks consistency or depth."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "Investigations are ad hoc, superficial, or opinion‑based."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🧠 Root Cause Leadership",
            interpretation:
              "Institutionalize frameworks, coach others, track investigation impact."
          },
          {
            range: [16, 20],
            rating: "🔍 Solid but Inconsistent",
            interpretation:
              "Codify best practices; train in structured problem‑solving."
          },
          {
            range: [11, 15],
            rating: "🧐 Reactive and Bias‑Prone",
            interpretation:
              "Train in evidence‑based inquiry; increase psychological safety for probing."
          },
          {
            range: [5, 10],
            rating: "❌ Surface‑Level & Subjective",
            interpretation:
              "Redesign investigation protocols; introduce facilitation and peer reviews."
          }
        ]
      },

      // 4. Failure Analysis Culture Survey
      {
        id: "failure-analysis",
        title: "Failure Analysis Culture Survey",
        description:
          "Understand whether your organization consistently treats failures as learning opportunities—not events to punish, hide, or ignore.",
        questions: [
          {
            statement:
              "Can employees admit failure without fear of consequences?",
            clarification:
              "Do staff volunteer failure stories in public forums or retrospectives?"
          },
          {
            statement:
              'Do leaders ask "why did it happen?" rather than "who caused it?"',
            clarification:
              "Check if language focuses on causes or culprits."
          },
          {
            statement:
              "Are failure events documented in structured post‑mortems or debriefs?",
            clarification:
              "E.g., templates, after‑action reviews, shared notes."
          },
          {
            statement:
              "Are failure‑related lessons shared beyond the immediate team or department?",
            clarification:
              "Look for learning portals, newsletters, or brown bags."
          },
          {
            statement:
              "Do visible, traceable improvements follow failure incidents?",
            clarification:
              "E.g., updated playbooks, workflows, or new standards."
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "The condition is fully true, consistent, and observable."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "May occur but inconsistently or only in some teams."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "Not practiced or contradicts stated values."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "✅ High Learning Culture",
            interpretation:
              "Model and scale your failure‑learning practices; recognize teams who share openly."
          },
          {
            range: [16, 20],
            rating: "🟡 Positive but Patchy",
            interpretation:
              "Normalize storytelling and debriefs; improve documentation of lessons."
          },
          {
            range: [11, 15],
            rating: "⚠️ Cautious Culture",
            interpretation:
              "Offer leadership training in psychological safety and post‑failure facilitation."
          },
          {
            range: [5, 10],
            rating: "🔴 Fear & Avoidance Culture",
            interpretation:
              "Redesign leadership response frameworks; create “fail‑safe” channels for reporting."
          }
        ]
      },

      // 5. Root Cause Depth Audit
      {
        id: "root-cause",
        title: "Root Cause Depth Audit",
        description:
          "Assess whether your organization’s investigations consistently identify systemic causes rather than stopping at surface‑level symptoms.",
        questions: [
          {
            statement:
              "When diagnosing a problem, do we distinguish between immediate symptoms and root systemic issues?",
            clarification: "E.g., late reports vs. poor handoff design."
          },
          {
            statement:
              "Do we use structured tools (e.g., 5 Whys, fishbone diagrams) in most investigation sessions?",
            clarification:
              "Is the approach repeatable, or ad hoc and verbal?"
          },
          {
            statement:
              "Are representatives from different departments or functions involved in investigations?",
            clarification:
              "Do we cross‑pollinate insights from multiple units?"
          },
          {
            statement:
              "Are repeated failures treated as signals of deeper system issues rather than new isolated events?",
            clarification:
              "Do recurrences trigger a different kind of review?"
          },
          {
            statement:
              "Do our corrective actions address upstream structural or policy issues rather than just quick fixes?",
            clarification:
              "E.g., redesigning flow, not just punishing a team."
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "The practice is consistent, structured, and visible across teams."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "The practice exists but lacks clarity, consistency, or participation."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "The practice is absent, informal, or purely reactive."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🧠 Systemic Mindset",
            interpretation:
              "Sustain structured investigation; train others; capture learning."
          },
          {
            range: [16, 20],
            rating: "⚙️ Structured but Limited",
            interpretation:
              "Strengthen tools and ensure broader engagement in root cause analysis."
          },
          {
            range: [11, 15],
            rating: "❗ Symptom‑Centric Tendency",
            interpretation:
              "Build investigation capability; adopt root cause templates and facilitation techniques."
          },
          {
            range: [5, 10],
            rating: "🚨 Crisis Mode & Surface Fixes",
            interpretation:
              "Urgent investment in root cause training, systems thinking, and failure learning loops."
          }
        ]
      }
    ],

    // overall total
    totalScoreInterpretation: [
      {
        range: [126, 150],
        rating: "✅ Integrated Systemic Investigation",
        interpretation:
          "Investigation is embedded as a reflex; data, feedback, failures, and signals lead to continuous systemic improvement."
      },
      {
        range: [101, 125],
        rating: "🟡 Practiced but Partial",
        interpretation:
          "Systems thinking is present but inconsistently applied. Some units lead; others rely on reactive approaches."
      },
      {
        range: [76, 100],
        rating: "⚠️ Symptom‑Driven Culture",
        interpretation:
          "Practices exist but rarely go beyond surface‑level or individual accountability."
      },
      {
        range: [30, 75],
        rating: "🔴 Reactive & Blame‑Oriented System",
        interpretation:
          "Responses default to blame or patchwork fixes. Insight loops and system‑level thinking are largely missing."
      }
    ]
  },

  // System of Orchestration
  {
    id: "orchestration",
    title: "The System of Orchestration",
    icon: "🔄",
    description:
      "A continuous improvement process driven by repeated cycles of testing, learning, and refining.",
    goal: "Determine how quickly your organization can respond to change",
    subAssessments: [
      // 1. Adaptive Capacity Assessment
      {
        id: "adaptive-capacity",
        title: "Adaptive Capacity Assessment",
        description:
          "Determine how quickly and effectively your organization can respond to change.",
        questions: [
          {
            statement:
              "When a significant change is announced, do teams typically adjust their workflows within one week?",
            clarification:
              "Think of your last major organizational change. How long did it take for departments to shift operations?"
          },
          {
            statement:
              "Are there clear routines in place that allow any team to stop, reprioritize, and redirect efforts within 3–5 working days?",
            clarification:
              "Consider how projects are paused or accelerated when priorities shift."
          },
          {
            statement:
              "In the past quarter, has your team reallocated budgets, staff, or plans to address a new strategic need within 7 days?",
            clarification:
              "Use real instances of team or resource reassignments to validate your response."
          },
          {
            statement:
              "When new information emerges, are decisions reviewed and updated within 48 hours across all affected departments?",
            clarification:
              "Do you see decisions quickly reshaped after external or internal data shifts?"
          },
          {
            statement:
              "When plans are uncertain, do teams move forward using assumptions or prototype decisions rather than waiting for full clarity?",
            clarification:
              "Consider if partial data leads to proactive testing or frozen execution."
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning: "Your teams pivot consistently and quickly."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning: "Adaptation routines exist but are not reliable."
          },
          {
            label: "No",
            score: 1,
            meaning: "Change disrupts operations; adaptation is ad hoc."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔵 Highly Adaptive",
            interpretation: "You pivot fast and systemically."
          },
          {
            range: [16, 20],
            rating: "🟢 Adaptive with Constraints",
            interpretation:
              "You’re responsive but still face occasional lags."
          },
          {
            range: [11, 15],
            rating: "🟠 Reactive Under Pressure",
            interpretation:
              "You move, but only in response to direct pressure."
          },
          {
            range: [5, 10],
            rating: "🔴 Rigid & Vulnerable",
            interpretation:
              "Change often destabilizes progress."
          }
        ]
      },

      // 2. Feedback Loop Effectiveness Test
      {
        id: "feedback-loop",
        title: "Feedback Loop Effectiveness Test",
        description:
          "Evaluate how well feedback is collected, interpreted, and used to adapt actions.",
        questions: [
          {
            statement:
              "Do staff outside of leadership have at least one formal and scheduled platform where their feedback leads to documented action or follow‑up?",
            clarification:
              "Think of surveys, feedback sessions, or performance meetings that drive decisions."
          },
          {
            statement:
              "Does your organization have a process for examining feedback trends that involves more than one department or unit?",
            clarification:
              "Review if feedback is jointly analyzed by diverse functions."
          },
          {
            statement:
              "In the past 6 months, can you identify at least two changes made directly due to staff, partner, or client feedback?",
            clarification:
              "Use examples like feature rollouts, policy revisions, or service changes."
          },
          {
            statement:
              "Have you seen junior staff or field‑level voices influence a major policy or operational direction?",
            clarification:
              "Trace upward influence from the ground to decision‑makers."
          },
          {
            statement:
              "Are updates or decisions influenced by feedback communicated back to teams with evidence of what changed?",
            clarification:
              "Look for loop closure: was feedback acknowledged, not just received?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning: "Feedback reliably drives documented changes."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Feedback is collected but not consistently acted upon."
          },
          {
            label: "No",
            score: 1,
            meaning: "Feedback mechanisms exist only in form, not function."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔵 Highly Effective",
            interpretation:
              "Your system digests and acts on feedback at all levels."
          },
          {
            range: [16, 20],
            rating: "🟢 Effective but Blind‑Spotted",
            interpretation:
              "It works, but detectable gaps remain."
          },
          {
            range: [11, 15],
            rating: "🟠 Weak Insight Conversion",
            interpretation:
              "Feedback is gathered, not reliably turned into action."
          },
          {
            range: [5, 10],
            rating: "🔴 Token Feedback Culture",
            interpretation:
              "Input is ritualized, not impactful."
          }
        ]
      },

      // 3. Learning Cycle Health Diagnostic
      {
        id: "learning-cycle",
        title: "Learning Cycle Health Diagnostic",
        description:
          "Assess whether organizational learning is intentional, shared, and iterative.",
        questions: [
          {
            statement:
              "Do teams document lessons learned after completing major projects or cycles?",
            clarification:
              "E.g., end‑of‑project reviews, debrief templates, or retro logs."
          },
          {
            statement:
              "Are learnings from one department regularly shared with others through structured formats?",
            clarification:
              "E.g., cross‑functional lunch & learn, recorded sessions."
          },
          {
            statement:
              "Does your team revisit previous learnings or feedback before starting similar work again?",
            clarification: "Reusing or referencing a prior lesson log."
          },
          {
            statement:
              "Have lessons learned from staff ever led to a change in strategy, policy, or training content?",
            clarification:
              "Did any learning session spark structural changes?"
          },
          {
            statement:
              "Do team leaders encourage post‑action reviews even when outcomes are positive?",
            clarification: "Learning isn’t only from mistakes."
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "Learning is systematically captured and shared."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Learning happens sporadically or informally."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "Post‑action reviews rarely occur."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔵 Healthy Learning Loop",
            interpretation:
              "Learning is continuous, shared, and applied."
          },
          {
            range: [16, 20],
            rating: "🟢 Informal Learning Culture",
            interpretation:
              "Learning exists but lacks a consistent rhythm."
          },
          {
            range: [11, 15],
            rating: "🟠 Fragmented Learning",
            interpretation:
              "Lessons aren’t consistently captured or used."
          },
          {
            range: [5, 10],
            rating: "🔴 Learning Gaps",
            interpretation:
              "Past actions rarely shape future ones."
          }
        ]
      },

      // 4. Process Evolution Maturity Test
      {
        id: "process-evolution",
        title: "Process Evolution Maturity Test",
        description:
          "Check how often and how well key processes are improved.",
        questions: [
          {
            statement:
              "Is there a defined owner for reviewing and improving every core operational process?",
            clarification:
              "Not just doing the task—responsible for improving it."
          },
          {
            statement:
              "In the past 6 months, have you retired or replaced any existing process or template?",
            clarification:
              "Can be from finance, HR, compliance, etc."
          },
          {
            statement:
              "Are staff encouraged to recommend process changes without requiring leadership approval first?",
            clarification:
              "Can a frontline employee initiate improvement?"
          },
          {
            statement:
              "Does your team hold regular sessions to examine workflows for possible friction or inefficiencies?",
            clarification:
              "Weekly/Monthly retros, check‑ins, or process huddles."
          },
          {
            statement:
              "Do your process changes usually result in measurable improvements?",
            clarification:
              "Do you track and compare before and after states?"
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "Processes are owned, reviewed, and measurably improved."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Process reviews occur but lack clear ownership or metrics."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "Processes persist unchanged."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔵 Evolving & Measured",
            interpretation:
              "Processes improve based on tracked results."
          },
          {
            range: [16, 20],
            rating: "🟢 Improvement‑Friendly",
            interpretation:
              "You adjust often but tracking is unclear."
          },
          {
            range: [11, 15],
            rating: "🟠 Operational Inertia",
            interpretation:
              "Changes happen but lack ownership or follow‑through."
          },
          {
            range: [5, 10],
            rating: "🔴 Stagnant Systems",
            interpretation:
              "Processes persist without question."
          }
        ]
      },

      // 5. Experimental Culture Index
      {
        id: "experimental-culture",
        title: "Experimental Culture Index",
        description:
          "Gauge the degree to which experimentation is encouraged, safe, and rewarded.",
        questions: [
          {
            statement:
              "Can staff propose experiments or pilot ideas with minimal red tape or formal approvals?",
            clarification:
              "Innovation doesn’t require long proposal cycles."
          },
          {
            statement:
              "Are failures from well‑designed experiments treated as learning opportunities, not performance failures?",
            clarification: "Post‑mortems focus on learning, not blame."
          },
          {
            statement:
              "Have you seen multiple teams run pilots, A/B tests, or prototyping in the last 12 months?",
            clarification:
              "E.g., new process testing or UI experiments."
          },
          {
            statement:
              "Are there budget lines or time allocations specifically set aside for experimentation?",
            clarification:
              "Innovation budget, sandbox time, pilot sprints."
          },
          {
            statement:
              "Is experimentation used beyond product or tech teams—e.g., in HR, finance, or service units?",
            clarification:
              "Testing recruitment processes or policy tweaks."
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning:
              "Experimentation is routine, safe, and supported."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning:
              "Pilots occur but lack consistent support or follow‑through."
          },
          {
            label: "No",
            score: 1,
            meaning:
              "Innovation is blocked by red tape or fear."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔵 Experimentation‑Driven",
            interpretation:
              "Testing and learning are embedded culture."
          },
          {
            range: [16, 20],
            rating: "🟢 Supported Exploration",
            interpretation:
              "Pilots are allowed but sporadic."
          },
          {
            range: [11, 15],
            rating: "🟠 Hesitant Culture",
            interpretation:
              "Only safe or symbolic experiments occur."
          },
          {
            range: [5, 10],
            rating: "🔴 Risk‑Averse System",
            interpretation:
              "Fear or complexity blocks innovation."
          }
        ]
      }
    ],
    // Unified per‑question rubric
    sharedScoring: [
      { label: "Yes", score: 5, interpretation: "Consistently practiced" },
      { label: "Not Sure", score: 3, interpretation: "Exists but inconsistent" },
      { label: "No", score: 1, interpretation: "Absent or rarely practiced" }
    ],
    // Overall
    totalScoreInterpretation: [
      {
        range: [105, 125],
        rating: "🔵 Engineered Orchestration System",
        interpretation:
          "You run on feedback, learning, agility, and experimentation."
      },
      {
        range: [85, 104],
        rating: "🟢 Mature and Responsive System",
        interpretation:
          "Strong orchestration with room to tighten learning loops."
      },
      {
        range: [65, 84],
        rating: "🟡 Developing System",
        interpretation:
          "Progress is visible but systems remain fragmented or shallow."
      },
      {
        range: [45, 64],
        rating: "🟠 Reactive and Isolated",
        interpretation:
          "Your organization struggles to act systemically."
      },
      {
        range: [25, 44],
        rating: "🔴 Fragile and Static",
        interpretation:
          "Change, learning, and experimentation are weak or blocked."
      }
    ]
  },

  // System of Illustration
  {
    id: "illustration",
    title: "The System of Illustration",
    icon: "📊",
    description:
      "The way ideas, strategies, and visions are communicated, emphasizing visualization of how components interact.",
    goal: "Assess how well strategy is communicated visually and narratively",
    subAssessments: [
      // 1. Strategic Illustration Clarity Audit
      {
        id: "strategic-clarity",
        title: "Strategic Illustration Clarity Audit",
        description:
          "Evaluate how well strategy is communicated visually and narratively to drive alignment and understanding.",
        questions: [
          {
            statement:
              "Is there a single visual or set of diagrams that clearly represent your organizational strategy or vision?",
            clarification:
              "e.g., Strategy Map, Vision Framework slide shown in onboarding."
          },
          {
            statement:
              "Can you show 3 staff members and ask them to explain what the strategy means based on these visuals—and they succeed?",
            clarification:
              "Try a sample from HR, Operations, and Finance."
          },
          {
            statement:
              "Do different leaders use the same visuals when talking about goals, performance, or direction?",
            clarification:
              "Check for consistency in town halls, planning decks."
          },
          {
            statement:
              "Have strategic visuals been updated or improved in the last 12 months based on feedback or confusion?",
            clarification:
              "Any visual refinement from feedback, surveys, or learning loops."
          },
          {
            statement:
              "Are visuals integrated into your onboarding, learning programs, or town hall decks—rather than just attached separately?",
            clarification:
              "Used as part of delivery, not as a one‑off file."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Visuals exist, are current, and widely used." },
          { label: "Not Sure", score: 3, meaning: "Visuals exist but lack consistency or currency." },
          { label: "No", score: 1, meaning: "No coherent strategic visuals in use." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🎯 Fully Embedded Visual Strategy",
            interpretation:
              "Strategy is visually clear, widely understood, and consistently communicated."
          },
          {
            range: [16, 20],
            rating: "🟡 Mixed Visual Use",
            interpretation:
              "Visuals are present but not integrated into everyday strategy communication."
          },
          {
            range: [11, 15],
            rating: "⚠️ Unclear or Underused Visuals",
            interpretation:
              "Strategy visuals exist but lack relevance or staff recall."
          },
          {
            range: [5, 10],
            rating: "❌ No Visual Culture",
            interpretation:
              "Visual strategy tools are absent or symbolic only; start visual design foundations."
          }
        ]
      },

      // 2. Internal Model Fluency & Utility Diagnostic
      {
        id: "model-fluency",
        title: "Internal Model Fluency & Utility Diagnostic",
        description:
          "Assess whether internal models and frameworks are understood, used, and contextually adapted by teams across the organization.",
        questions: [
          {
            statement:
              "Are internal models or frameworks used to guide decisions rather than just as training artifacts?",
            clarification:
              "E.g., Customer Journey Map, Risk Matrix in meetings."
          },
          {
            statement:
              "Would someone from sales understand and apply a model created by operations?",
            clarification: "Cross‑departmental utility of models."
          },
          {
            statement:
              "Has your team ever modified or improved a model to make it more relevant?",
            clarification: "Adaptation of framework for relevance."
          },
          {
            statement:
              "Can non‑leaders explain how any model works and what each part represents?",
            clarification: "Assess conceptual clarity among staff."
          },
          {
            statement:
              "Is there a method for teams to request help or clarification when models are unclear?",
            clarification:
              "Help channels: facilitators, model guides, explainer decks."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Models are routinely used and adapted." },
          { label: "Not Sure", score: 3, meaning: "Models exist but usage is spotty." },
          { label: "No", score: 1, meaning: "Models are unused or unknown." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🧠 High Model Literacy",
            interpretation:
              "Teams understand, adapt, and apply internal models consistently in decisions."
          },
          {
            range: [16, 20],
            rating: "📘 Moderate Fluency",
            interpretation:
              "Models exist and are occasionally used, but depth and reach vary."
          },
          {
            range: [11, 15],
            rating: "⚠️ Inconsistent Understanding",
            interpretation:
              "Usage is shallow or limited to isolated departments."
          },
          {
            range: [5, 10],
            rating: "❌ Modeling Deficiency",
            interpretation:
              "Teams are unaware of or disconnected from any core models; redesign needed."
          }
        ]
      },

      // 3. Message Resonance & Storytelling Culture Check
      {
        id: "message-resonance",
        title: "Message Resonance & Storytelling Culture Check",
        description:
          "Assess how well internal stories, metaphors, and campaigns inspire behavior and decision‑making.",
        questions: [
          {
            statement:
              "Can most staff recall at least one internal story, metaphor, or campaign used in the last 18 months that influenced behavior or thinking?",
            clarification:
              "Think of phrases or taglines staff reference or joke about."
          },
          {
            statement:
              "Have these messages been referenced by teams when making decisions or giving feedback?",
            clarification: "Messages used to validate decisions."
          },
          {
            statement:
              "Are there places in your culture where stories, symbols, or phrases are embedded in team rituals, conversations, or recognition?",
            clarification:
              "Use of metaphors in awards, wall art, or emails."
          },
          {
            statement:
              "Have you ever retired a campaign or story because it stopped resonating or lost meaning over time?",
            clarification: "Message lifecycle awareness."
          },
          {
            statement:
              "Can anyone explain what internal campaigns were intended to change, and whether that change actually occurred?",
            clarification:
              "Clear link between campaign and behavior change."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Stories and metaphors drive real behavior." },
          { label: "Not Sure", score: 3, meaning: "Stories exist but their impact is unclear." },
          { label: "No", score: 1, meaning: "No memorable internal narratives in use." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔥 Strong Story Culture",
            interpretation:
              "Stories, metaphors, and campaigns influence behavior and shape decisions."
          },
          {
            range: [16, 20],
            rating: "🎤 Some Resonance",
            interpretation:
              "Messaging exists but fades or varies across departments."
          },
          {
            range: [11, 15],
            rating: "⚠️ Low Recall or Impact",
            interpretation:
              "Messaging lacks emotional or cultural stickiness."
          },
          {
            range: [5, 10],
            rating: "❌ Message Fatigue",
            interpretation:
              "Internal messages are ignored, forgotten, or irrelevant."
          }
        ]
      },

      // 4. Visual Communication Integration Assessment
      {
        id: "visual-communication",
        title: "Visual Communication Integration Assessment",
        description:
          "Check whether visual communication outperforms text‑based formats in comprehension and decision‑making.",
        questions: [
          {
            statement:
              "Are dashboards, reports, or strategy reviews primarily visual rather than text‑heavy?",
            clarification:
              "Look for pie charts, flow diagrams, icon‑based indicators."
          },
          {
            statement:
              "Do leaders default to sketching, whiteboarding, or diagramming when explaining ideas or solving problems?",
            clarification:
              "Boardroom or virtual whiteboarding habits."
          },
          {
            statement:
              "Are visuals such as charts, swimlanes, or process diagrams used in team meetings, not just executive briefings?",
            clarification:
              "Visuals embedded in regular meeting culture."
          },
          {
            statement:
              "In internal training or manuals, are images/diagrams prioritized over bullet points and definitions?",
            clarification:
              "Infographic‑style learning vs. paragraph explanations."
          },
          {
            statement:
              "Can visuals be interpreted quickly and clearly by someone unfamiliar with the context?",
            clarification:
              "No decoding needed, even for newcomers."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Visuals dominate and clarify content." },
          { label: "Not Sure", score: 3, meaning: "Visuals exist but are uneven or generic." },
          { label: "No", score: 1, meaning: "Communications rely on text alone." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🖼️ Visual‑First Culture",
            interpretation:
              "Visual formats are the norm in reporting, strategy, and learning."
          },
          {
            range: [16, 20],
            rating: "📊 Balanced Use",
            interpretation:
              "Visuals are strong in some areas but text still dominates key functions."
          },
          {
            range: [11, 15],
            rating: "⚠️ Text‑Dominant",
            interpretation:
              "Reports, communications, and training are mostly text‑heavy."
          },
          {
            range: [5, 10],
            rating: "❌ Poor Visual Accessibility",
            interpretation:
              "Visual language is neglected or too complex for regular use."
          }
        ]
      },

      // 5. Visual Literacy in Leadership Evaluation
      {
        id: "visual-literacy",
        title: "Visual Literacy in Leadership Evaluation",
        description:
          "Determine how well leaders use visuals and illustrations to engage teams and explain strategic thinking.",
        questions: [
          {
            statement:
              "Do leaders frequently use diagrams, hand‑drawn visuals, or models to communicate strategic direction?",
            clarification:
              "E.g., journey maps, quadrant grids in exec updates."
          },
          {
            statement:
              "When discussing problems, do leaders draw or visualize the issue, rather than only describing it verbally?",
            clarification:
              "Sketching during meetings or brainstorming."
          },
          {
            statement:
              "Are frameworks used in coaching or mentoring conversations?",
            clarification:
              "Use of pyramids, loops, or ladders in guidance sessions."
          },
          {
            statement:
              "Do leaders use metaphors or symbolic visuals when articulating strategic shifts or trade‑offs?",
            clarification:
              "E.g., flying wheel, iceberg, bridge."
          },
          {
            statement:
              "Do visuals used by different leaders convey a consistent message, or do they diverge widely by personality?",
            clarification:
              "Common visual language across leadership."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Leaders model visual thinking." },
          { label: "Not Sure", score: 3, meaning: "Some leaders use visuals; others do not." },
          { label: "No", score: 1, meaning: "Leaders rely exclusively on text or speech." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🎨 Visual Leadership Culture",
            interpretation:
              "Leaders use visuals to clarify strategy, coach teams, and model thinking."
          },
          {
            range: [16, 20],
            rating: "🧭 Emerging Visual Fluency",
            interpretation:
              "Some leaders use visuals; others rely on verbal/text‑only approaches."
          },
          {
            range: [11, 15],
            rating: "⚠️ Text‑Dominant Leadership Style",
            interpretation:
              "Visual thinking is weak or inconsistently applied by leaders."
          },
          {
            range: [5, 10],
            rating: "❌ Visual Thinking Deficit",
            interpretation:
              "Leaders rarely or never use visuals; communication is abstract or misaligned."
          }
        ]
      }
    ],
    // Shared per-question rubric
    sharedScoring: [
      { label: "Yes", score: 5, interpretation: "Consistently practiced" },
      { label: "Not Sure", score: 3, interpretation: "Exists but inconsistent" },
      { label: "No", score: 1, interpretation: "Absent or rarely practiced" }
    ],
    // Overall 
    totalScoreInterpretation: [
      {
        range: [105, 125],
        rating: "🔵 Optimized System",
        interpretation:
          "Visual thinking is deeply embedded. Reinforce and replicate best practices."
      },
      {
        range: [85, 104],
        rating: "🟢 Mature System",
        interpretation:
          "The system is functional and scalable. Focus on refinement and consistency."
      },
      {
        range: [65, 84],
        rating: "🟡 Developing System",
        interpretation:
          "Good intent but inconsistent application. Needs structure and visibility."
      },
      {
        range: [45, 64],
        rating: "🟠 Basic Awareness",
        interpretation:
          "Visual practices are emerging. Formalize and align leadership support."
      },
      {
        range: [25, 44],
        rating: "🔴 Inactive System",
        interpretation:
          "Minimal or absent visual frameworks. Requires urgent redesign and rollout."
      }
    ]
  },

  // System of Interpretation
  {
    id: "interpretation",
    title: "The System of Interpretation",
    icon: "🧠",
    description:
      "Uncovering deeper meaning behind behaviors, incidents, and patterns within an organization.",
    goal:
      "Check if different teams interpret data/events consistently or cause misalignment",
    subAssessments: [
      // 1. Insight Framing Consistency Assessment
      {
        id: "insight-framing",
        title: "Insight Framing Consistency Assessment",
        description:
          "Check whether data and events are framed similarly across departments or leadership levels.",
        questions: [
          {
            statement:
              "Do multiple departments define key metrics or issues in the same way?",
            clarification:
              "E.g., retention or efficiency are understood the same in HR, Ops, and Finance."
          },
          {
            statement:
              "Has leadership articulated framing principles or standard definitions?",
            clarification: "Think of a shared glossary or terms‑in‑use."
          },
          {
            statement:
              "Are different levels of the organization referring to the same problem in the same way?",
            clarification:
              "Check if project charters, slides, or emails are aligned."
          },
          {
            statement:
              "Do senior leaders challenge inconsistent framing during meetings or reviews?",
            clarification: `E.g., ask "What do you mean by that metric?"`
          },
          {
            statement:
              "Have past framing errors led to visible delays, rework, or missed targets?",
            clarification:
              "E.g., conflicting definitions or goals."
          }
        ],
        scoringRubric: [
          {
            label: "Yes",
            score: 5,
            meaning: "The condition is consistently true and observable."
          },
          {
            label: "Not Sure",
            score: 3,
            meaning: "The condition may exist but is unclear or inconsistent."
          },
          {
            label: "No",
            score: 1,
            meaning: "The condition is absent or not practiced."
          }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🧠 Unified Strategic Understanding",
            interpretation:
              "Share best practice across functions."
          },
          {
            range: [16, 20],
            rating: "📘 Coordinated but Not Synced",
            interpretation:
              "Conduct interpretive alignment workshops."
          },
          {
            range: [11, 15],
            rating: "⚠️ Mixed Signal Culture",
            interpretation:
              "Create reference guides for framing data and metrics."
          },
          {
            range: [5, 10],
            rating: "🔴 Fragmented Insight Environment",
            interpretation:
              "Standardize definitions and interpretations through strategic comms."
          }
        ]
      },

      // 2. Sensemaking and Meaning Alignment Test
      {
        id: "sensemaking",
        title: "Sensemaking and Meaning Alignment Test",
        description:
          "Assess whether teams interpret ambiguous situations in a shared, productive way.",
        questions: [
          {
            statement:
              "Do teams converge on the same conclusions when interpreting the same data or event?",
            clarification:
              "Do dashboards spark similar interpretations across units?"
          },
          {
            statement:
              "Is ambiguity openly discussed during planning or decision-making?",
            clarification:
              `Look for phrases like "What do we think this means?"`
          },
          {
            statement:
              "Are reflection or postmortem sessions held after key outcomes?",
            clarification:
              "Formal debriefs to analyze decisions or signals."
          },
          {
            statement:
              "Have meaning-misalignment issues led to project breakdowns?",
            clarification: `Past confusion over why we're doing this.`
          },
          {
            statement:
              "Are symbolic events or changes interpreted consistently?",
            clarification:
              "Watch for diverging narratives after such events."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Consistently true and observable." },
          {
            label: "Not Sure",
            score: 3,
            meaning: "May exist but is unclear or inconsistent."
          },
          { label: "No", score: 1, meaning: "Absent or not practiced." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🎯 Aligned Understanding",
            interpretation:
              "Maintain joint reflection and post‑mortem practices."
          },
          {
            range: [16, 20],
            rating: "🔄 Coordinated but with Gaps",
            interpretation:
              "Facilitate strategic reflection and interpretive bias training."
          },
          {
            range: [11, 15],
            rating: "⚠️ Partial Agreement Only",
            interpretation:
              "Reframe how meaning is generated and communicated."
          },
          {
            range: [5, 10],
            rating: "❌ Interpretive Chaos",
            interpretation:
              "Introduce a structured approach to meaning-making across teams."
          }
        ]
      },

      // 3. Narrative Integrity Review
      {
        id: "narrative",
        title: "Narrative Integrity Review",
        description:
          "Check whether leaders and teams tell a coherent, aligned story about where the organization is and where it's going.",
        questions: [
          {
            statement:
              "Are strategic messages repeated consistently by leaders across the organization?",
            clarification: "Language patterns across levels."
          },
          {
            statement:
              "Do employees cite similar reasons for why current priorities matter?",
            clarification: "Story consistency among middle managers."
          },
          {
            statement:
              "Do internal documents and comms reflect a clear, reinforcing narrative?",
            clarification: "Strategy decks, emails, and internal campaigns."
          },
          {
            statement:
              "Are success and failure stories shared consistently to reinforce culture?",
            clarification: "E.g., learning stories, cautionary tales."
          },
          {
            statement:
              "Have you seen conflicting or contradictory narratives cause confusion?",
            clarification: "E.g., different messages from different VPs."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Consistently true and observable." },
          {
            label: "Not Sure",
            score: 3,
            meaning: "May exist but is unclear or inconsistent."
          },
          { label: "No", score: 1, meaning: "Absent or not practiced." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "📖 Cohesive Narrative Culture",
            interpretation:
              "Reinforce through storytelling champions and onboarding integration."
          },
          {
            range: [16, 20],
            rating: "🟡 Partially Aligned Narratives",
            interpretation:
              "Facilitate narrative workshops; review embedding of values and strategy."
          },
          {
            range: [11, 15],
            rating: "⚠️ Fragmented Message Zones",
            interpretation:
              "Audit communication artifacts and executive alignment."
          },
          {
            range: [5, 10],
            rating: "❌ Cultural Narrative Breakdown",
            interpretation:
              "Redesign internal communication and clarify identity via culture work."
          }
        ]
      },

      // 4. Signal-to-Noise Ratio Audit
      {
        id: "signal-noise",
        title: "Signal-to-Noise Ratio Audit",
        description:
          "Evaluate whether organizational attention is focused on meaningful signals versus distractions.",
        questions: [
          {
            statement:
              "Do leadership and teams regularly review only a few high-signal metrics?",
            clarification:
              "Dashboards with fewer than 10 key indicators."
          },
          {
            statement:
              "Are distracting or redundant reports being discontinued?",
            clarification: "E.g., merged KPIs, legacy metrics dropped."
          },
          {
            statement:
              "Can people articulate what qualifies as a signal vs. a distraction?",
            clarification: "Defined sense of what's important."
          },
          {
            statement:
              "Has a poor signal-to-noise ratio contributed to poor decisions?",
            clarification:
              "Lost time due to data overload or distraction."
          },
          {
            statement:
              "Are people trained or guided on how to interpret signals?",
            clarification: "Orientation or leadership coaching?"
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Consistently true and observable." },
          {
            label: "Not Sure",
            score: 3,
            meaning: "May exist but is unclear or inconsistent."
          },
          { label: "No", score: 1, meaning: "Absent or not practiced." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔍 Signal‑Driven Organization",
            interpretation:
              "Systematize escalation protocols and noise reduction training."
          },
          {
            range: [16, 20],
            rating: "📊 Insight‑Focused but Patchy",
            interpretation:
              "Clarify which indicators matter most; improve signal filtering."
          },
          {
            range: [11, 15],
            rating: "⚠️ Mixed Signal Prioritization",
            interpretation:
              "Reset what data matters and refine leadership focus routines."
          },
          {
            range: [5, 10],
            rating: "❌ Noise‑Dominated Organization",
            interpretation:
              "Audit dashboards and feedback loops; rebuild prioritization models."
          }
        ]
      },

      // 5. Cross-Level Insight Transfer Scorecard
      {
        id: "cross-level",
        title: "Cross-Level Insight Transfer Scorecard",
        description:
          "Ensure that insights and interpretations move both up and down the hierarchy effectively.",
        questions: [
          {
            statement:
              "Are insights from the frontline regularly elevated to senior leadership?",
            clarification:
              "E.g., customer feedback, on‑the‑ground blockers."
          },
          {
            statement:
              "Are strategic insights from leadership shared in ways the frontline understands?",
            clarification: "Decoded vision into actionable meaning."
          },
          {
            statement:
              "Are there recurring meetings or rituals to share insights across levels?",
            clarification: "All‑hands, syncs, team briefs."
          },
          {
            statement:
              "Do mid-level managers play an active role in translating insights both upward and downward?",
            clarification: "Bridge behaviors."
          },
          {
            statement:
              "Have breakdowns in insight transfer led to preventable errors?",
            clarification: "Missed learnings, wrong actions."
          }
        ],
        scoringRubric: [
          { label: "Yes", score: 5, meaning: "Consistently true and observable." },
          {
            label: "Not Sure",
            score: 3,
            meaning: "May exist but is unclear or inconsistent."
          },
          { label: "No", score: 1, meaning: "Absent or not practiced." }
        ],
        scoreInterpretation: [
          {
            range: [21, 25],
            rating: "🔁 Dynamic Cross-Level Insight Org",
            interpretation:
              "Sustain visibility routines and insight rituals."
          },
          {
            range: [16, 20],
            rating: "🔄 Structured but Incomplete Flow",
            interpretation:
              "Create playbooks for insight transfer and response tracking."
          },
          {
            range: [11, 15],
            rating: "⚠️ Passive or Interrupted Loops",
            interpretation:
              "Establish formal loops: insight → decision → communication → feedback."
          },
          {
            range: [5, 10],
            rating: "🧱 Insight Bottlenecked or Trapped",
            interpretation:
              "Redesign communication architecture; assign insight owners."
          }
        ]
      }
    ],
    // Shared per-question rubric
    sharedScoring: [
      { label: "Yes", score: 5, interpretation: "Consistently practiced" },
      {
        label: "Not Sure",
        score: 3,
        interpretation: "Exists but is inconsistent or unclear"
      },
      { label: "No", score: 1, interpretation: "Absent or not practiced" }
    ],
    // Overall
    totalScoreInterpretation: [
      {
        range: [105, 125],
        rating: "✅ Cohesive Interpretive Intelligence",
        interpretation:
          "Insight flows and shared meaning are guiding aligned action."
      },
      {
        range: [85, 104],
        rating: "🟡 Semi‑Aligned Sensemaking",
        interpretation:
          "Some meaning gaps or interpretive fragmentation remain."
      },
      {
        range: [65, 84],
        rating: "⚠️ Mixed Signals & Delayed Understanding",
        interpretation:
          "Lack of coherence leads to confusion and wasted effort."
      },
      {
        range: [5, 64],
        rating: "🔴 Disconnected Insight Culture",
        interpretation:
          "Meaning and insight are not transferring effectively—urgent reframe needed."
      }
    ]
  },

];

