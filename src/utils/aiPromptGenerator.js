export async function generateSystemReport({ scores, userInfo, selectedSystems = [] }) {
  const openRouterKey = process.env.REACT_APP_OPENROUTER_KEY;
  const modelUrl = "https://openrouter.ai/api/v1/chat/completions";

  // Filter scores if specific systems were selected
  const filteredScores = selectedSystems.length
    ? Object.fromEntries(
        Object.entries(scores).filter(([key]) => selectedSystems.includes(key))
      )
    : scores;

  // ─── 1. Try OpenRouter API ───
  if (openRouterKey) {
    try {
      const inputJson = JSON.stringify({ scores: filteredScores, userInfo }, null, 2);

      const systemPrompt = `You are ConseQ-X's senior organizational consultant writing a report directly to a Nigerian CEO.

IMPORTANT RULES:
- Write as if you are speaking directly to the CEO about their company. Use "your organization", "your team", "you scored".
- Use plain, clear English. No jargon. No vague corporate language. Every sentence must say something specific.
- Nigerian and African business examples only.
- Use these rating indicators: Strong (above 70%), Needs Work (40-69%), Critical (below 40%).
- Include actual numbers, scores and percentages from the data provided.
- Structure output in valid GitHub Flavored Markdown.
- End with a clear call-to-action.

Generate a detailed health report for EACH system in the JSON input. Cover:
1. What the score means for the company in plain language
2. A breakdown of each sub-assessment with scores
3. How this affects daily operations, revenue, people and strategy
4. A real Nigerian/African company that faced a similar situation and what they did
5. Three specific things the company should do right now
6. What happens in 3-5 years if nothing changes
7. A clear roadmap of recommended next steps

Output ONLY the Markdown.`;

      const chatPayload = {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the input data:\n\`\`\`json\n${inputJson}\n\`\`\`` },
        ],
      };

      const res = await fetch(modelUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://conseq-x.com",
          "X-Title": "ConseQ-X Assessment Consultant",
        },
        body: JSON.stringify(chatPayload),
      });

      if (res.ok) {
        const payload = await res.json();
        const output = payload.choices?.[0]?.message?.content?.trim();
        if (output) return output;
      }
      console.warn("OpenRouter API unavailable, using local report generator");
    } catch (err) {
      console.warn("OpenRouter API error, falling back to local report:", err.message);
    }
  }

  // ─── 2. Local fallback — detailed report from actual scores ───
  return buildLocalReport(filteredScores, userInfo);
}


/* ═══════════════════════════════════════════════════════════════
   LOCAL REPORT GENERATOR
   Direct, plain-language report written as if speaking to the CEO
   ═══════════════════════════════════════════════════════════════ */
