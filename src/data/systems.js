export const systems = [
    // System of Interdependency
  {
    id: 'interdependency',
    title: "The System of Interdependency & Interaction",
    icon: "🔗",
    description: "This captures how parts of the organization rely on each other. This system emphasizes that everything in an organization is connected.",
    goal: "Identify where collaboration is likely to fail between teams, departments, or individuals",
    isInterdependency: true,
    subAssessments: [
      {
        id: 'crb',
        title: 'Core Response Behaviors (CRBs)',
        description: 'Assess whether your organization\'s crisis responses are constructive (aligned, adaptive, resilient) or detrimental (reactive, misaligned, short-term).',
        questions: [
          {
            statement: 'Does your organization quickly adjust its strategy in response to emerging crises?',
            clarification: 'Think of a recent crisis—how fast did your strategy shift?'
          },
          {
            statement: 'Does your team document and review lessons from past crises to avoid repeat failures?',
            clarification: 'E.g., retrospective sessions, updated playbooks.'
          },
          {
            statement: 'Are unconventional or innovative solutions welcomed during high-pressure moments?',
            clarification: 'Are new ideas explored instead of reverting to defaults?'
          },
          {
            statement: 'Do crisis-time decisions consistently reflect your organization’s core values?',
            clarification: 'Consider if ethical commitments are maintained under pressure.'
          },
          {
            statement: 'Is there evidence that integrity is upheld during crisis response—even at cost?',
            clarification: 'Were shortcuts or ethical compromises avoided?'
          },
          {
            statement: 'Does leadership messaging remain consistent and values-driven throughout crises?',
            clarification: 'Messaging tone: does it match long-term vision or just spin?'
          },
          {
            statement: 'Do your crisis responses result in long-term resolution rather than temporary relief?',
            clarification: 'Did the issue resurface due to incomplete fixes?'
          },
          {
            statement: 'Is reputational damage minimized or reversed after crisis handling?',
            clarification: 'Public or partner trust recovered/improved?'
          },
          {
            statement: 'Do stakeholders express increased confidence in leadership after crises?',
            clarification: 'Client/employee feedback, engagement, media tone.'
          },
          {
            statement: 'Are risks regularly identified and addressed before they escalate?',
            clarification: 'Routine risk reviews, red flags tracked.'
          },
          {
            statement: 'Does your organization take early action during signs of instability?',
            clarification: 'E.g., preemptive hiring freeze, early supply shifts.'
          },
          {
            statement: 'Is scenario planning or war-gaming used for crisis preparedness?',
            clarification: 'Think of future simulations or contingency drills.'
          },
          {
            statement: 'Do cross-functional teams collaborate clearly during crises?',
            clarification: 'Look for shared crisis boards, joint task forces.'
          },
          {
            statement: 'Are team roles and responsibilities clear during high-stakes events?',
            clarification: 'Ambiguity reduced or leadership overlaps?'
          },
          {
            statement: 'Is there a culture that avoids blame and focuses on solutions during setbacks?',
            clarification: 'Who gets questioned first—the person or the system?'
          },
        ]
      },
      {
        id: 'internal-client',
        title: 'Internal Client Satisfaction',
        description: 'To objectively assess how well internal teams serve each other as clients, using clear, real-world behavior and performance indicators.',
        questions: [
          {
            statement: 'Are service requests typically acknowledged within 24 hours of being sent?',
            clarification: 'Think about the average time between a request and a response.'
          },
          {
            statement: 'Do service teams inform clients when there are delays or issues fulfilling requests?',
            clarification: 'Was the client updated before escalation?'
          },
          {
            statement: 'Is the final output often reviewed by the service team for accuracy before delivery?',
            clarification: 'Do errors get caught internally or by the client?'
          },
          {
            statement: 'Do service teams communicate clearly what is being delivered, by when, and how?',
            clarification: 'Were timelines and scope made clear from the start?'
          },
          {
            statement: 'Is there a process for internal clients to raise concerns and receive follow-up?',
            clarification: 'Think of helpdesks, ticketing, or feedback forms.'
          },
          {
            statement: 'Have internal teams received direct appreciation from clients for their professionalism?',
            clarification: 'Check emails, messages, or mentions in review.'
          },
          {
            statement: 'Do internal service teams routinely offer solutions beyond what was requested?',
            clarification: 'Examples of proactive problem-solving or added insights.'
          },
          {
            statement: 'Are deliverables from internal teams consistently aligned with what the requesting team needs to meet its own goals?',
            clarification: 'Do they improve or complicate the requester’s job?'
          },
          {
            statement: 'Are internal clients regularly engaged for feedback on how to improve the service?',
            clarification: 'Surveys, check-ins, reviews, etc.'
          },
          {
            statement: 'Has the service team adjusted its delivery methods or tools based on past client feedback?',
            clarification: 'Evidence of evolution or fixed style?'
          },
        ]
      },
      {
        id: 'dependency-mapping',
        title: 'Dependency Mapping',
        description: 'Help leaders and teams assess the strength, clarity, and risks of their operational interdependencies.',
        questions: [
          {
            statement: 'Is the reason why your team depends on this other team or process clearly defined and agreed on?',
            clarification: 'Purpose alignment — why the dependency exists.'
          },
          {
            statement: 'Is the dependency relationship documented (SOPs, RACI, SLAs) or just assumed?',
            clarification: 'Check for shared clarity in procedures.'
          },
          {
            statement: 'Would it cause serious disruption if this team did not deliver as expected?',
            clarification: 'Criticality — how vital is their function to your work?'
          },
          {
            statement: 'Is communication between both teams structured and frequent, or only reactive?',
            clarification: 'Interaction rhythm — think beyond emergency communication.'
          },
          {
            statement: 'When you make a request, do you receive a response within an agreed or predictable time?',
            clarification: 'Reliability of turnaround.'
          },
          {
            statement: 'Has the quality or reliability of this dependency improved in the last 6 months?',
            clarification: 'Trajectory — improving or stagnant.'
          },
          {
            statement: 'Are risks of disruption known and documented (e.g., team gaps, tools, delays)?',
            clarification: 'Vulnerability — is there awareness and mitigation?'
          },
          {
            statement: 'Have issues with this dependency resulted in missed goals, rework, or reputational damage?',
            clarification: 'Consequences of failure.'
          },
          {
            statement: 'Is there a feedback mechanism in place between your team and theirs?',
            clarification: 'Can you share or receive feedback easily?'
          },
          {
            statement: 'Has this dependency been reviewed in a cross-functional forum in the last year?',
            clarification: 'Governance — reviewed jointly or in isolation?'
          },
        ]
      },
      {
        id: 'trust-flow',
        title: 'Cross-Team Trust and Flow Index',
        description: 'To measure trust, feedback loops, and communication fluidity between departments or cross-functional teams.',
        questions: [
          {
            statement: 'Do teams address issues or breakdowns directly with each other before escalating?',
            clarification: 'E.g., Teams try resolution together before looping in leadership.'
          },
          {
            statement: 'Are requests and feedback acknowledged within 24 hours in most cross-team interactions?',
            clarification: 'Confirmation of receipt and expectations.'
          },
          {
            statement: 'Are joint team goals reviewed together rather than assumed independently?',
            clarification: 'Shared OKRs or planning rituals.'
          },
          {
            statement: 'Is there an established routine (weekly, biweekly) where these two teams engage?',
            clarification: 'Scheduled sync-ups or structured updates.'
          },
          {
            statement: 'When there\'s disagreement, do teams resolve through open dialogue rather than avoidance or passive pushback?',
            clarification: 'Feedback loops, retrospectives, open challenge channels.'
          },
          {
            statement: 'Have representatives of both teams attended a learning, retrospective, or co-design session in the past 6 months?',
            clarification: 'Collaborative settings beyond firefighting.'
          },
          {
            statement: 'Do both teams contribute information proactively, without needing to be asked?',
            clarification: 'E.g., usage data, timelines, changes shared unprompted.'
          },
          {
            statement: 'Do teams express confidence in each other\'s follow-through?',
            clarification: 'Reliability patterns in hitting joint deliverables.'
          },
          {
            statement: 'Have both teams given each other constructive feedback and acted on it?',
            clarification: 'Documented feedback, post-action improvements.'
          },
          {
            statement: 'Are escalations rare and typically the last resort?',
            clarification: 'Is direct problem-solving the norm?'
          },
        ]
      },
      {
        id: 'silo-impact',
        title: 'Silo Impact Scorecard',
        description: 'To evaluate the presence and cost of silos in decision-making, delivery, and learning across functions or units.',
        questions: [
          {
            statement: 'Do both teams consult each other before making decisions that impact shared workflows?',
            clarification: 'Checks for upstream-downstream awareness and consultation.'
          },
          {
            statement: 'Are handovers or transitions between these teams free from duplicated work or redundant checks?',
            clarification: 'E.g., does the same data or task get redone or verified twice unnecessarily?'
          },
          {
            statement: 'Do the two teams have aligned timelines or deliverables that directly support each other\'s goals?',
            clarification: 'Conflict in deadlines, sequence gaps, or delivery mismatch are red flags.'
          },
          {
            statement: 'Have either team missed out on learnings, mistakes, or innovations due to lack of knowledge sharing?',
            clarification: 'Check if problems were solved by one team but repeated by another.'
          },
          {
            statement: 'Does leadership from either team reinforce functional isolation—implicitly or explicitly?',
            clarification: 'Look for signaling: do leaders reward turf, autonomy, or cross-pollination?'
          },
        ]
      },
      {
        id: 'breakdown-risk',
        title: 'Interaction Breakdown Risk Audit',
        description: 'To detect where collaboration is likely to fail due to unclear, irregular, or broken interaction links.',
        questions: [
          {
            statement: 'Are the roles and responsibilities of both parties clearly defined in the interaction?',
            clarification: 'Interaction Clarity — E.g., each team knows what they owe and expect.'
          },
          {
            statement: 'Does this interaction happen regularly and predictably?',
            clarification: 'Interaction Frequency — E.g., weekly handoffs, biweekly syncs.'
          },
          {
            statement: 'Is the interaction directly tied to work outputs or decisions that matter?',
            clarification: 'Purpose Alignment — E.g., tied to a milestone, delivery, or performance trigger.'
          },
          {
            statement: 'Do both parties follow up or respond to requests in a timely manner?',
            clarification: 'Responsiveness — E.g., is the loop closed consistently?'
          },
          {
            statement: 'Is the interaction respectful, and are tensions handled constructively?',
            clarification: 'Friction/Tension — Is it safe to challenge or raise issues?'
          },
        ]
      }
    ]
  },
  
  // System of Inlignment
  {
    id: 'inlignment',
    title: "The System of Inlignment",
    icon: "🎯",
    description: "A fusion of 'alignment' and 'inline'—ensuring all components work seamlessly toward the same objectives.",
    goal: "Ensure daily decisions reflect the organization's stated vision and mission",
    subAssessments: [
      {
        id: 'vision-behavior',
        title: 'Vision-to-Behavior Alignment Test',
        description: 'Track whether daily behaviors and decisions reflect the organization\'s stated vision and mission.',
        questions: [
          {
            statement: 'Do employees regularly reference the vision or mission in discussions or meetings?',
            clarification: 'E.g., project justifications refer to the mission.'
          },
          {
            statement: 'Do leaders model the vision in both behavior and decision logic?',
            clarification: 'Consistency between stated values and actions.'
          },
          {
            statement: 'Do performance reviews or team rituals reinforce the vision?',
            clarification: 'Vision embedded in evaluations or check-ins.'
          },
          {
            statement: 'Is it clear how each role contributes to realizing the vision?',
            clarification: 'Role-to-vision traceable connection.'
          },
          {
            statement: 'Are employees recognized for actions that align with the mission?',
            clarification: 'Shout-outs, rewards, storytelling.'
          }
        ]
      },
      {
        id: 'goal-harmony',
        title: 'Goal Harmony Assessment',
        description: 'Evaluate how well team, departmental, and individual goals cascade and contribute to strategic objectives.',
        questions: [
          {
            statement: 'Do individuals know how their goals link to organizational strategy?',
            clarification: 'Ask how team deliverables support big-picture plans.'
          },
          {
            statement: 'Are departmental goals explicitly derived from strategic goals?',
            clarification: 'Mapped goals visible in team plans.'
          },
          {
            statement: 'Do leaders discuss strategy during goal setting?',
            clarification: 'Mention of strategic priorities during planning.'
          },
          {
            statement: 'Are team KPIs tracked alongside strategic metrics?',
            clarification: 'Dashboard visibility or alignment.'
          },
          {
            statement: 'Do teams collaborate on joint success metrics?',
            clarification: 'Cross-functional shared KPIs or OKRs.'
          }
        ]
      },
      {
        id: 'structural-strategy',
        title: 'Structural-Strategy Fit Review',
        description: 'Determine whether the current organizational structure supports and enables the desired strategy.',
        questions: [
          {
            statement: 'Do teams understand how their role aligns with strategic priorities?',
            clarification: 'Strategic clarity in job descriptions.'
          },
          {
            statement: 'Do decision rights align with speed and priority of tasks?',
            clarification: 'Quick decisions at the right level.'
          },
          {
            statement: 'Are spans of control manageable for effective oversight?',
            clarification: 'Not overly flat or bottlenecked.'
          },
          {
            statement: 'Do cross-functional collaborations flow without hierarchy blocks?',
            clarification: 'Joint task forces or squads work smoothly.'
          },
          {
            statement: 'Is structure reviewed when strategy shifts?',
            clarification: 'Realignments after major changes?'
          }
        ]
      },
      {
        id: 'cultural-fit',
        title: 'Cultural Fit to Execution Index',
        description: 'Measure whether organizational values and behaviors enable or block effective execution of strategy.',
        questions: [
          {
            statement: 'Do cultural norms reward delivery, not just effort or loyalty?',
            clarification: 'Outcomes celebrated over inputs.'
          },
          {
            statement: 'Are decisions made with clarity and speed?',
            clarification: 'Frictionless sign-offs, low rework.'
          },
          {
            statement: 'Are risk-taking and initiative encouraged by culture?',
            clarification: 'Innovation stories or safety to try.'
          },
          {
            statement: 'Are accountability systems consistent with stated values?',
            clarification: 'Responsibility aligns with empowerment.'
          },
          {
            statement: 'Do teams operate with urgency where needed?',
            clarification: 'Pace matches stakes.'
          }
        ]
      },
      {
        id: 'incentive-system',
        title: 'Incentive System Coherence Test',
        description: 'Audit whether reward and recognition systems drive aligned and desirable behaviors in line with strategy and culture.',
        questions: [
          {
            statement: 'Are incentives linked directly to strategic goals or KPIs?',
            clarification: 'Bonus criteria tied to mission.'
          },
          {
            statement: 'Do rewards encourage teamwork and shared results?',
            clarification: 'Group awards or team performance points.'
          },
          {
            statement: 'Is reward fairness perceived and supported by transparency?',
            clarification: 'Pay equity and promotion clarity.'
          },
          {
            statement: 'Have incentives led to undesired behaviors?',
            clarification: 'Conflict, rework, resentment patterns.'
          },
          {
            statement: 'Has employee feedback ever led to updates in incentive design?',
            clarification: 'Input-led changes documented?'
          }
        ]
      }
    ]
  },
  
  // System of Investigation
  {
    id: 'investigation',
    title: "The System of Investigation",
    icon: "🔎",
    description: "How an organization digs for answers and keeps looking for the 'whys' of incidents to understand root causes.",
    goal: "Measure how thoroughly and objectively problems are probed during incident reviews",
    subAssessments: [
      {
        id: 'blame-diagnosis',
        title: 'Blame vs. System Diagnosis Index',
        description: 'Detect whether your organization scapegoats individuals during problems and crises, or responds by diagnosing and redesigning systems to prevent recurrence.',
        questions: [
          {
            statement: 'When a failure occurs, is the first question typically "Who is responsible?" rather than "What broke in the system?"',
            clarification: 'Check how leadership or teams react during errors—do they seek a culprit or a cause?'
          },
          {
            statement: 'In moments of crisis or mistakes, do leaders publicly protect individuals while directing focus to the system?',
            clarification: 'Think of leadership statements after breakdowns—are they about system correction or personal blame?'
          },
          {
            statement: 'Are process gaps, unclear expectations, or outdated workflows openly identified as contributors to poor outcomes?',
            clarification: 'Was the root cause ever traced to a structural flaw rather than a person?'
          },
          {
            statement: 'Do staff feel safe admitting mistakes or raising breakdowns without fear of embarrassment or punishment?',
            clarification: 'Would a junior staff member raise a concern during a crisis meeting?'
          },
          {
            statement: 'After failures, are changes made to tools, structures, or workflows rather than just disciplinary actions?',
            clarification: 'What structural upgrades have occurred following a major error?'
          }
        ]
      },
      {
        id: 'data-discovery',
        title: 'Data-to-Discovery Maturity Assessment',
        description: 'Evaluate how well your organization uses data to uncover hidden operational insights rather than simply reporting metrics.',
        questions: [
          {
            statement: 'Do teams across departments have real-time access to clean, relevant data?',
            clarification: 'E.g., dashboards or shared data tools available without delay.'
          },
          {
            statement: 'Is data used for root cause analysis or trend discovery, not just reporting?',
            clarification: 'Beyond KPIs—are there investigations into patterns and deviations?'
          },
          {
            statement: 'When unexpected data trends arise, are they actively questioned and explored?',
            clarification: 'Does a spike or drop trigger inquiry or just notation?'
          },
          {
            statement: 'Do you routinely discover operational issues that weren\'t visible until data revealed them?',
            clarification: 'Hidden workflow bottlenecks or delays spotted via analysis.'
          },
          {
            statement: 'Do insights from data lead to concrete decisions or process changes?',
            clarification: 'E.g., dashboards trigger reallocations, reviews, or redesigns.'
          }
        ]
      },
      {
        id: 'investigative-rigor',
        title: 'Investigative Rigor Assessment',
        description: 'Measure how thoroughly and objectively problems are probed during incident reviews, diagnoses, or systemic evaluations.',
        questions: [
          {
            statement: 'When issues arise, do teams ask multiple "why" questions to reach underlying causes?',
            clarification: 'Look for inquiry beyond the surface symptom.'
          },
          {
            statement: 'Are biases (e.g., departmental, leadership, prior beliefs) actively challenged during investigations?',
            clarification: 'Do people openly test each other\'s assumptions?'
          },
          {
            statement: 'Are tools like 5 Whys, Fishbone, or Causal Loop Diagrams regularly used to diagnose issues?',
            clarification: 'Is there a structured method for finding causes?'
          },
          {
            statement: 'Do teams require data or evidence to support conclusions, rather than relying on opinions?',
            clarification: 'Decisions validated through observation, metrics.'
          },
          {
            statement: 'Are multiple possible causes examined before selecting a solution?',
            clarification: 'Are ideas tested or compared, not just accepted first pass?'
          }
        ]
      },
      {
        id: 'failure-analysis',
        title: 'Failure Analysis Culture Survey',
        description: 'Understand whether your organization consistently treats failures as learning opportunities—not events to punish, hide, or ignore.',
        questions: [
          {
            statement: 'Can employees admit failure without fear of consequences?',
            clarification: 'Do staff volunteer failure stories in public forums or retrospectives?'
          },
          {
            statement: 'Do leaders ask "why did it happen?" rather than "who caused it?"',
            clarification: 'Check if language focuses on causes or culprits.'
          },
          {
            statement: 'Are failure events documented in structured post-mortems or debriefs?',
            clarification: 'E.g., templates, after-action reviews, shared notes.'
          },
          {
            statement: 'Are failure-related lessons shared beyond the immediate team or department?',
            clarification: 'Look for learning portals, newsletters, or brown bags.'
          },
          {
            statement: 'Do visible, traceable improvements follow failure incidents?',
            clarification: 'E.g., updated playbooks, workflows, or new standards.'
          }
        ]
      },
      {
        id: 'root-cause',
        title: 'Root Cause Depth Audit',
        description: 'Assess whether your organization\'s investigations consistently identify systemic causes rather than stopping at surface-level symptoms.',
        questions: [
          {
            statement: 'When diagnosing a problem, do we distinguish between immediate symptoms and root systemic issues?',
            clarification: 'E.g., late reports vs. poor handoff design.'
          },
          {
            statement: 'Do we use structured tools in most investigation sessions?',
            clarification: 'Is the approach repeatable, or ad hoc and verbal?'
          },
          {
            statement: 'Are representatives from different departments or functions involved in investigations?',
            clarification: 'Do we cross-pollinate insights from multiple units?'
          },
          {
            statement: 'Are repeated failures treated as signals of deeper system issues rather than new isolated events?',
            clarification: 'Do recurrences trigger a different kind of review?'
          },
          {
            statement: 'Do our corrective actions address upstream structural or policy issues rather than just quick fixes?',
            clarification: 'E.g., redesigning flow, not just punishing a team.'
          }
        ]
      }
    ]
  },
   
  // System of Orchestration
  {
    id: 'orchestration',
    title: "The System of Orchestration",
    icon: "🔄",
    description: "A continuous improvement process driven by repeated cycles of testing, learning, and refining.",
    goal: "Determine how quickly your organization can respond to change",
    subAssessments: [
      {
        id: 'adaptive-capacity',
        title: 'Adaptive Capacity Assessment',
        description: 'Determine how quickly and effectively your organization can respond to change.',
        questions: [
          {
            statement: 'When a significant change is announced, do teams typically adjust their workflows within one week?',
            clarification: 'Think of your last major organizational change. How long did it take for departments to shift operations?'
          },
          {
            statement: 'Are there clear routines in place that allow any team to stop, reprioritize, and redirect efforts within 3-5 working days?',
            clarification: 'Consider how projects are paused or accelerated when priorities shift.'
          },
          {
            statement: 'In the past quarter, has your team reallocated budgets, staff, or plans to address a new strategic need within 7 days?',
            clarification: 'Use real instances of team or resource reassignments to validate your response.'
          },
          {
            statement: 'When new information emerges, are decisions reviewed and updated within 48 hours across all affected departments?',
            clarification: 'Do you see decisions quickly reshaped after external or internal data shifts?'
          },
          {
            statement: 'When plans are uncertain, do teams move forward using assumptions or prototype decisions rather than waiting for full clarity?',
            clarification: 'Consider if partial data leads to proactive testing or frozen execution.'
          }
        ]
      },
      {
        id: 'feedback-loop',
        title: 'Feedback Loop Effectiveness Test',
        description: 'Evaluate how well feedback is collected, interpreted, and used to adapt actions.',
        questions: [
          {
            statement: 'Do staff outside of leadership have at least one formal and scheduled platform where their feedback leads to documented action or follow-up?',
            clarification: 'Think of surveys, feedback sessions, or performance meetings that drive decisions.'
          },
          {
            statement: 'Does your organization have a process for examining feedback trends that involves more than one department or unit?',
            clarification: 'Review if feedback is jointly analyzed by diverse functions.'
          },
          {
            statement: 'In the past 6 months, can you identify at least two changes made directly due to staff, partner, or client feedback?',
            clarification: 'Use examples like feature rollouts, policy revisions, or service changes.'
          },
          {
            statement: 'Have you seen junior staff or field-level voices influence a major policy or operational direction?',
            clarification: 'Trace upward influence from the ground to decision-makers.'
          },
          {
            statement: 'Are updates or decisions influenced by feedback communicated back to teams with evidence of what changed?',
            clarification: 'Look for loop closure: was feedback acknowledged, not just received?'
          }
        ]
      },
      {
        id: 'learning-cycle',
        title: 'Learning Cycle Health Diagnostic',
        description: 'Assess whether organizational learning is intentional, shared, and iterative.',
        questions: [
          {
            statement: 'Do teams document lessons learned after completing major projects or cycles?',
            clarification: 'E.g., end-of-project reviews, debrief templates, or retro logs.'
          },
          {
            statement: 'Are learnings from one department regularly shared with others through structured formats?',
            clarification: 'E.g., cross-functional lunch & learn, recorded sessions.'
          },
          {
            statement: 'Does your team revisit previous learnings or feedback before starting similar work again?',
            clarification: 'Reusing or referencing a prior lesson log.'
          },
          {
            statement: 'Have lessons learned from staff ever led to a change in strategy, policy, or training content?',
            clarification: 'Did any learning session spark structural changes?'
          },
          {
            statement: 'Do team leaders encourage post-action reviews even when outcomes are positive?',
            clarification: 'Learning isn\'t only from mistakes.'
          }
        ]
      },
      {
        id: 'process-evolution',
        title: 'Process Evolution Maturity Test',
        description: 'Check how often and how well key processes are improved.',
        questions: [
          {
            statement: 'Is there a defined owner for reviewing and improving every core operational process?',
            clarification: 'Not just doing the task—responsible for improving it.'
          },
          {
            statement: 'In the past 6 months, have you retired or replaced any existing process or template?',
            clarification: 'Can be from finance, HR, compliance, etc.'
          },
          {
            statement: 'Are staff encouraged to recommend process changes without requiring leadership approval first?',
            clarification: 'Can a frontline employee initiate improvement?'
          },
          {
            statement: 'Does your team hold regular sessions to examine workflows for possible friction or inefficiencies?',
            clarification: 'Weekly/Monthly retros, check-ins, or process huddles.'
          },
          {
            statement: 'Do your process changes usually result in measurable improvements?',
            clarification: 'Do you track and compare before and after states?'
          }
        ]
      },
      {
        id: 'experimental-culture',
        title: 'Experimental Culture Index',
        description: 'Gauge the degree to which experimentation is encouraged, safe, and rewarded.',
        questions: [
          {
            statement: 'Can staff propose experiments or pilot ideas with minimal red tape or formal approvals?',
            clarification: 'Innovation doesn\'t require long proposal cycles.'
          },
          {
            statement: 'Are failures from well-designed experiments treated as learning opportunities, not performance failures?',
            clarification: 'Post-mortems focus on learning, not blame.'
          },
          {
            statement: 'Have you seen multiple teams run pilots, A/B tests, or prototyping in the last 12 months?',
            clarification: 'E.g., new process testing or UI experiments.'
          },
          {
            statement: 'Are there budget lines or time allocations specifically set aside for experimentation?',
            clarification: 'Innovation budget, sandbox time, pilot sprints.'
          },
          {
            statement: 'Is experimentation used beyond product or tech teams—e.g., in HR, finance, or service units?',
            clarification: 'Testing recruitment processes or policy tweaks.'
          }
        ]
      }
    ]
  },
  
  // System of Illustration
  {
    id: 'illustration',
    title: "The System of Illustration",
    icon: "📊",
    description: "The way ideas, strategies, and visions are communicated, emphasizing visualization of how components interact.",
    goal: "Assess how well strategy is communicated visually and narratively",
    subAssessments: [
      {
        id: 'strategic-clarity',
        title: 'Strategic Illustration Clarity Audit',
        description: 'Evaluate how well strategy is communicated visually and narratively to drive alignment and understanding.',
        questions: [
          {
            statement: 'Is there a single visual or set of diagrams that clearly represent your organizational strategy or vision?',
            clarification: 'e.g., Strategy Map, Vision Framework slide shown in onboarding.'
          },
          {
            statement: 'Can you show 3 staff members and ask them to explain what the strategy means based on these visuals—and they succeed?',
            clarification: 'Try a sample from HR, Operations, and Finance.'
          },
          {
            statement: 'Do different leaders use the same visuals when talking about goals, performance, or direction?',
            clarification: 'Check for consistency in town halls, planning decks.'
          },
          {
            statement: 'Have strategic visuals been updated or improved in the last 12 months based on feedback or confusion?',
            clarification: 'Any visual refinement from feedback, surveys, or learning loops.'
          },
          {
            statement: 'Are visuals integrated into your onboarding, learning programs, or town hall decks—rather than just attached separately?',
            clarification: 'Used as part of delivery, not as a one-off file.'
          }
        ]
      },
      {
        id: 'model-fluency',
        title: 'Internal Model Fluency & Utility Diagnostic',
        description: 'Assess whether internal models and frameworks are understood, used, and contextually adapted by teams across the organization.',
        questions: [
          {
            statement: 'Are internal models or frameworks used to guide decisions rather than just as training artifacts?',
            clarification: 'E.g., Customer Journey Map, Risk Matrix in meetings.'
          },
          {
            statement: 'Would someone from sales understand and apply a model created by operations?',
            clarification: 'Cross-departmental utility of models.'
          },
          {
            statement: 'Has your team ever modified or improved a model to make it more relevant?',
            clarification: 'Adaptation of framework for relevance.'
          },
          {
            statement: 'Can non-leaders explain how any model works and what each part represents?',
            clarification: 'Assess conceptual clarity among staff.'
          },
          {
            statement: 'Is there a method for teams to request help or clarification when models are unclear?',
            clarification: 'Help channels: facilitators, model guides, explainer decks.'
          }
        ]
      },
      {
        id: 'message-resonance',
        title: 'Message Resonance & Storytelling Culture Check',
        description: 'Assess how well internal stories, metaphors, and campaigns inspire behavior and decision-making.',
        questions: [
          {
            statement: 'Can most staff recall at least one internal story, metaphor, or campaign used in the last 18 months that influenced behavior or thinking?',
            clarification: 'Think of phrases or taglines staff reference or joke about.'
          },
          {
            statement: 'Have these messages been referenced by teams when making decisions or giving feedback?',
            clarification: 'Messages used to validate decisions.'
          },
          {
            statement: 'Are there places in your culture where stories, symbols, or phrases are embedded in team rituals, conversations, or recognition?',
            clarification: 'Use of metaphors in awards, wall art, or emails.'
          },
          {
            statement: 'Have you ever retired a campaign or story because it stopped resonating or lost meaning over time?',
            clarification: 'Message lifecycle awareness.'
          },
          {
            statement: 'Can anyone explain what internal campaigns were intended to change, and whether that change actually occurred?',
            clarification: 'Clear link between campaign and behavior change.'
          }
        ]
      },
      {
        id: 'visual-communication',
        title: 'Visual Communication Integration Assessment',
        description: 'Check whether visual communication outperforms text-based formats in comprehension and decision-making.',
        questions: [
          {
            statement: 'Are dashboards, reports, or strategy reviews primarily visual rather than text-heavy?',
            clarification: 'Look for pie charts, flow diagrams, icon-based indicators.'
          },
          {
            statement: 'Do leaders default to sketching, whiteboarding, or diagramming when explaining ideas or solving problems?',
            clarification: 'Boardroom or virtual whiteboarding habits.'
          },
          {
            statement: 'Are visuals such as charts, swimlanes, or process diagrams used in team meetings, not just executive briefings?',
            clarification: 'Visuals embedded in regular meeting culture.'
          },
          {
            statement: 'In internal training or manuals, are images/diagrams prioritized over bullet points and definitions?',
            clarification: 'Infographic-style learning vs. paragraph explanations.'
          },
          {
            statement: 'Can visuals be interpreted quickly and clearly by someone unfamiliar with the context?',
            clarification: 'No decoding needed, even for newcomers.'
          }
        ]
      },
      {
        id: 'visual-literacy',
        title: 'Visual Literacy in Leadership Evaluation',
        description: 'Determine how well leaders use visuals and illustrations to engage teams and explain strategic thinking.',
        questions: [
          {
            statement: 'Do leaders frequently use diagrams, hand-drawn visuals, or models to communicate strategic direction?',
            clarification: 'E.g., journey maps, quadrant grids in exec updates.'
          },
          {
            statement: 'When discussing problems, do leaders draw or visualize the issue, rather than only describing it verbally?',
            clarification: 'Sketching during meetings or brainstorming.'
          },
          {
            statement: 'Are frameworks used in coaching or mentoring conversations?',
            clarification: 'Use of pyramids, loops, or ladders in guidance sessions.'
          },
          {
            statement: 'Do leaders use metaphors or symbolic visuals when articulating strategic shifts or trade-offs?',
            clarification: 'E.g., flying wheel, iceberg, bridge.'
          },
          {
            statement: 'Do visuals used by different leaders convey a consistent message, or do they diverge widely by personality?',
            clarification: 'Common visual language across leadership.'
          }
        ]
      }
    ]
  },
  
  // System of Interpretation
  {
    id: 'interpretation',
    title: "The System of Interpretation",
    icon: "🧠",
    description: "Uncovering deeper meaning behind behaviors, incidents, and patterns within an organization.",
    goal: "Check if different teams interpret data/events consistently or cause misalignment",
    subAssessments: [
      {
        id: 'insight-framing',
        title: 'Insight Framing Consistency Assessment',
        description: 'Check whether data and events are framed similarly across departments or leadership levels.',
        questions: [
          {
            statement: 'Do multiple departments define key metrics or issues in the same way?',
            clarification: 'E.g., retention or efficiency are understood the same in HR, Ops, and Finance.'
          },
          {
            statement: 'Has leadership articulated framing principles or standard definitions?',
            clarification: 'Think of a shared glossary or terms-in-use.'
          },
          {
            statement: 'Are different levels of the organization referring to the same problem in the same way?',
            clarification: 'Check if project charters, slides, or emails are aligned.'
          },
          {
            statement: 'Do senior leaders challenge inconsistent framing during meetings or reviews?',
            clarification: 'E.g., ask "What do you mean by that metric?"'
          },
          {
            statement: 'Have past framing errors led to visible delays, rework, or missed targets?',
            clarification: 'E.g., conflicting definitions or goals.'
          }
        ]
      },
      {
        id: 'sensemaking',
        title: 'Sensemaking and Meaning Alignment Test',
        description: 'Assess whether teams interpret ambiguous situations in a shared, productive way.',
        questions: [
          {
            statement: 'Do teams converge on the same conclusions when interpreting the same data or event?',
            clarification: 'Do dashboards spark similar interpretations across units?'
          },
          {
            statement: 'Is ambiguity openly discussed during planning or decision-making?',
            clarification: 'Look for phrases like "What do we think this means?"'
          },
          {
            statement: 'Are reflection or postmortem sessions held after key outcomes?',
            clarification: 'Formal debriefs to analyze decisions or signals.'
          },
          {
            statement: 'Have meaning-misalignment issues led to project breakdowns?',
            clarification: 'Past confusion over why we\'re doing this.'
          },
          {
            statement: 'Are symbolic events or changes interpreted consistently?',
            clarification: 'Watch for diverging narratives after such events.'
          }
        ]
      },
      {
        id: 'narrative',
        title: 'Narrative Integrity Review',
        description: 'Check whether leaders and teams tell a coherent, aligned story about where the organization is and where it\'s going.',
        questions: [
          {
            statement: 'Are strategic messages repeated consistently by leaders across the organization?',
            clarification: 'Language patterns across levels.'
          },
          {
            statement: 'Do employees cite similar reasons for why current priorities matter?',
            clarification: 'Story consistency among middle managers.'
          },
          {
            statement: 'Do internal documents and comms reflect a clear, reinforcing narrative?',
            clarification: 'Strategy decks, emails, and internal campaigns.'
          },
          {
            statement: 'Are success and failure stories shared consistently to reinforce culture?',
            clarification: 'E.g., learning stories, cautionary tales.'
          },
          {
            statement: 'Have you seen conflicting or contradictory narratives cause confusion?',
            clarification: 'E.g., different messages from different VPs.'
          }
        ]
      },
      {
        id: 'signal-noise',
        title: 'Signal-to-Noise Ratio Audit',
        description: 'Evaluate whether organizational attention is focused on meaningful signals versus distractions.',
        questions: [
          {
            statement: 'Do leadership and teams regularly review only a few high-signal metrics?',
            clarification: 'Dashboards with fewer than 10 key indicators.'
          },
          {
            statement: 'Are distracting or redundant reports being discontinued?',
            clarification: 'E.g., merged KPIs, legacy metrics dropped.'
          },
          {
            statement: 'Can people articulate what qualifies as a signal vs. a distraction?',
            clarification: 'Defined sense of what\'s important.'
          },
          {
            statement: 'Has a poor signal-to-noise ratio contributed to poor decisions?',
            clarification: 'Lost time due to data overload or distraction.'
          },
          {
            statement: 'Are people trained or guided on how to interpret signals?',
            clarification: 'Orientation or leadership coaching?'
          }
        ]
      },
      {
        id: 'cross-level',
        title: 'Cross-Level Insight Transfer Scorecard',
        description: 'Ensure that insights and interpretations move both up and down the hierarchy effectively.',
        questions: [
          {
            statement: 'Are insights from the frontline regularly elevated to senior leadership?',
            clarification: 'E.g., customer feedback, on-the-ground blockers.'
          },
          {
            statement: 'Are strategic insights from leadership shared in ways the frontline understands?',
            clarification: 'Decoded vision into actionable meaning.'
          },
          {
            statement: 'Are there recurring meetings or rituals to share insights across levels?',
            clarification: 'All-hands, syncs, team briefs.'
          },
          {
            statement: 'Do mid-level managers play an active role in translating insights both upward and downward?',
            clarification: 'Bridge behaviors.'
          },
          {
            statement: 'Have breakdowns in insight transfer led to preventable errors?',
            clarification: 'Missed learnings, wrong actions.'
          }
        ]
      }
    ]
  },
  
 
];