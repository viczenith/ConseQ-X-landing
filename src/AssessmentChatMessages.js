import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FaPaperPlane, FaPaperclip, FaPlay, FaRegCopy, FaCheck, FaRedo,
  FaFileAlt, FaTimes, FaChevronDown, FaChartLine, FaClipboardList,
  FaCalendarAlt, FaCube, FaLightbulb, FaRocket, FaStar,
  FaHandshake, FaSearchDollar
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

/* ═══════════════════════════════════════════════════════════
   OPENROUTER AI HELPER
   ═══════════════════════════════════════════════════════════ */
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

async function queryAI(userPrompt, assessmentContext) {
  const apiKey = process.env.REACT_APP_OPENROUTER_KEY;
  if (!apiKey) return null; // will fall back to local simulation

  const contextSummary = buildContextSummary(assessmentContext);

  const systemPrompt = `You are X-ULTRA, ConseQ-X's executive intelligence AI analyst. You have access to the user's organizational health assessment data.

ASSESSMENT DATA:
${contextSummary}

RULES:
1. Respond in clean, professional Markdown.
2. Use tables, bold, emoji indicators (🟢 Strong, 🟡 Moderate, 🔴 Critical) where appropriate.
3. Be specific — reference actual scores, system names, and sub-assessment results from the data above.
4. Provide actionable, practical, McKinsey-level strategic recommendations.
5. Use Nigerian/African business context where relevant.
6. Keep responses focused and structured with clear headings.
7. Always end with a brief next-step recommendation.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://conseq-x.com",
        "X-Title": "ConseQ-X Assessment Chat",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/* Build a text summary of assessment data for the AI context window */
function buildContextSummary(ctx) {
  if (!ctx) return "No assessment data available.";
  const { scores, systems, userInfo, answers } = ctx;
  const parts = [];

  if (userInfo) {
    parts.push(`**Organization:** ${userInfo.organization || "N/A"}`);
    parts.push(`**Role:** ${userInfo.role || "N/A"}`);
    parts.push(`**Email:** ${userInfo.email || "N/A"}`);
  }

  if (scores && Object.keys(scores).length > 0 && systems) {
    parts.push("\n**System Scores:**");
    for (const [sysId, sysData] of Object.entries(scores)) {
      const sys = systems.find(s => s.id === sysId);
      const name = sys?.title || sysId;
      const pct = sysData.maxSystemScore > 0
        ? Math.round((sysData.systemScore / sysData.maxSystemScore) * 100)
        : 0;
      const rating = sysData.interpretation?.rating || "N/A";
      parts.push(`- **${name}**: ${sysData.systemScore}/${sysData.maxSystemScore} (${pct}%) — ${rating}`);

      if (sysData.subAssessments) {
        for (const [subId, subData] of Object.entries(sysData.subAssessments)) {
          const sub = sys?.subAssessments?.find(s => s.id === subId);
          const subName = sub?.title || subId;
          const subPct = subData.maxScore > 0
            ? Math.round((subData.score / subData.maxScore) * 100)
            : 0;
          parts.push(`  • ${subName}: ${subData.score}/${subData.maxScore} (${subPct}%) — ${subData.interpretation || ""}`);
        }
      }
    }
  }

  const completedCount = systems?.filter(sys =>
    sys.subAssessments?.every(sub => answers?.[sub.id] && Object.keys(answers[sub.id]).length === sub.questions?.length)
  )?.length || 0;
  const totalCount = systems?.length || 0;
  parts.push(`\n**Completion:** ${completedCount}/${totalCount} systems completed`);

  return parts.join("\n");
}

/* Local fallback when no API key */
function generateLocalResponse(userPrompt, ctx) {
  const { scores, systems } = ctx || {};
  const hasScores = scores && Object.keys(scores).length > 0;

  if (!hasScores) {
    return `## We Need Your Assessment Scores First\n\nRight now, there are no assessment scores available for us to work with. Here is what to do:\n\n1. **Complete at least one system** in the assessment\n2. Click **"Run ConseQ-X Ultra Analysis"** to generate your report\n\nOnce you have done that, we can give you a detailed breakdown of how your organization is performing, where the problems are, and exactly what you should do next.`;
  }

  const prompt = userPrompt.toLowerCase();
  const systemEntries = Object.entries(scores);
  const systemNames = systemEntries.map(([id]) => systems?.find(s => s.id === id)?.title || id);

  // Build score summary — safely extract interpretation strings
  const scoreLines = systemEntries.map(([id, data]) => {
    const name = systems?.find(s => s.id === id)?.title || id;
    const pct = data.maxSystemScore > 0 ? Math.round((data.systemScore / data.maxSystemScore) * 100) : 0;
    const indicator = pct >= 70 ? "🟢" : pct >= 40 ? "🟡" : "🔴";
    // Safely extract rating from interpretation (may be object or string)
    const rawInterp = data.interpretation;
    const rating = typeof rawInterp === "object" ? (rawInterp?.rating || rawInterp?.interpretation || "—") : (rawInterp || "—");
    return { name, pct, indicator, id, data, rating };
  });

  if (prompt.includes("analyze") || prompt.includes("assessment results") || prompt.includes("key insights")) {
    const rows = scoreLines.map(s => `| ${s.indicator} **${s.name}** | ${s.data.systemScore}/${s.data.maxSystemScore} | ${s.pct}% | ${s.rating} |`).join("\n");
    const weakOnes = scoreLines.filter(s => s.pct < 50);
    const strongOnes = scoreLines.filter(s => s.pct >= 70);

    let insights = "";
    if (weakOnes.length > 0) {
      insights += weakOnes.map(s => `- 🔴 **${s.name}** scored ${s.pct}%. This is a problem area. It is dragging down your overall organizational health and needs to be addressed quickly.`).join("\n");
    } else {
      insights += "- All your systems are above the critical threshold. That is a good sign.";
    }
    if (strongOnes.length > 0) {
      insights += "\n" + strongOnes.map(s => `- 🟢 **${s.name}** scored ${s.pct}%. This is one of your strongest areas. The practices here should be used as a model for improving the weaker systems.`).join("\n");
    }

    return `## Here Is How Your Organization Scored\n\n| System | Score | Percentage | Rating |\n|--------|-------|------------|--------|\n${rows}\n\n### What the Numbers Tell Us\n\n${insights}\n\n### What You Should Do\n\nStart with your lowest-scoring systems. Those are the ones causing the most damage to your organization right now. Your high-scoring systems show you what good looks like — use them as a reference point when fixing the weaker areas.`;
  }

  if (prompt.includes("roadmap") || prompt.includes("transformation")) {
    const sorted = [...scoreLines].sort((a, b) => a.pct - b.pct);
    const phases = sorted.map((s, i) => {
      const months = 3 + i * 2;
      const target = Math.min(s.pct + 25, 100);
      let focus, actions;
      if (s.pct < 50) {
        focus = "This system is in trouble. The first step is to stop the bleeding — identify what is broken, fix the most critical issues, and rebuild the processes that are not working.";
        actions = "Run a rapid diagnostic to find the root causes. Assign dedicated staff to fix the top 3 issues. Set weekly check-ins to track progress.";
      } else if (s.pct < 70) {
        focus = "This system has a decent foundation but there are gaps holding it back. The focus should be on closing those gaps and making processes more efficient.";
        actions = "Map out the current workflows and identify where time and money are being wasted. Implement the fixes and train your team on the updated processes.";
      } else {
        focus = "This system is already performing well. The goal here is to fine-tune what you have, protect your gains, and push for even better results.";
        actions = "Document what is working so it does not get lost. Look for small improvements that can add up. Share best practices with the rest of the organization.";
      }
      return `### Phase ${i + 1}: ${s.name} (Currently at ${s.pct}%)\n- **Target:** Get to ${target}% within ${months} months\n- **What Needs to Happen:** ${focus}\n- **Specific Actions:** ${actions}`;
    });

    const totalMonths = 3 + sorted.length * 2;
    return `## Your Step-by-Step Transformation Roadmap\n\nHere is the plan for improving all ${systemNames.length} systems, starting with the ones that need the most help:\n\n${phases.join("\n\n")}\n\n---\n**Total Timeline:** About ${totalMonths} months if you follow the plan consistently\n\n**Important:** Start with Phase 1. Do not try to fix everything at once. Each phase builds on the one before it.`;
  }

  if (prompt.includes("prioritize") || prompt.includes("priority") || prompt.includes("first")) {
    const sorted = [...scoreLines].sort((a, b) => a.pct - b.pct);
    const priority = sorted.slice(0, 3);
    const items = priority.map((s, i) => {
      let urgency, explanation;
      if (s.pct < 40) {
        urgency = "🔴 URGENT — Fix this first";
        explanation = `At ${s.pct}%, this system is broken. It is causing real damage to your organization right now. Every week you wait, the problem gets worse and more expensive to fix. Put your best people on this immediately.`;
      } else if (s.pct < 60) {
        urgency = "🟡 IMPORTANT — Address within 60 days";
        explanation = `At ${s.pct}%, this system is underperforming. It is not in crisis yet, but the gaps are real and they are costing you money and efficiency. If you do not address it soon, it will slide into the critical zone.`;
      } else {
        urgency = "🟢 MONITOR — Improve when possible";
        explanation = `At ${s.pct}%, this system is in reasonable shape. It does not need emergency attention, but there are improvements that would make a noticeable difference. Schedule this for optimization after you have dealt with the more urgent items.`;
      }
      return `### ${i + 1}. ${s.name} — ${s.pct}%\n**${urgency}**\n\n${explanation}`;
    });

    return `## What You Should Fix First\n\nWe looked at all your scores and ranked them from most urgent to least urgent. Here are your top priorities:\n\n${items.join("\n\n")}\n\n---\n**The Rule:** Fix the most damaged systems first. They have the biggest impact on your overall performance. A system at 30% that you raise to 55% gives you more value than a system at 70% that you push to 85%.`;
  }

  if (prompt.includes("compare") || prompt.includes("performance") || prompt.includes("across")) {
    const sorted = [...scoreLines].sort((a, b) => b.pct - a.pct);
    const avg = Math.round(sorted.reduce((a, b) => a + b.pct, 0) / sorted.length);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const gap = best.pct - worst.pct;

    let gapAnalysis;
    if (gap > 30) {
      gapAnalysis = `⚠️ **There is a ${gap}-point gap between your best and worst systems.** This is a serious imbalance. When systems are this far apart, the weak ones drag down the strong ones. Your organization cannot perform at its best when one part is at ${best.pct}% and another is at ${worst.pct}%.`;
    } else if (gap > 15) {
      gapAnalysis = `🟡 **There is a ${gap}-point gap between your best and worst systems.** This is a moderate difference. Your systems are somewhat balanced, but the weaker ones are still holding you back. Focus on bringing the lower-scoring systems closer to your average of ${avg}%.`;
    } else {
      gapAnalysis = `✅ **Your systems are fairly balanced with only a ${gap}-point gap.** This is a good sign. Your organization is consistent across the board. The focus should be on raising the overall level rather than fixing big imbalances.`;
    }

    return `## How Your Systems Compare to Each Other\n\n| Rank | System | Score | Visual |\n|------|--------|-------|--------|\n${sorted.map((s, i) => `| ${i + 1} | ${s.indicator} ${s.name} | ${s.pct}% | ${"█".repeat(Math.round(s.pct / 5))}${"░".repeat(20 - Math.round(s.pct / 5))} |`).join("\n")}\n\n### The Big Picture\n- **Your Average Score:** ${avg}% across all systems\n- **Your Best System:** ${best.indicator} ${best.name} at ${best.pct}%\n- **Your Weakest System:** ${worst.indicator} ${worst.name} at ${worst.pct}%\n\n${gapAnalysis}`;
  }

  // ─── Financial Impact Analysis ───
  if (prompt.includes("financial") || prompt.includes("impact") || prompt.includes("cost") || prompt.includes("revenue") || prompt.includes("money")) {
    const avg = Math.round(scoreLines.reduce((a, b) => a + b.pct, 0) / scoreLines.length);
    const weakSystems = scoreLines.filter(s => s.pct < 50);
    const strongSystems = scoreLines.filter(s => s.pct >= 70);

    // Estimate financial impact based on scores
    const inefficiencyRate = Math.round(100 - avg);
    const estimatedWaste = inefficiencyRate >= 50 ? "25-40%" : inefficiencyRate >= 30 ? "15-25%" : "5-15%";

    let impactRows = scoreLines.map(s => {
      let revenueImpact, costImpact, riskLevel;
      if (s.pct < 40) {
        revenueImpact = "High revenue leakage";
        costImpact = "Significant hidden costs";
        riskLevel = "🔴 Critical";
      } else if (s.pct < 70) {
        revenueImpact = "Moderate missed opportunities";
        costImpact = "Avoidable inefficiencies";
        riskLevel = "🟡 Moderate";
      } else {
        revenueImpact = "Revenue well-protected";
        costImpact = "Costs optimized";
        riskLevel = "🟢 Low";
      }
      return `| ${s.indicator} **${s.name}** | ${s.pct}% | ${revenueImpact} | ${costImpact} | ${riskLevel} |`;
    }).join("\n");

    let urgencySection = "";
    if (weakSystems.length > 0) {
      urgencySection = `\n### Where You Are Losing Money Right Now\n\n${weakSystems.map(s => `- **${s.name}** at ${s.pct}% is costing you real money. At this performance level, you are spending more than you should on processes that do not work properly. Staff overtime, rework, missed deadlines, and customer complaints all add up. For a typical Nigerian mid-to-large organization, a system operating at ${s.pct}% can waste up to **N${Math.round((100 - s.pct) * 0.5)}M - N${Math.round((100 - s.pct) * 1.5)}M annually** in hidden costs.`).join("\n")}`;
    }

    let savingsSection = "";
    if (strongSystems.length > 0) {
      savingsSection = `\n\n### Where You Are Saving Money\n\n${strongSystems.map(s => `- **${s.name}** at ${s.pct}% is operating efficiently. This system is contributing positively to your bottom line. Protect this performance.`).join("\n")}`;
    }

    return `## 💰 Financial Impact Analysis\n\nBased on your assessment scores, here is how your organizational systems are affecting your finances:\n\n| System | Score | Revenue Impact | Cost Impact | Risk Level |\n|--------|-------|---------------|-------------|------------|\n${impactRows}\n\n### The Financial Bottom Line\n\n- **Estimated operational waste:** ${estimatedWaste} of your operating budget is being consumed by inefficiencies identified in this assessment\n- **Average system health:** ${avg}% — every percentage point below 100% represents money you are leaving on the table\n- **Systems at critical level (below 40%):** ${weakSystems.length} — these are your biggest financial drains\n- **Systems performing well (above 70%):** ${strongSystems.length} — these are protecting your revenue${urgencySection}${savingsSection}\n\n### What This Means in Naira\n\nFor a typical Nigerian organization of your size:\n- Each **critical system** (below 40%) costs approximately **N50M - N200M per year** in wasted resources, lost productivity, and missed opportunities\n- Each **underperforming system** (40-69%) costs approximately **N20M - N80M per year**\n- Fixing your lowest-scoring system alone could save **N30M - N150M in the first year**\n\n### Recommended Financial Actions\n\n1. **Conduct a detailed cost audit** on your ${weakSystems.length > 0 ? `lowest-scoring system (${weakSystems[0].name} at ${weakSystems[0].pct}%)` : "lowest-scoring systems"} to quantify exact losses\n2. **Set a 90-day ROI target** — invest in fixing the critical systems and measure the financial return\n3. **Use the ConseQ-X Transformation Simulator** to model different investment scenarios before committing resources\n\n> *"The cost of not fixing a broken system is always higher than the cost of fixing it."*`;
  }

  // ─── Schedule Consultation / Expert Help ───
  if (prompt.includes("consult") || prompt.includes("schedule") || prompt.includes("book") || prompt.includes("expert") || prompt.includes("help") || prompt.includes("advisor")) {
    const avg = Math.round(scoreLines.reduce((a, b) => a + b.pct, 0) / scoreLines.length);
    const weakSystems = scoreLines.filter(s => s.pct < 50);
    const criticalSystems = scoreLines.filter(s => s.pct < 40);

    let urgencyLevel, consultationType, timeline;
    if (criticalSystems.length >= 2) {
      urgencyLevel = "🔴 **URGENT** — Multiple systems are in critical condition";
      consultationType = "Emergency System Recovery Program";
      timeline = "We recommend scheduling within the next 7 days";
    } else if (criticalSystems.length === 1) {
      urgencyLevel = "🟡 **IMPORTANT** — One system needs immediate attention";
      consultationType = "Targeted System Intervention";
      timeline = "We recommend scheduling within the next 14 days";
    } else if (weakSystems.length > 0) {
      urgencyLevel = "🟡 **MODERATE** — Some systems are underperforming";
      consultationType = "Performance Optimization Program";
      timeline = "We recommend scheduling within the next 30 days";
    } else {
      urgencyLevel = "🟢 **PROACTIVE** — Your systems are healthy";
      consultationType = "Excellence & Growth Strategy Session";
      timeline = "Schedule at your convenience within the next quarter";
    }

    let focusAreas = scoreLines
      .filter(s => s.pct < 70)
      .sort((a, b) => a.pct - b.pct)
      .map(s => `- **${s.name}** (${s.pct}%) — ${s.pct < 40 ? "Needs emergency intervention" : "Needs focused improvement"}`)
      .join("\n");

    if (!focusAreas) {
      focusAreas = scoreLines.map(s => `- **${s.name}** (${s.pct}%) — Optimize and sustain excellence`).join("\n");
    }

    return `## 🤝 Consultation Recommendation\n\nBased on your assessment results (average score: **${avg}%** across ${scoreLines.length} systems), here is what we recommend:\n\n### Your Urgency Level\n\n${urgencyLevel}\n\n### Recommended Consultation Type\n\n**${consultationType}**\n\n${timeline}\n\n### What the Consultation Will Cover\n\nOur consultants will work with you on the following areas based on your scores:\n\n${focusAreas}\n\n### What You Will Get\n\n| Deliverable | Description |\n|------------|-------------|\n| **Diagnostic Deep-Dive** | A thorough investigation into the root causes behind your scores |\n| **Custom Action Plan** | A step-by-step plan tailored to your organization, not a generic template |\n| **Financial Impact Model** | Exact numbers showing the cost of inaction vs. the ROI of fixing each system |\n| **90-Day Sprint Framework** | A structured 90-day program with weekly milestones and accountability |\n| **Executive Coaching** | One-on-one guidance for your leadership team on driving the transformation |\n\n### Consultation Options\n\n| Package | Duration | Best For | Investment |\n|---------|----------|----------|------------|\n| **Express Review** | 2-hour session | Quick wins and immediate priorities | Contact for pricing |\n| **Full Diagnostic** | 2-day engagement | Comprehensive system audit | Contact for pricing |\n| **Transformation Program** | 90-day program | Complete organizational overhaul | Contact for pricing |\n\n### How to Book\n\n📧 **Email:** ods@conseq-x.com\n📞 **Call:** Schedule directly through the platform\n🌐 **Online:** [Book a Consultation](https://conseq-x.com/booking)\n\n> *"The organizations that win are the ones that act on what the data tells them. You have the data. Now let us help you act on it."*`;
  }

  // Generic response
  return `## Your Assessment Overview\n\nWe have looked at your scores across **${systemNames.length} systems**: ${systemNames.join(", ")}.\n\nHere is a quick summary:\n\n${scoreLines.map(s => `- ${s.indicator} **${s.name}**: ${s.pct}%`).join("\n")}\n\nWhat would you like to know more about? You can ask me to:\n- **Analyze** your results and explain what the scores mean\n- **Build a roadmap** for improving your systems step by step\n- **Tell you what to prioritize** based on where the biggest problems are\n- **Compare** how your different systems stack up against each other\n\nJust type your question or click one of the buttons below.`;
}