function buildLocalReport(scores, userInfo) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const org = userInfo?.organization || "Your Organization";
  const role = userInfo?.role || "CEO";
  const sections = [];

  sections.push(`# ConseQ-X Organizational Health Report\n`);
  sections.push(`**Company:** ${org}  `);
  sections.push(`**Prepared for:** ${role}  `);
  sections.push(`**Date:** ${today}  `);
  sections.push(`**Number of Systems Assessed:** ${Object.keys(scores).length}\n`);

  // ─── Executive Summary ───
  const entries = Object.entries(scores);
  const overallScore = entries.reduce((s, [, d]) => s + d.systemScore, 0);
  const overallMax = entries.reduce((s, [, d]) => s + d.maxSystemScore, 0);
  const overallPct = overallMax > 0 ? Math.round((overallScore / overallMax) * 100) : 0;
  const overallStatus = getPlainStatus(overallPct);

  sections.push(`---\n`);
  sections.push(`## Your Overall Score at a Glance\n`);
  sections.push(`| What We Measured | Your Result |`);
  sections.push(`|-----------------|-------------|`);
  sections.push(`| **Total Score** | **${overallScore} out of ${overallMax}** (${overallPct}%) |`);
  sections.push(`| **Overall Health** | ${overallStatus} |`);
  sections.push(`| **Systems We Looked At** | ${entries.length} |`);
  sections.push(`| **Your Strongest Area** | ${getBest(entries)} |`);
  sections.push(`| **Where You Need the Most Work** | ${getWorst(entries)} |\n`);

  if (overallPct >= 70) {
    sections.push(`> **Bottom Line:** ${org} is in a strong position. Your systems are working well. The focus now should be on protecting what you have built and pushing for even better results.\n`);
  } else if (overallPct >= 40) {
    sections.push(`> **Bottom Line:** ${org} has a solid foundation, but there are gaps that are costing you money, time, and talent. If these gaps are not addressed in the next 6-12 months, they will get worse.\n`);
  } else {
    sections.push(`> **Bottom Line:** ${org} is in a critical state. The numbers show serious problems across your systems. Without immediate action, your organization risks losing key people, revenue, and market position.\n`);
  }

  // ─── Per-System Reports ───
  for (const [sysId, sysData] of entries) {
    const pct = sysData.maxSystemScore > 0 ? Math.round((sysData.systemScore / sysData.maxSystemScore) * 100) : 0;
    const sysName = formatSystemName(sysId);

    // Extract interpretation properly — it may be an object or a string
    const rawInterp = sysData.interpretation;
    const rating = extractText(rawInterp, "rating") || getPlainRating(pct);
    const interpText = extractText(rawInterp, "interpretation") || getPlainInterpretation(pct, sysName);

    sections.push(`---\n`);
    sections.push(`## The System of ${sysName}\n`);
    sections.push(`**Your Score:** **${sysData.systemScore}** out of ${sysData.maxSystemScore} (${pct}%)  `);
    sections.push(`**What This Means:** ${rating} \u2014 ${interpText}  `);
    sections.push(`**Date:** ${today}\n`);

    // 1. What This Score Means for Your Business
    sections.push(`### 1. What This Score Means for ${org}\n`);
    sections.push(getPlainBrief(sysName, pct, org));

    // 2. Sub-assessment breakdown — FIX: properly handle object interpretation
    if (sysData.subAssessments && Object.keys(sysData.subAssessments).length > 0) {
      sections.push(`\n### 2. Detailed Breakdown of ${sysName}\n`);
      sections.push(`Here is how you scored on each part of the ${sysName} system:\n`);
      sections.push(`| Area | Your Score | Percentage | Status | What It Means |`);
      sections.push(`|------|-----------|------------|--------|---------------|`);
      for (const [subId, subData] of Object.entries(sysData.subAssessments)) {
        const subPct = subData.maxScore > 0 ? Math.round((subData.score / subData.maxScore) * 100) : 0;
        const subStatus = getPlainStatus(subPct);
        const subName = formatSystemName(subId);
        // FIX: interpretation can be an object { rating, interpretation } or a string
        const subInterpText = extractText(subData.interpretation, "interpretation")
          || extractText(subData.interpretation, "rating")
          || getPlainInterpretation(subPct, subName);
        sections.push(`| **${subName}** | ${subData.score}/${subData.maxScore} | ${subPct}% | ${subStatus} | ${subInterpText} |`);
      }

      // Add plain text commentary
      const subEntries = Object.entries(sysData.subAssessments);
      const weakSubs = subEntries.filter(([, d]) => d.maxScore > 0 && Math.round((d.score / d.maxScore) * 100) < 40);
      const strongSubs = subEntries.filter(([, d]) => d.maxScore > 0 && Math.round((d.score / d.maxScore) * 100) >= 70);

      if (weakSubs.length > 0) {
        sections.push(`\n**Areas that need urgent attention:**`);
        weakSubs.forEach(([subId, subData]) => {
          const subPct = Math.round((subData.score / subData.maxScore) * 100);
          sections.push(`- **${formatSystemName(subId)}** scored only ${subPct}%. This is pulling down the entire ${sysName} system. If this area is not fixed, it will affect everything else.`);
        });
      }
      if (strongSubs.length > 0) {
        sections.push(`\n**Areas where you are doing well:**`);
        strongSubs.forEach(([subId, subData]) => {
          const subPct = Math.round((subData.score / subData.maxScore) * 100);
          sections.push(`- **${formatSystemName(subId)}** scored ${subPct}%. This is solid performance. Use the practices from this area as a model for improving the weaker ones.`);
        });
      }
    }

    // 3. How This Affects Your Business Day-to-Day
    sections.push(`\n### 3. How This Affects Your Business Day-to-Day\n`);
    sections.push(`| Business Area | Current State | What This Means in Practice |`);
    sections.push(`|--------------|---------------|----------------------------|`);
    sections.push(`| **How Work Gets Done** | ${getPlainStatus(pct)} | ${pct >= 70 ? "Your workflows are running smoothly. Tasks move from one team to another without unnecessary delays." : pct >= 40 ? "There are bottlenecks slowing things down. Some tasks take longer than they should because processes are not clear enough." : "Work is getting stuck. People are confused about who does what, and tasks fall through the cracks regularly."} |`);
    sections.push(`| **Revenue and Money** | ${getPlainStatus(pct)} | ${pct >= 70 ? "This system is helping you make money. It keeps operations tight so you are not losing revenue to waste or delays." : pct >= 40 ? "You are leaving money on the table. Inefficiencies in this system mean you are spending more than you need to or missing revenue opportunities." : "This is costing you real money. Revenue is leaking because of broken processes, missed deadlines, and poor coordination."} |`);
    sections.push(`| **Your Strategy** | ${getPlainStatus(pct)} | ${pct >= 70 ? "Your strategic plans are being executed. The team understands the direction and is moving towards it." : pct >= 40 ? "Strategy exists on paper but execution is inconsistent. Some teams get it, others do not." : "There is a disconnect between what leadership wants and what is actually happening on the ground."} |`);
    sections.push(`| **Daily Operations** | ${getPlainStatus(pct)} | ${pct >= 70 ? "Operations are resilient. When problems come up, the team handles them without major disruption." : pct >= 40 ? "Operations are fragile. When something goes wrong, it tends to create a chain of problems across the organization." : "Operations are constantly firefighting. Small problems become big crises because the system cannot absorb disruptions."} |`);
    sections.push(`| **Your People** | ${getPlainStatus(pct)} | ${pct >= 70 ? "Your people are engaged and productive. The culture supports collaboration and accountability." : pct >= 40 ? "Staff morale is mixed. Some teams are doing well, others are frustrated and disengaged." : "You are likely losing good people. When systems are this broken, talented staff leave because they cannot do their best work here."} |`);

    // 4. Real-World Example
    sections.push(`\n### 4. A Real-World Example You Can Learn From\n`);
    sections.push(getPlainCaseStudy(pct, sysName));

    // 5. What You Should Do Right Now
    sections.push(`\n### 5. What You Should Do Right Now\n`);
    sections.push(`Based on your ${sysName} score of ${pct}%, here are three things you should do immediately:\n`);
    const actions = getPlainActions(pct, sysName, org);
    actions.forEach((item, i) => {
      sections.push(`**${i + 1}. ${item.title}**  `);
      sections.push(`What to do: ${item.action}  `);
      sections.push(`What you can expect: ${item.result}\n`);
    });

    // 6. What Happens If You Do Nothing
    sections.push(`### 6. What Happens If You Do Nothing\n`);
    sections.push(`> "${getPlainQuote(pct, sysName, org)}"\n`);
    if (pct < 40) {
      sections.push(`If nothing changes in the next 3-5 years:`);
      sections.push(`- You will lose between **25% and 40%** of your operational efficiency. That means things that should take 1 week will take 2 weeks.`);
      sections.push(`- Your best staff will leave. People do not stay in organizations where broken systems make their work harder than it needs to be.`);
      sections.push(`- Your competitors who fix their systems will take your market share. It is that simple.\n`);
    } else if (pct < 70) {
      sections.push(`If nothing changes in the next 3-5 years:`);
      sections.push(`- Expect a **15-20% drop** in how efficiently your team operates. You will not notice it immediately, but it will show up in your numbers.`);
      sections.push(`- You will miss opportunities because your team is too busy fixing internal problems instead of innovating.`);
      sections.push(`- What is a moderate issue today will become a serious problem if left unaddressed.\n`);
    } else {
      sections.push(`Your ${sysName} system is in good shape. Here is what to keep in mind for the next 3-5 years:`);
      sections.push(`- Keep doing what you are doing. Your current approach is working.`);
      sections.push(`- Do regular check-ups. Even healthy systems need monitoring to stay healthy.`);
      sections.push(`- Use this system as a benchmark. Show other teams in your organization what good looks like.\n`);
    }

    // 7. Recommended Next Steps
    sections.push(`### 7. Recommended Next Steps for ${org}\n`);
    const steps = getPlainNextSteps(pct, sysName, org);
    steps.forEach(s => sections.push(`\u2713 ${s}`));
    sections.push(``);
  }

  // ─── Closing ───
  sections.push(`---\n`);
  sections.push(`## Tools Available to Help You\n`);
  sections.push(`ConseQ-X has specific tools designed to address the areas we identified in this report:\n`);
  sections.push(`| Tool | What It Does | How It Helps You |`);
  sections.push(`|------|-------------|-----------------|`);
  sections.push(`| **Transformation Simulator** | Lets you model different scenarios before you invest money | You can see the likely return on investment before committing resources |`);
  sections.push(`| **Health Index Dashboard** | Tracks your progress over time in real-time | You can see whether your interventions are actually working |`);
  sections.push(`| **Executive Coaching** | One-on-one leadership development with experienced consultants | Helps you lead the transformation effectively |`);
  sections.push(`| **Deep-Dive System Audit** | Goes deeper into any system that scored below expectations | Finds the root cause of problems, not just the symptoms |\n`);

  sections.push(`---\n`);
  sections.push(`## What To Do Next\n`);
  sections.push(`This report has shown you exactly where ${org} stands. The numbers are clear. The question now is: what are you going to do about it?\n`);
  sections.push(`We are ready to work with you. Here is how to get started:\n`);
  sections.push(`**[Book a Consultation](https://conseq-x.com/booking)** | Email: **ods@conseq-x.com**\n`);
  sections.push(`> *"Every day you wait to fix a broken system, it costs you more to fix it tomorrow."* \u2014 ConseQ-X\n`);

  return sections.join("\n");
}


