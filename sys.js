export const systems = [
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

  
  {
    id: 'inlignment',
    title: "The System of Inlignment",
    icon: "🎯",
    description: "A fusion of 'alignment' and 'inline'—ensuring all components work seamlessly toward the same objectives.",
    goal: "Ensure daily decisions reflect the organization's stated vision and mission",
    questions: [
      {
        id: 1,
        question: "How well do staff understand the organization's vision?",
        options: [
          "No connection to behavior",
          "Understood but not practiced",
          "Inconsistent application",
          "Evident in most behaviors",
          "Embedded in all actions"
        ]
      },
      {
        id: 2,
        question: "How consistently do leaders model the vision through their actions?",
        options: [
          "Leaders contradict vision",
          "Occasional alignment",
          "Inconsistent modeling",
          "Most leaders model vision",
          "All leaders exemplify vision"
        ]
      }
    ]
  },
  {
    id: 'investigation',
    title: "The System of Investigation",
    icon: "🔎",
    description: "How an organization digs for answers and keeps looking for the 'whys' of incidents to understand root causes.",
    goal: "Check if different teams interpret data/events consistently or cause misalignment",
    questions: [
      {
        id: 1,
        question: "How consistently do teams interpret key metrics?",
        options: [
          "Highly fragmented",
          "Some alignment, frequent contradictions",
          "Reasonable coherence with blind spots",
          "Mostly aligned with exceptions",
          "Strong, consistent across all levels"
        ]
      },
      {
        id: 2,
        question: "How consistently do teams respond to similar events?",
        options: [
          "Wildly different responses",
          "Frequent contradictions",
          "Moderate consistency",
          "Mostly consistent",
          "Always aligned responses"
        ]
      }
    ]
  },
  {
    id: 'orchestration',
    title: "The System of Orchestration",
    icon: "🔄",
    description: "A continuous improvement process driven by repeated cycles of testing, learning, and refining.",
    goal: "Determine how quickly your organization can respond to change",
    questions: [
      {
        id: 1,
        question: "How prepared is your organization for change?",
        options: [
          "Not prepared at all",
          "Limited preparedness",
          "Functional but needs improvement",
          "Well-developed readiness",
          "Fully embedded readiness"
        ]
      },
      {
        id: 2,
        question: "How comfortable is your organization acting with incomplete information?",
        options: [
          "Extremely uncomfortable",
          "Somewhat uncomfortable",
          "Moderately comfortable",
          "Comfortable with uncertainty",
          "Thrives with uncertainty"
        ]
      }
    ]
  },
  {
    id: 'illustration',
    title: "The System of Illustration",
    icon: "📊",
    description: "The way ideas, strategies, and visions are communicated, emphasizing visualization of how components interact.",
    goal: "Assess how well strategy is communicated visually and narratively",
    questions: [
      {
        id: 1,
        question: "How available are strategic visuals in your organization?",
        options: [
          "Absent or fragmented",
          "Present but inconsistent/unclear",
          "Useful in some areas",
          "Clear and regularly used",
          "Integral and consistent across levels"
        ]
      },
      {
        id: 2,
        question: "How well can staff recall strategic messages using visuals?",
        options: [
          "Cannot recall any visuals",
          "Recall vague concepts",
          "Recall some elements",
          "Recall most key parts",
          "Explain strategy using visuals"
        ]
      }
    ]
  },
  {
    id: 'interpretation',
    title: "The System of Interpretation",
    icon: "🧠",
    description: "Uncovering deeper meaning behind behaviors, incidents, and patterns within an organization.",
    goal: "Identify if your organization scapegoats individuals or diagnoses systems",
    questions: [
      {
        id: 1,
        question: "What is the first reaction when problems occur?",
        options: [
          "Always 'Who did this?'",
          "Mostly 'Who did this?'",
          "Mixed between who and what",
          "Mostly 'What caused this?'",
          "Always 'What caused this?'"
        ]
      },
      {
        id: 2,
        question: "How are errors framed by leadership?",
        options: [
          "Always personal failure",
          "Mostly personal terms",
          "Mixed personal/systemic",
          "Mostly systemic terms",
          "Always systemic terms"
        ]
      }
    ]
  }

  

];