/* ═══════════════════════════════════════════════════════════
   TYPING DOTS
   ═══════════════════════════════════════════════════════════ */
function TypingDots({ darkMode }) {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className={`block w-2 h-2 rounded-full ${darkMode ? "bg-gray-500" : "bg-gray-400"}`}
          style={{ animation: `chatPulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COPY BUTTON — clipboard with visual feedback
   ═══════════════════════════════════════════════════════════ */
function CopyButton({ text, darkMode }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };
  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-md transition-colors ${
        darkMode
          ? "hover:bg-gray-700 text-gray-500 hover:text-gray-300"
          : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
      }`}
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? <FaCheck size={13} /> : <FaRegCopy size={13} />}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   MESSAGE BUBBLE 
   ═══════════════════════════════════════════════════════════ */
function MessageBubble({ m, darkMode, onRegenerate, isLast, isTyping, onHelperClick, onSchedule, onFinance }) {
  const isUser = m.role === "user";

  const handleHelperAction = (action) => {
    // Always send the prompt to chat first so user gets a data-driven response
    if (action.prompt && onHelperClick) onHelperClick(action.prompt);
    // Then also open the relevant modal as a complementary action
    if (action.action === "schedule" && onSchedule) setTimeout(() => onSchedule(), 600);
    if (action.action === "finance" && onFinance) setTimeout(() => onFinance(), 600);
  };

  return (
    <div className="group py-3 sm:py-5">
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 px-3 sm:px-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              U
            </div>
          ) : (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              darkMode ? "bg-emerald-600 text-white" : "bg-emerald-500 text-white"
            }`}>
              X
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Role label */}
          <div className={`text-sm font-semibold mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
            {isUser ? "You" : "X-ULTRA"}
          </div>

          {/* Message text — rendered as markdown */}
          {m.text === "..." ? (
            <TypingDots darkMode={darkMode} />
          ) : (
            <div className={`prose max-w-none text-sm sm:text-[15px] leading-6 sm:leading-7 ${
              darkMode ? "prose-invert text-gray-300" : "text-gray-700"
            }`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              >
                {m.text}
              </ReactMarkdown>
            </div>
          )}

          {/* File attachment */}
          {m.file && (
            <div className={`mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
              darkMode
                ? "border-gray-700 bg-gray-800 text-gray-300"
                : "border-gray-200 bg-gray-50 text-gray-600"
            }`}>
              <FaFileAlt size={14} />
              <a href={m.file.url} target="_blank" rel="noreferrer" className="hover:underline">
                {m.file.name}
              </a>
            </div>
          )}

          {/* Action buttons (copy + regenerate) — visible on hover for assistant */}
          {!isUser && m.text && m.text !== "..." && (
            <div className={`flex items-center gap-1 mt-2 transition-opacity ${
              isLast ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}>
              <CopyButton text={m.text} darkMode={darkMode} />
              {isLast && !isTyping && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className={`p-1.5 rounded-md transition-colors ${
                    darkMode
                      ? "hover:bg-gray-700 text-gray-500 hover:text-gray-300"
                      : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  }`}
                  title="Regenerate"
                >
                  <FaRedo size={13} />
                </button>
              )}
            </div>
          )}

          {/* ─── Helper action buttons below every assistant message ─── */}
          {!isUser && m.text && m.text !== "..." && !isTyping && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {HELPER_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleHelperAction(action)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    action.action
                      ? darkMode
                        ? "border-indigo-700/50 text-indigo-300 hover:text-indigo-100 hover:bg-indigo-900/40 hover:border-indigo-500/60"
                        : "border-indigo-200 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 hover:border-indigo-300"
                      : darkMode
                        ? "border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-800 hover:border-gray-600"
                        : "border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span className={action.action ? (darkMode ? "text-indigo-400" : "text-indigo-500") : (darkMode ? "text-gray-500" : "text-gray-400")}>{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HELPER ACTIONS — shown below every assistant message
   ═══════════════════════════════════════════════════════════ */
const HELPER_ACTIONS = [
  { icon: <FaChartLine size={11} />,     label: "Analyze results",           prompt: "Analyze my completed assessment results and provide key insights based on my actual scores." },
  { icon: <FaRocket size={11} />,        label: "Transformation roadmap",    prompt: "Generate a detailed transformation roadmap based on my assessment scores, weaknesses and strengths." },
  { icon: <FaLightbulb size={11} />,     label: "What to prioritize?",       prompt: "Based on my scores, what systems should I prioritize improving first and why?" },
  { icon: <FaStar size={11} />,          label: "Compare performance",       prompt: "Compare the performance across all my assessed systems and identify gaps." },
  { icon: <FaSearchDollar size={11} />,  label: "Financial Impact",          prompt: "Analyze the financial impact of my assessment scores. Show me where I am losing money and what fixing each system would save.", action: "finance" },
  { icon: <FaHandshake size={11} />,     label: "Schedule Consultation",     prompt: "Based on my assessment results, what kind of consultation do I need? Show me options and urgency level.", action: "schedule" },
];

/* ═══════════════════════════════════════════════════════════
   SUGGESTION CHIPS — shown when no messages
   ═══════════════════════════════════════════════════════════ */
const SUGGESTIONS = [
  { icon: <FaChartLine size={14} />,     label: "Analyze my assessment results",     prompt: "Analyze my completed assessment results and provide key insights based on my actual scores." },
  { icon: <FaClipboardList size={14} />, label: "Generate transformation roadmap",   prompt: "Generate a detailed transformation roadmap based on my assessment scores, weaknesses and strengths." },
  { icon: <FaCalendarAlt size={14} />,   label: "What should I prioritize?",         prompt: "Based on my scores, what systems should I prioritize improving first and why?" },
  { icon: <FaCube size={14} />,          label: "Compare system performance",        prompt: "Compare the performance across all my assessed systems and identify gaps." },
  { icon: <FaSearchDollar size={14} />,  label: "Financial impact analysis",         prompt: "Analyze the financial impact of my assessment scores. Show me where I am losing money and what fixing each system would save." },
  { icon: <FaHandshake size={14} />,     label: "Schedule a consultation",           prompt: "Based on my assessment results, what kind of consultation do I need? Show me options and urgency level." },
];

/* ═══════════════════════════════════════════════════════════
   MAIN CHAT SECTION — exported default
   ═══════════════════════════════════════════════════════════ */
export default function ChatSection({
  darkMode,
  chatMessages = [],
  setChatMessages,
  textareaRef,
  textValue,
  setTextValue,
  uploadedFile,
  setUploadedFile,
  onAttachClick,
  onBackToOptions,
  onDownloadPDF,
  onSchedule,
  onFinance,
  onRunAnalysis,
  generatingAnalysis = false,
  assessmentContext = null,
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const isEmpty = !chatMessages || chatMessages.length === 0;

  /* ─── Auto-scroll on new messages ─── */
  useEffect(() => {
    if (messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [chatMessages, isTyping]);

  /* ─── Auto-resize textarea ─── */
  useEffect(() => {
    if (!textareaRef?.current) return;
    const ta = textareaRef.current;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [textValue, textareaRef]);

  /* ─── Handle send — AI-powered with API fallback ─── */
  const handleSend = useCallback(async (text) => {
    if (!text?.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      file: uploadedFile ? { ...uploadedFile } : undefined,
    };
    setChatMessages(prev => [...prev, userMsg]);
    setTextValue("");
    setUploadedFile?.(null);

    // Typing indicator
    setIsTyping(true);
    const typingId = `typing-${Date.now()}`;
    const typingMsg = { id: typingId, role: "assistant", text: "...", timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, typingMsg]);

    try {
      // Try OpenRouter API first, fall back to local intelligent response
      let reply;
      const apiKey = process.env.REACT_APP_OPENROUTER_KEY;
      if (apiKey) {
        reply = await queryAI(text.trim(), assessmentContext);
      }
      if (!reply) {
        reply = generateLocalResponse(text.trim(), assessmentContext);
      }

      setIsTyping(false);
      setChatMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);
        return [...filtered, {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: reply,
          timestamp: new Date().toISOString(),
        }];
      });
    } catch (err) {
      console.error("AI response error:", err);
      setIsTyping(false);
      setChatMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);
        return [...filtered, {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: generateLocalResponse(text.trim(), assessmentContext),
          timestamp: new Date().toISOString(),
        }];
      });
    }
  }, [uploadedFile, setChatMessages, setTextValue, setUploadedFile, assessmentContext]);

  /* ─── Handle suggestion click ─── */
  const handleSuggestion = useCallback((prompt) => {
    handleSend(prompt);
  }, [handleSend]);

  /* ─── Handle regenerate (resend last user msg) ─── */
  const handleRegenerate = useCallback(() => {
    const lastUserMsg = [...chatMessages].reverse().find(m => m.role === "user");
    if (lastUserMsg) {
      // Remove last assistant message
      setChatMessages(prev => {
        const lastAssistantIdx = prev.map((m, i) => m.role === "assistant" ? i : -1).filter(i => i >= 0).pop();
        if (lastAssistantIdx !== undefined && lastAssistantIdx >= 0) {
          return prev.filter((_, i) => i !== lastAssistantIdx);
        }
        return prev;
      });
      // Re-send
      setTimeout(() => handleSend(lastUserMsg.text), 100);
    }
  }, [chatMessages, setChatMessages, handleSend]);

  /* ─── Keyboard handler ─── */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(textValue);
    }
  };

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl transition-colors ${
        darkMode ? "bg-gray-900" : "bg-white"
      }`}
      style={{ height: "75vh", minHeight: 480 }}
      role="region"
      aria-label="Executive Analyst chat"
    >
      {/* Global styles */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
          height: 0;
          width: 0;
        }
        @keyframes chatPulse {
          0%, 80%, 100% { opacity: 0.4; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* ─── Top bar ─── */}
      <div className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b flex-shrink-0 ${
        darkMode ? "border-gray-800" : "border-gray-100"
      }`}>
        <div className="flex-1 flex items-center justify-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            X-ULTRA Intelligence
            <FaChevronDown size={10} className={darkMode ? "text-gray-500" : "text-gray-400"} />
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isTyping || generatingAnalysis ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
          }`} />
          <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
            {isTyping || generatingAnalysis ? "Thinking..." : "Online"}
          </span>
        </div>
      </div>

      {/* ─── Messages / Empty state ─── */}
      <div ref={containerRef} className="flex-1 overflow-y-auto hide-scrollbar">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              darkMode ? "bg-emerald-600" : "bg-emerald-500"
            }`}>
              <span className="text-white text-2xl font-bold">X</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-semibold mb-2 ${
              darkMode ? "text-gray-200" : "text-gray-800"
            }`}>
              How can I help you today?
            </h2>
            <p className={`text-xs sm:text-sm mb-6 sm:mb-8 max-w-md text-center ${
              darkMode ? "text-gray-500" : "text-gray-400"
            }`}>
              I'm X-ULTRA, your executive intelligence analyst. Ask me about your assessment results, organizational health, or generate a full analysis report.
            </p>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl px-2 sm:px-0">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestion(s.prompt)}
                  className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border text-left transition-colors ${
                    darkMode
                      ? "border-gray-700 hover:bg-gray-800/80 text-gray-300"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className={`mt-0.5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{s.icon}</span>
                  <span className="text-sm">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages list */
          <div className="pb-4">
            {chatMessages.map((m, idx) => (
              <MessageBubble
                key={m.id}
                m={m}
                darkMode={darkMode}
                isLast={idx === chatMessages.length - 1 && m.role === "assistant"}
                isTyping={isTyping}
                onRegenerate={
                  idx === chatMessages.length - 1 && m.role === "assistant"
                    ? handleRegenerate
                    : undefined
                }
                onHelperClick={handleSend}
                onSchedule={onSchedule}
                onFinance={onFinance}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ─── Run analysis button ─── */}
      {onRunAnalysis && (
        <div className={`flex items-center justify-center py-2 flex-shrink-0 border-t ${
          darkMode ? "border-gray-800" : "border-gray-100"
        }`}>
          <button
            onClick={() => typeof onRunAnalysis === "function" && onRunAnalysis()}
            disabled={!onRunAnalysis || generatingAnalysis}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              onRunAnalysis && !generatingAnalysis
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {generatingAnalysis ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FaPlay size={11} />
            )}
            <span>{generatingAnalysis ? "Running Analysis..." : "Run ConseQ-X Ultra Analysis"}</span>
          </button>
        </div>
      )}

      {/* ─── Input area (ChatGPT-style) ─── */}
      <div className="px-2 sm:px-4 pb-3 sm:pb-4 pt-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Uploaded file preview */}
          {uploadedFile && (
            <div className={`mb-2 flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-gray-200"
                : "bg-gray-50 border-gray-200 text-gray-800"
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <FaPaperclip size={14} className={darkMode ? "text-gray-400" : "text-gray-500"} />
                <span className="text-sm truncate">{uploadedFile.name}</span>
                <span className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                  ({(uploadedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => setUploadedFile?.(null)}
                className={`p-1 rounded-md ${
                  darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                }`}
              >
                <FaTimes size={12} />
              </button>
            </div>
          )}

          {/* Composer */}
          <div className={`relative flex items-end gap-2 rounded-2xl border px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm ${
            darkMode
              ? "bg-gray-800 border-gray-700 focus-within:border-gray-600"
              : "bg-gray-50 border-gray-300 focus-within:border-gray-400"
          }`}>
            {/* Attach button */}
            <button
              onClick={onAttachClick}
              className={`p-1.5 rounded-lg self-end mb-0.5 transition-colors ${
                darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
              }`}
              title="Attach file"
            >
              <FaPaperclip size={16} />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message X-ULTRA..."
              rows={1}
              className={`flex-1 resize-none bg-transparent outline-none text-sm sm:text-[15px] leading-6 hide-scrollbar ${
                darkMode
                  ? "text-gray-200 placeholder-gray-500"
                  : "text-gray-800 placeholder-gray-400"
              }`}
              style={{ maxHeight: 200 }}
            />

            {/* Send button */}
            <button
              onClick={() => handleSend(textValue)}
              disabled={!textValue?.trim() || isTyping}
              className={`p-2 rounded-lg self-end mb-0.5 transition-all ${
                textValue?.trim() && !isTyping
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : darkMode
                    ? "bg-gray-700 text-gray-500"
                    : "bg-gray-200 text-gray-400"
              }`}
              title="Send message"
            >
              <FaPaperPlane size={14} />
            </button>
          </div>

          {/* Disclaimer */}
          <p className={`text-[11px] text-center mt-2 ${darkMode ? "text-gray-600" : "text-gray-400"}`}>
            X-ULTRA can make mistakes. Verify important organizational decisions independently.
          </p>
        </div>
      </div>

      {/* ─── Minimal bottom bar — just back button ─── */}
      <div className={`flex-shrink-0 px-3 sm:px-4 pb-2 pt-1 border-t ${
        darkMode ? "border-gray-800" : "border-gray-100"
      }`}>
        <div className="max-w-3xl mx-auto flex justify-start">
          <button onClick={onBackToOptions} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            darkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          }`}>← Back to Options</button>
        </div>
      </div>
    </div>
  );
}