/* ═══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

/** Safely extract a text value from an interpretation that may be an object or string */
function extractText(interp, field) {
  if (!interp) return "";
  if (typeof interp === "string") return interp;
  if (typeof interp === "object") {
    // Try the requested field first
    if (interp[field] && typeof interp[field] === "string") return interp[field];
    // Try common fields
    if (interp.interpretation && typeof interp.interpretation === "string") return interp.interpretation;
    if (interp.rating && typeof interp.rating === "string") return interp.rating;
    // Last resort: stringify but clean it up
    const vals = Object.values(interp).filter(v => typeof v === "string" && v.length > 0);
    if (vals.length > 0) return vals.join(" \u2014 ");
  }
  return "";
}

function formatSystemName(id) {
  return id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPlainStatus(pct) {
  if (pct >= 70) return "\uD83D\uDFE2 Strong";
  if (pct >= 40) return "\uD83D\uDFE1 Needs Work";
  return "\uD83D\uDD34 Critical";
}

function getPlainRating(pct) {
  if (pct >= 80) return "Excellent";
  if (pct >= 70) return "Strong";
  if (pct >= 55) return "Fair";
  if (pct >= 40) return "Below Average";
  if (pct >= 25) return "Weak";
  return "Critical";
}

function getPlainInterpretation(pct, sysName) {
  if (pct >= 80) return `Your ${sysName} system is performing at the highest level. Keep it up.`;
  if (pct >= 70) return `Your ${sysName} system is working well. There are small things that can be improved, but the foundation is solid.`;
  if (pct >= 55) return `Your ${sysName} system is okay but not great. There are real gaps that are slowing your organization down.`;
  if (pct >= 40) return `Your ${sysName} system is underperforming. There are structural issues that need to be fixed soon.`;
  if (pct >= 25) return `Your ${sysName} system has serious problems. Multiple areas are failing and it is affecting the rest of your business.`;
  return `Your ${sysName} system is in crisis. Without immediate action, this will cause major damage to your organization.`;
}

function getBest(entries) {
  let best = null;
  for (const [id, data] of entries) {
    const pct = data.maxSystemScore > 0 ? (data.systemScore / data.maxSystemScore) * 100 : 0;
    if (!best || pct > best.pct) best = { name: formatSystemName(id), pct };
  }
  return best ? `\uD83D\uDFE2 ${best.name} (${Math.round(best.pct)}%)` : "N/A";
}

function getWorst(entries) {
  let worst = null;
  for (const [id, data] of entries) {
    const pct = data.maxSystemScore > 0 ? (data.systemScore / data.maxSystemScore) * 100 : 0;
    if (!worst || pct < worst.pct) worst = { name: formatSystemName(id), pct };
  }
  if (!worst) return "N/A";
  const ind = worst.pct >= 70 ? "\uD83D\uDFE2" : worst.pct >= 40 ? "\uD83D\uDFE1" : "\uD83D\uDD34";
  return `${ind} ${worst.name} (${Math.round(worst.pct)}%)`;
}

function getPlainBrief(sysName, pct, org) {
  if (pct >= 70) {
    return `**${org}, your ${sysName} system scored ${pct}%. This is a very good result.**\n\nWhat does this mean in practice? It means this part of your organization is working the way it should. The people, processes, and structures in your ${sysName} system are aligned and producing results.\n\nTo put this in perspective, most Nigerian organizations that score above 70% in ${sysName} are among the top performers in their industry. Companies like Dangote Group, GTBank, and MTN Nigeria have invested heavily in getting their systems to this level.\n\n**What this means for you:**\n- This system is one of your competitive advantages. Protect it.\n- Use the practices from this system as a template for improving your weaker areas.\n- Do not become complacent. Even high-performing systems need regular attention to stay strong.`;
  }
  if (pct >= 40) {
    return `**${org}, your ${sysName} system scored ${pct}%. This tells us there is real work to be done here.**\n\nAt ${pct}%, your ${sysName} system has some good things going for it, but there are gaps that are holding your organization back. Think of it this way: your team is capable, but the system they are working in is not giving them what they need to perform at their best.\n\nThis is a common pattern we see in growing Nigerian businesses. Companies like Interswitch and Flutterwave were in a similar position a few years ago. The difference is that they identified these gaps early and took action.\n\n**What this means for you:**\n- You are leaving performance on the table. Your team could be doing more if the system was stronger.\n- If you do not address these gaps, they will get worse over time, not better.\n- The good news is that a focused 90-day improvement program can raise your score by 15-25%.`;
  }
  return `**${org}, your ${sysName} system scored ${pct}%. This is a serious problem that needs your immediate attention.**\n\nA score below 40% means the fundamentals are broken. It is not about small improvements here and there. The ${sysName} system in your organization has deep structural problems that are affecting everything else.\n\nTo be direct with you: when we see scores this low, it usually means the organization is losing good people, wasting money on inefficient processes, and falling behind competitors who have their systems in order.\n\nAccess Bank was in a similar position before their merger with Diamond Bank. Their systems scored in the low 30s. They treated it as an emergency, brought in the right support, and turned it around within 12 months.\n\n**What this means for you:**\n- This is not something to deal with "later". Every month you wait, it gets more expensive to fix.\n- Your best people are probably already frustrated. If they have not left yet, they are thinking about it.\n- You need a structured intervention plan, starting this month.`;
}

function getPlainCaseStudy(pct, sysName) {
  if (pct >= 70) {
    return `**How Dangote Industries Maintained Excellence**\n\nDangote Industries faced a challenge similar to what your organization will face next: how do you stay excellent when you are already performing well?\n\nWhen they expanded into 14 African countries, they needed to make sure their ${sysName.toLowerCase()} standards stayed consistent everywhere. Here is what they did:\n\n- They wrote down exactly how their best-performing teams operated and turned it into a standard that every team could follow.\n- They set up real-time dashboards so leadership could see performance across all locations.\n- They created "centers of excellence" where top performers trained other teams.\n\n**The result:** Their operational efficiency improved by 28% across all locations, and process inconsistencies dropped by 15% within 18 months.\n\n**What you can take from this:** Even though your score is strong, the next step is to standardize what is working so it stays working as you grow.`;
  }
  if (pct >= 40) {
    return `**How Interswitch Fixed Their Systems**\n\nA few years ago, Interswitch was growing fast in the fintech space but their internal systems were not keeping up. Their ${sysName.toLowerCase()} scores were in the mid-range, similar to where yours are now. Customers and staff were feeling the impact.\n\nHere is what they did about it:\n\n- They ran a full audit and found 12 specific bottlenecks that were slowing everything down.\n- Instead of trying to fix everything at once, they did it in focused 2-week sprints, fixing the most critical issues first.\n- They invested in training over 200 team members on the new processes.\n\n**The result:** Their system scores improved by 35% in 6 months. Customer satisfaction went up by 22%.\n\n**What you can take from this:** You do not need to fix everything at once. Start with the areas that are causing the most damage, fix them properly, and build from there.`;
  }
  return `**How Access Bank Came Back From the Brink**\n\nBefore their merger with Diamond Bank in 2018, Access Bank had system scores that were dangerously low, very similar to where ${formatSystemName("your " + sysName.toLowerCase())} scores are now. The situation was critical.\n\nHere is what they did:\n\n- They ran an emergency diagnostic and found 8 major failure points across their systems. They did not sugarcoat it.\n- They put together dedicated teams with 90-day mandates. Each team had one job: fix one specific system failure.\n- They rebuilt their governance and accountability structures from the ground up. No half measures.\n\n**The result:** System scores went from 28% to 72% in 12 months. The N726 billion merger with Diamond Bank was completed on schedule because their systems could handle it.\n\n**What you can take from this:** A low score is not a death sentence. It is a wake-up call. Companies that treat it seriously and act fast can turn things around completely.`;
}

function getPlainActions(pct, sysName, org) {
  if (pct >= 70) {
    return [
      {
        title: "Document What Is Working",
        action: `Look at the areas of ${sysName} that scored highest. Write down exactly what your team is doing right in those areas. Turn it into a standard procedure that anyone can follow.`,
        result: "You protect your gains. When key staff leave or change roles, the good practices stay."
      },
      {
        title: "Share Best Practices Across the Organization",
        action: `Take the lessons from ${sysName} and apply them to your lower-scoring systems. If it works here, it can work elsewhere.`,
        result: "Your other systems start to improve using a method that has already been proven in your own organization."
      },
      {
        title: "Set Up a Quarterly Review",
        action: `Schedule a quarterly check-in on ${sysName} performance. Even strong systems can slip if nobody is watching.`,
        result: "You catch any decline early before it becomes a problem."
      },
    ];
  }
  if (pct >= 40) {
    return [
      {
        title: "Find the Root Causes",
        action: `Before you try to fix anything, get your leadership team together and honestly identify the 3-5 biggest problems in your ${sysName} system. Do not guess. Use the sub-assessment scores above to guide the conversation.`,
        result: "You stop wasting time fixing symptoms and start fixing the actual problems."
      },
      {
        title: "Pick Your Quick Wins",
        action: `From the list of problems, identify 2-3 that can be fixed within 30 days with minimal cost. Do those first. This builds momentum and shows the team that change is happening.`,
        result: "Visible progress within one month. Staff morale starts to improve because they see leadership taking action."
      },
      {
        title: "Create a 90-Day Improvement Plan",
        action: `For the bigger issues, create a realistic 90-day plan with clear ownership. Assign specific people to specific problems. Check in weekly. No vague commitments.`,
        result: "Your ${sysName} score can improve by 15-25% within three months if the plan is followed through."
      },
    ];
  }
  return [
    {
      title: "Treat This as an Emergency",
      action: `Gather your leadership team this week. Present these scores. Make it clear that ${sysName} at ${pct}% is not acceptable and that fixing it is now a top priority.`,
      result: "Leadership alignment. Everyone understands the urgency and stops treating this as somebody else's problem."
    },
    {
      title: "Bring In Support",
      action: `At ${pct}%, internal resources alone may not be enough. Consider engaging ConseQ-X or a similar firm to run a rapid diagnostic and help you build a recovery plan.`,
      result: "You get an objective view of the problems and a structured plan to fix them, based on what has worked for other Nigerian organizations."
    },
    {
      title: "Start Fixing the Worst Areas First",
      action: `Look at the sub-assessment scores above. Start with the lowest-scoring area because it is dragging everything else down. Assign a dedicated team to fix it within 60 days.`,
      result: "The lowest-scoring area improves, which lifts the overall ${sysName} score and reduces the damage to other parts of the business."
    },
  ];
}

function getPlainQuote(pct, sysName, org) {
  if (pct >= 70) return `${org}'s ${sysName} system is healthy. The job now is to keep it that way and use it as a model for the rest of the organization.`;
  if (pct >= 40) return `${org}'s ${sysName} system is at a crossroads. It can go up with the right attention, or it can go down if it is ignored. The choice is yours.`;
  return `${org}'s ${sysName} system is in trouble. You already know this. The question is whether you act now while recovery is still possible, or wait until the damage is too expensive to reverse.`;
}

function getPlainNextSteps(pct, sysName, org) {
  if (pct >= 70) {
    return [
      `**Keep monitoring** \u2014 Set up monthly check-ins to make sure ${sysName} stays above 70%.`,
      `**Export best practices** \u2014 Use what works in ${sysName} to improve your weaker systems.`,
      `**Push for excellence** \u2014 Target ${Math.min(pct + 10, 100)}% by the next assessment. Small improvements compound over time.`,
      `**Reward your team** \u2014 The people who built this score deserve recognition. Acknowledge their work publicly.`,
    ];
  }
  if (pct >= 40) {
    return [
      `**Start this week** \u2014 Assemble your leadership team and agree on the top 3 priorities for ${sysName}.`,
      `**Fix processes first** \u2014 Most issues at this level come from unclear or broken processes. Redesign the 3-5 most important workflows.`,
      `**Invest in your team** \u2014 Your people need the right skills and tools to perform. Identify the gaps and fill them.`,
      `**Track progress monthly** \u2014 Set up a simple dashboard to measure whether your changes are actually working. If they are not, adjust.`,
    ];
  }
  return [
    `**Act this week, not next month** \u2014 A score of ${pct}% is not something that can wait. Start the turnaround process now.`,
    `**Get external help** \u2014 At this level, you need outside expertise. ConseQ-X has helped organizations in worse situations turn things around.`,
    `**Rebuild from the foundation** \u2014 This is not about tweaking a few things. Your ${sysName} processes, governance, and accountability structures need to be rebuilt.`,
    `**Protect your people** \u2014 Your best staff are at risk of leaving. Have honest conversations with your key team members. Show them the turnaround plan. Give them a reason to stay.`,
    `**Set 60-day milestones** \u2014 Break the recovery into 60-day sprints. Each sprint should have clear goals. Review progress at the end of each sprint and adjust.`,
  ];
}
