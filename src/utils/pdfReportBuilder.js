
import { jsPDF } from "jspdf";

/* ─── Color Palette ─── */
const COLORS = {
  primary:      [30, 58, 138],     // deep blue
  primaryLight: [59, 130, 246],    // lighter blue
  accent:       [245, 158, 11],    // gold/amber
  success:      [16, 185, 129],    // green
  warning:      [251, 191, 36],    // yellow
  danger:       [239, 68, 68],     // red
  dark:         [31, 41, 55],      // near-black
  text:         [55, 65, 81],      // dark gray
  textLight:    [107, 114, 128],   // medium gray
  white:        [255, 255, 255],
  coverBg:      [15, 23, 42],      // navy
  sectionBg:    [248, 250, 252],   // very light gray
  tableBorder:  [209, 213, 219],   // gray-300
  tableHeader:  [30, 58, 138],     // deep blue
  tableStripe:  [239, 246, 255],   // blue-50
};

/* ─── Helpers ─── */
function extractText(interp, field) {
  if (!interp) return "";
  if (typeof interp === "string") return interp;
  if (typeof interp === "object") {
    if (interp[field] && typeof interp[field] === "string") return interp[field];
    if (interp.interpretation && typeof interp.interpretation === "string") return interp.interpretation;
    if (interp.rating && typeof interp.rating === "string") return interp.rating;
    const vals = Object.values(interp).filter(v => typeof v === "string" && v.length > 0);
    return vals.length > 0 ? vals.join(" — ") : "";
  }
  return "";
}

function formatSystemName(id) {
  return id.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function getStatusInfo(pct) {
  if (pct >= 70) return { label: "Strong", color: COLORS.success, emoji: "●" };
  if (pct >= 40) return { label: "Needs Work", color: COLORS.warning, emoji: "●" };
  return { label: "Critical", color: COLORS.danger, emoji: "●" };
}

function getPlainRating(pct) {
  if (pct >= 80) return "Excellent";
  if (pct >= 70) return "Strong";
  if (pct >= 55) return "Fair";
  if (pct >= 40) return "Below Average";
  if (pct >= 25) return "Weak";
  return "Critical";
}

/* ─── Page dimensions ─── */
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;
const CONTENT_W = PAGE_W - MARGIN * 2;
const FOOTER_H = 16;

/**
 * Build and return a downloadable jsPDF instance.
 * @param {{ scores: Object, userInfo: { organization, role, email }, analysisText?: string }} opts
 * @returns {jsPDF}
 */
export function buildPDFReport({ scores, userInfo, analysisText }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const org = userInfo?.organization || "Your Organization";
  const role = userInfo?.role || "CEO";

  const entries = Object.entries(scores || {});
  if (entries.length === 0) {
    doc.setFontSize(16);
    doc.text("No assessment data available.", MARGIN, 40);
    return doc;
  }

  // Computed overall stats
  const overallScore = entries.reduce((s, [, d]) => s + (d.systemScore || 0), 0);
  const overallMax = entries.reduce((s, [, d]) => s + (d.maxSystemScore || 0), 0);
  const overallPct = overallMax > 0 ? Math.round((overallScore / overallMax) * 100) : 0;

  let y = 0; // tracks current Y position

  /* ─── Utility: check & add new page ─── */
  function ensureSpace(needed) {
    if (y + needed > PAGE_H - FOOTER_H - 6) {
      addFooter(doc);
      doc.addPage();
      y = MARGIN;
      return true;
    }
    return false;
  }

  /* ═══════════════════════════════════
     PAGE 1 — Cover Page
     ═══════════════════════════════════ */
  // Full-page navy background
  doc.setFillColor(...COLORS.coverBg);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Decorative accent stripe
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, PAGE_W, 4, "F");

  // Decorative geometric shapes
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.03 }));
  doc.circle(170, 60, 80, "F");
  doc.circle(40, 240, 60, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo placeholder — gold circle with "CX"
  doc.setFillColor(...COLORS.accent);
  doc.circle(PAGE_W / 2, 55, 16, "F");
  doc.setTextColor(...COLORS.coverBg);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("CX", PAGE_W / 2, 59, { align: "center" });

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("ORGANIZATIONAL", PAGE_W / 2, 95, { align: "center" });
  doc.text("HEALTH REPORT", PAGE_W / 2, 108, { align: "center" });

  // Gold line separator
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(1.2);
  doc.line(PAGE_W / 2 - 30, 118, PAGE_W / 2 + 30, 118);

  // Subtitle
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 255);
  doc.text("ConseQ-X Assessment Platform", PAGE_W / 2, 130, { align: "center" });

  // Info box
  const boxY = 155;
  const boxH = 60;
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.08 }));
  doc.roundedRect(MARGIN + 15, boxY, CONTENT_W - 30, boxH, 4, 4, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  doc.setFontSize(11);
  doc.setTextColor(200, 210, 230);
  doc.setFont("helvetica", "normal");
  const infoX = MARGIN + 25;
  doc.text("Company", infoX, boxY + 14);
  doc.text("Prepared For", infoX, boxY + 28);
  doc.text("Date", infoX, boxY + 42);

  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(org, infoX + 50, boxY + 14);
  doc.text(role, infoX + 50, boxY + 28);
  doc.text(today, infoX + 50, boxY + 42);

  // Overall score ring at bottom of cover
  const ringCenterX = PAGE_W / 2;
  const ringCenterY = 252;
  const ringR = 22;

  // Outer ring background
  doc.setDrawColor(60, 80, 120);
  doc.setLineWidth(5);
  doc.circle(ringCenterX, ringCenterY, ringR, "S");

  // Colored progress arc (approximated as colored circle overlay)
  const statusInfo = getStatusInfo(overallPct);
  doc.setDrawColor(...statusInfo.color);
  doc.setLineWidth(5);
  // Draw partial arc using a filled wedge approach
  const arcAngle = (overallPct / 100) * 360;
  drawArc(doc, ringCenterX, ringCenterY, ringR, -90, -90 + arcAngle, statusInfo.color);

  // Center score text
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`${overallPct}%`, ringCenterX, ringCenterY + 3, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 255);
  doc.text("OVERALL HEALTH", ringCenterX, ringCenterY + 10, { align: "center" });

  // Bottom accent
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");

  // Confidential notice
  doc.setFontSize(7);
  doc.setTextColor(120, 140, 170);
  doc.text("CONFIDENTIAL — Prepared exclusively for " + org, PAGE_W / 2, PAGE_H - 10, { align: "center" });


  /* ═══════════════════════════════════
     PAGE 2 — Executive Summary
     ═══════════════════════════════════ */
  doc.addPage();
  y = MARGIN;

  y = drawSectionHeader(doc, "EXECUTIVE SUMMARY", y);
  y += 4;

  // Overall summary card
  doc.setFillColor(...COLORS.sectionBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 28, 3, 3, "F");
  doc.setDrawColor(...COLORS.primaryLight);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_W, 28, 3, 3, "S");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text("Overall Score", MARGIN + 6, y + 8);
  doc.text("Health Status", MARGIN + 55, y + 8);
  doc.text("Systems Assessed", MARGIN + 110, y + 8);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.dark);
  doc.text(`${overallScore}/${overallMax}  (${overallPct}%)`, MARGIN + 6, y + 20);

  doc.setTextColor(...statusInfo.color);
  doc.text(statusInfo.label, MARGIN + 55, y + 20);

  doc.setTextColor(...COLORS.dark);
  doc.text(`${entries.length}`, MARGIN + 110, y + 20);

  y += 34;

  // Commentary
  let summaryText;
  if (overallPct >= 70) {
    summaryText = `${org} is in a strong position. Your systems are working well across the board. The focus should now be on maintaining this performance and pushing for even better results. Companies at this level tend to outperform their peers in revenue growth, talent retention, and operational efficiency.`;
  } else if (overallPct >= 40) {
    summaryText = `${org} has a solid foundation, but there are clear gaps that are costing you money, time, and talent. These issues will not fix themselves. Without focused attention in the next 6-12 months, these gaps will widen and become significantly more expensive to address.`;
  } else {
    summaryText = `${org} is showing critical weaknesses across multiple systems. The data indicates serious structural problems that are likely impacting revenue, talent retention, and operational effectiveness. Immediate intervention is recommended to prevent further deterioration.`;
  }
  y = drawWrappedText(doc, summaryText, MARGIN, y, CONTENT_W, 10, COLORS.text);
  y += 6;

  // System summary table
  y = drawSectionSubheader(doc, "System-by-System Overview", y);
  y += 3;

  // Table header
  const colWidths = [60, 30, 25, 25, CONTENT_W - 140];
  const headers = ["System", "Score", "%", "Status", "Key Finding"];
  y = drawTableHeader(doc, headers, colWidths, y);

  // Table rows
  entries.forEach(([sysId, sysData], idx) => {
    ensureSpace(12);
    const pct = sysData.maxSystemScore > 0 ? Math.round((sysData.systemScore / sysData.maxSystemScore) * 100) : 0;
    const si = getStatusInfo(pct);
    const interpText = extractText(sysData.interpretation, "interpretation") || getPlainRating(pct);
    const rowData = [
      formatSystemName(sysId),
      `${sysData.systemScore}/${sysData.maxSystemScore}`,
      `${pct}%`,
      si.label,
      interpText.substring(0, 60) + (interpText.length > 60 ? "..." : ""),
    ];
    y = drawTableRow(doc, rowData, colWidths, y, idx % 2 === 1, si.color);
  });

  y += 4;

  // Visual bar chart
  ensureSpace(entries.length * 12 + 20);
  y = drawSectionSubheader(doc, "Performance at a Glance", y);
  y += 5;

  entries.forEach(([sysId, sysData]) => {
    ensureSpace(14);
    const pct = sysData.maxSystemScore > 0 ? Math.round((sysData.systemScore / sysData.maxSystemScore) * 100) : 0;
    const si = getStatusInfo(pct);
    const barMaxW = CONTENT_W - 60;
    const barW = Math.max(2, (pct / 100) * barMaxW);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(formatSystemName(sysId), MARGIN, y + 4);

    // Background bar
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(MARGIN + 55, y, barMaxW, 6, 2, 2, "F");

    // Filled bar
    doc.setFillColor(...si.color);
    doc.roundedRect(MARGIN + 55, y, barW, 6, 2, 2, "F");

    // Percentage label
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...si.color);
    doc.text(`${pct}%`, MARGIN + 57 + barMaxW, y + 5);

    y += 10;
  });

  y += 4;
  addFooter(doc);


  /* ═══════════════════════════════════
     PAGES 3+ — Detailed System Reports
     ═══════════════════════════════════ */
  for (const [sysId, sysData] of entries) {
    doc.addPage();
    y = MARGIN;

    const sysName = formatSystemName(sysId);
    const pct = sysData.maxSystemScore > 0 ? Math.round((sysData.systemScore / sysData.maxSystemScore) * 100) : 0;
    const si = getStatusInfo(pct);
    const interpText = extractText(sysData.interpretation, "interpretation") || getPlainRating(pct);
    const ratingText = extractText(sysData.interpretation, "rating") || getPlainRating(pct);

    // System header with colored accent
    doc.setFillColor(...si.color);
    doc.rect(MARGIN, y, 4, 16, "F");
    doc.setFillColor(...COLORS.sectionBg);
    doc.rect(MARGIN + 4, y, CONTENT_W - 4, 16, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.dark);
    doc.text(`The System of ${sysName}`, MARGIN + 10, y + 7);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...si.color);
    doc.text(`${sysData.systemScore}/${sysData.maxSystemScore}  (${pct}%)  —  ${ratingText}`, MARGIN + 10, y + 14);

    y += 22;

    // Score indicator bar
    const scoreBarW = CONTENT_W;
    const scoreFillW = Math.max(2, (pct / 100) * scoreBarW);
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(MARGIN, y, scoreBarW, 5, 2, 2, "F");
    doc.setFillColor(...si.color);
    doc.roundedRect(MARGIN, y, scoreFillW, 5, 2, 2, "F");
    y += 10;

    // What this means
    y = drawSectionSubheader(doc, "What This Means for Your Organization", y);
    y += 2;
    const briefText = getBriefText(sysName, pct, org);
    y = drawWrappedText(doc, briefText, MARGIN, y, CONTENT_W, 9, COLORS.text);
    y += 6;

    // Sub-assessments table
    if (sysData.subAssessments && Object.keys(sysData.subAssessments).length > 0) {
      ensureSpace(30);
      y = drawSectionSubheader(doc, "Sub-Assessment Breakdown", y);
      y += 3;

      const subCols = [50, 25, 20, 25, CONTENT_W - 120];
      const subHeaders = ["Area", "Score", "%", "Status", "Interpretation"];
      y = drawTableHeader(doc, subHeaders, subCols, y);

      Object.entries(sysData.subAssessments).forEach(([subId, subData], idx) => {
        ensureSpace(12);
        const subPct = subData.maxScore > 0 ? Math.round((subData.score / subData.maxScore) * 100) : 0;
        const subSi = getStatusInfo(subPct);
        const subInterpText = extractText(subData.interpretation, "interpretation")
          || extractText(subData.interpretation, "rating")
          || getPlainRating(subPct);
        y = drawTableRow(doc, [
          formatSystemName(subId),
          `${subData.score}/${subData.maxScore}`,
          `${subPct}%`,
          subSi.label,
          subInterpText.substring(0, 55) + (subInterpText.length > 55 ? "..." : ""),
        ], subCols, y, idx % 2 === 1, subSi.color);
      });
      y += 6;

      // Highlight weak sub-assessments
      const weakSubs = Object.entries(sysData.subAssessments).filter(([, d]) => d.maxScore > 0 && Math.round((d.score / d.maxScore) * 100) < 40);
      if (weakSubs.length > 0) {
        ensureSpace(10 + weakSubs.length * 8);
        doc.setFillColor(254, 242, 242);
        const alertH = 8 + weakSubs.length * 7;
        doc.roundedRect(MARGIN, y, CONTENT_W, alertH, 2, 2, "F");
        doc.setDrawColor(...COLORS.danger);
        doc.setLineWidth(0.4);
        doc.roundedRect(MARGIN, y, CONTENT_W, alertH, 2, 2, "S");

        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...COLORS.danger);
        doc.text("Areas Needing Urgent Attention:", MARGIN + 5, y + 6);
        y += 9;

        weakSubs.forEach(([subId, subData]) => {
          const subPct = Math.round((subData.score / subData.maxScore) * 100);
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...COLORS.text);
          doc.text(`• ${formatSystemName(subId)} scored ${subPct}% — this is pulling down the entire ${sysName} system`, MARGIN + 8, y + 5);
          y += 7;
        });
        y += 4;
      }
    }

    // Recommendations
    ensureSpace(40);
    y = drawSectionSubheader(doc, "What You Should Do Right Now", y);
    y += 3;
    const actions = getActions(pct, sysName, org);
    actions.forEach((action, i) => {
      ensureSpace(22);
      // Number badge
      doc.setFillColor(...COLORS.primaryLight);
      doc.circle(MARGIN + 4, y + 3, 4, "F");
      doc.setTextColor(...COLORS.white);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}`, MARGIN + 4, y + 5, { align: "center" });

      // Action title
      doc.setTextColor(...COLORS.dark);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(action.title, MARGIN + 12, y + 5);
      y += 8;

      // Action description
      y = drawWrappedText(doc, action.desc, MARGIN + 12, y, CONTENT_W - 14, 8.5, COLORS.text);
      y += 5;
    });

    // What happens if nothing changes
    ensureSpace(30);
    y = drawSectionSubheader(doc, "What Happens If Nothing Changes", y);
    y += 2;
    const forecast = getForecastText(pct, sysName, org);
    y = drawWrappedText(doc, forecast, MARGIN, y, CONTENT_W, 9, COLORS.text);
    y += 4;

    addFooter(doc);
  }


  /* ═══════════════════════════════════
     FINAL PAGE — Call to Action
     ═══════════════════════════════════ */
  doc.addPage();
  y = MARGIN;

  y = drawSectionHeader(doc, "WHAT TO DO NEXT", y);
  y += 6;

  // CTA box
  doc.setFillColor(...COLORS.coverBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 50, 4, 4, "F");

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to Transform Your Organization?", MARGIN + 10, y + 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 210, 230);
  doc.text("This report has shown you exactly where you stand.", MARGIN + 10, y + 24);
  doc.text("The question now is: what are you going to do about it?", MARGIN + 10, y + 31);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.accent);
  doc.text("Book a Consultation  |  Email: ods@conseq-x.com", MARGIN + 10, y + 43);

  y += 58;

  // Available tools table
  y = drawSectionSubheader(doc, "Tools Available to Help You", y);
  y += 3;

  const toolsCols = [45, 65, CONTENT_W - 110];
  y = drawTableHeader(doc, ["Tool", "What It Does", "How It Helps You"], toolsCols, y);

  const tools = [
    ["Transformation Simulator", "Model different scenarios before investing money", "See likely ROI before committing resources"],
    ["Health Index Dashboard", "Track your progress over time in real-time", "See whether interventions are actually working"],
    ["Executive Coaching", "One-on-one leadership development", "Lead the transformation effectively"],
    ["Deep-Dive System Audit", "Goes deeper into any underperforming system", "Finds root causes, not just symptoms"],
  ];

  tools.forEach((row, idx) => {
    ensureSpace(12);
    y = drawTableRow(doc, row, toolsCols, y, idx % 2 === 1, COLORS.primaryLight);
  });

  y += 10;

  // Final quote
  doc.setFillColor(...COLORS.sectionBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 18, 3, 3, "F");
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.8);
  doc.line(MARGIN + 4, y + 4, MARGIN + 4, y + 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.textLight);
  doc.text('"Every day you wait to fix a broken system, it costs you more to fix it tomorrow."', MARGIN + 10, y + 8);
  doc.text("— ConseQ-X", MARGIN + 10, y + 14);

  addFooter(doc);

  return doc;
}


/**
 * Build PDF and trigger immediate download to device
 */
export function downloadPDFReport({ scores, userInfo, analysisText }) {
  const doc = buildPDFReport({ scores, userInfo, analysisText });
  const org = userInfo?.organization || "Assessment";
  const filename = `${org.replace(/[^a-zA-Z0-9]/g, "_")}_ConseQX_Report.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Build PDF and return as blob URL (for chat attachment)
 */
export function buildPDFBlobUrl({ scores, userInfo, analysisText }) {
  const doc = buildPDFReport({ scores, userInfo, analysisText });
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}

/**
 * Build and download a beautiful PDF for a single system deep-dive report.
 * Called from OrgHealthOverview / System Deep Dive modal.
 *
 * @param {{ systemLabel, score, timestamp, subScores, insights, forecasts, recommendations, caseStudy, orgName }} opts
 */
export function downloadSystemDeepDivePDF({
  systemLabel = "System",
  score = null,
  timestamp = null,
  subScores = [],
  insights = [],
  forecasts = [],
  recommendations = [],
  caseStudy = null,
  orgName = "Your Organisation",
  ranking = null,
}) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const scorePct = typeof score === "number" ? score : 0;

  let y = 0;

  function ensureSpace(needed) {
    if (y + needed > PAGE_H - FOOTER_H - 6) {
      addFooter(doc);
      doc.addPage();
      y = MARGIN;
      return true;
    }
    return false;
  }

  /* ═══ COVER PAGE ═══ */
  doc.setFillColor(...COLORS.coverBg);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  // Accent stripe
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, PAGE_W, 4, "F");

  // Subtle decorative circles
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.03 }));
  doc.circle(170, 60, 80, "F");
  doc.circle(40, 240, 60, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Logo
  doc.setFillColor(...COLORS.accent);
  doc.circle(PAGE_W / 2, 50, 14, "F");
  doc.setTextColor(...COLORS.coverBg);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("CX", PAGE_W / 2, 53.5, { align: "center" });

  // Title
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("SYSTEM DEEP DIVE", PAGE_W / 2, 85, { align: "center" });

  // System name
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.accent);
  doc.text(systemLabel.toUpperCase(), PAGE_W / 2, 100, { align: "center" });

  // Gold divider
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(1);
  doc.line(PAGE_W / 2 - 25, 108, PAGE_W / 2 + 25, 108);

  // Info box
  const boxY = 130;
  doc.setFillColor(255, 255, 255);
  doc.setGState(new doc.GState({ opacity: 0.08 }));
  doc.roundedRect(MARGIN + 20, boxY, CONTENT_W - 40, 50, 4, 4, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  doc.setFontSize(10);
  doc.setTextColor(200, 210, 230);
  doc.setFont("helvetica", "normal");
  const infoX = MARGIN + 30;
  doc.text("Organisation", infoX, boxY + 14);
  doc.text("Report Date", infoX, boxY + 28);
  doc.text("Assessment Date", infoX, boxY + 42);

  doc.setTextColor(...COLORS.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(orgName, infoX + 48, boxY + 14);
  doc.text(today, infoX + 48, boxY + 28);
  doc.text(timestamp ? new Date(timestamp).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—", infoX + 48, boxY + 42);

  // Score ring
  const ringCX = PAGE_W / 2;
  const ringCY = 225;
  const ringR = 24;

  doc.setDrawColor(60, 80, 120);
  doc.setLineWidth(6);
  doc.circle(ringCX, ringCY, ringR, "S");

  const statusInfo = getStatusInfo(scorePct);
  const arcAngle = (scorePct / 100) * 360;
  drawArc(doc, ringCX, ringCY, ringR, -90, -90 + arcAngle, statusInfo.color);

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text(`${scorePct}%`, ringCX, ringCY + 3, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 200, 255);
  doc.text("SYSTEM SCORE", ringCX, ringCY + 11, { align: "center" });
  doc.text(statusInfo.label.toUpperCase(), ringCX, ringCY + 17, { align: "center" });

  // Bottom accent
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, PAGE_H - 4, PAGE_W, 4, "F");

  doc.setFontSize(7);
  doc.setTextColor(120, 140, 170);
  doc.text("CONFIDENTIAL — Prepared for " + orgName, PAGE_W / 2, PAGE_H - 10, { align: "center" });

  /* ═══ PAGE 2 — SUB-ASSESSMENT BREAKDOWN ═══ */
  doc.addPage();
  y = MARGIN;

  if (subScores.length > 0) {
    y = drawSectionHeader(doc, "SUB-ASSESSMENT BREAKDOWN", y);
    y += 4;

    // Summary text
    const strongCount = subScores.filter(s => (s.max > 0 ? (s.score / s.max) * 100 : 0) >= 70).length;
    const weakCount = subScores.filter(s => (s.max > 0 ? (s.score / s.max) * 100 : 0) < 40).length;
    let summaryLine = `This system was assessed across ${subScores.length} areas. `;
    if (strongCount > 0) summaryLine += `${strongCount} area${strongCount > 1 ? "s are" : " is"} performing well. `;
    if (weakCount > 0) summaryLine += `${weakCount} area${weakCount > 1 ? "s need" : " needs"} urgent attention.`;
    else if (strongCount === 0) summaryLine += "Most areas have room for improvement.";
    y = drawWrappedText(doc, summaryLine, MARGIN, y, CONTENT_W, 10, COLORS.text);
    y += 6;

    // Table
    const colWidths = [72, 22, 22, 58];
    y = drawTableHeader(doc, ["Area", "Score", "%", "Rating"], colWidths, y);

    subScores.forEach((sub, idx) => {
      ensureSpace(10);
      const pct = sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : (sub.percent || 0);
      const sInfo = getStatusInfo(pct);
      const rating = sub.interpretation?.rating || getPlainRating(pct);
      y = drawTableRow(doc, [
        sub.title || `Area ${idx + 1}`,
        `${sub.score}/${sub.max}`,
        `${pct}%`,
        rating
      ], colWidths, y, idx % 2 === 1, sInfo.color);
    });

    y += 6;

    // Visual score bars for each sub-assessment
    ensureSpace(subScores.length * 10 + 15);
    y = drawSectionSubheader(doc, "Visual Breakdown", y);
    y += 3;

    subScores.forEach((sub) => {
      ensureSpace(12);
      const pct = sub.max > 0 ? Math.round((sub.score / sub.max) * 100) : 0;
      const sInfo = getStatusInfo(pct);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.dark);
      const label = (sub.title || "").length > 35 ? sub.title.substring(0, 33) + ".." : (sub.title || "");
      doc.text(label, MARGIN, y + 4);

      // Bar background
      const barX = MARGIN + 80;
      const barW = CONTENT_W - 80 - 18;
      doc.setFillColor(230, 230, 235);
      doc.roundedRect(barX, y, barW, 5, 1.5, 1.5, "F");

      // Bar fill
      const fillW = Math.max(1, (pct / 100) * barW);
      doc.setFillColor(...sInfo.color);
      doc.roundedRect(barX, y, fillW, 5, 1.5, 1.5, "F");

      // Percentage text
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...sInfo.color);
      doc.text(`${pct}%`, barX + barW + 3, y + 4);

      y += 9;
    });
  }

  /* ═══ WHAT THE RESULTS TELL US (INSIGHTS) ═══ */
  y += 4;
  ensureSpace(30);
  y = drawSectionHeader(doc, "WHAT THE RESULTS TELL US", y);
  y += 4;

  if (insights.length > 0) {
    insights.forEach((ins) => {
      ensureSpace(14);
      // Gold bullet
      doc.setFillColor(...COLORS.accent);
      doc.circle(MARGIN + 2.5, y + 1.5, 1.5, "F");
      y = drawWrappedText(doc, ins, MARGIN + 7, y, CONTENT_W - 7, 9.5, COLORS.text);
      y += 3;
    });
  } else {
    y = drawWrappedText(doc, `Your ${systemLabel} system scored ${scorePct}%. Run the assessment to see detailed insights here.`, MARGIN, y, CONTENT_W, 10, COLORS.textLight);
    y += 4;
  }

  /* ═══ HOW AN AFRICAN BUSINESS TACKLED THIS (CASE STUDY) ═══ */
  if (caseStudy) {
    y += 4;
    ensureSpace(40);
    y = drawSectionHeader(doc, "HOW AN AFRICAN BUSINESS TACKLED THIS", y);
    y += 4;

    // Company name in bold
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(caseStudy.company || "Case Study", MARGIN, y + 3);
    y += 8;

    // Story background box
    const storyText = caseStudy.summary || "";
    const storyLines = doc.splitTextToSize(storyText, CONTENT_W - 12);
    const storyH = storyLines.length * 4.5 + 10;
    ensureSpace(storyH + 20);

    doc.setFillColor(240, 253, 244); // light green bg
    doc.setDrawColor(34, 197, 94); // green border
    doc.setLineWidth(0.5);
    doc.roundedRect(MARGIN, y, CONTENT_W, storyH, 3, 3, "FD");

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);
    doc.text(storyLines, MARGIN + 6, y + 7);
    y += storyH + 4;

    // Outcome
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.success);
    doc.text("What happened:", MARGIN, y + 3);
    y += 6;
    y = drawWrappedText(doc, caseStudy.result || "", MARGIN, y, CONTENT_W, 9.5, COLORS.dark);
    y += 4;
  }

  /* ═══ WHAT TO EXPECT GOING FORWARD (FORECASTS) ═══ */
  if (forecasts.length > 0) {
    y += 4;
    ensureSpace(30);
    y = drawSectionHeader(doc, "WHAT TO EXPECT GOING FORWARD", y);
    y += 4;

    forecasts.forEach((f) => {
      ensureSpace(18);
      // Horizon label
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(f.horizon || "", MARGIN, y + 3);
      y += 6;
      y = drawWrappedText(doc, f.text || "", MARGIN + 4, y, CONTENT_W - 4, 9.5, COLORS.text);
      y += 4;
    });
  }

  /* ═══ WHAT WE RECOMMEND ═══ */
  if (recommendations.length > 0) {
    y += 4;
    ensureSpace(30);

    // Check if we need a new page
    if (y > PAGE_H / 2) {
      addFooter(doc);
      doc.addPage();
      y = MARGIN;
    }

    y = drawSectionHeader(doc, "WHAT WE RECOMMEND", y);
    y += 4;

    recommendations.forEach((rec) => {
      ensureSpace(20);

      // Time horizon heading with blue bg
      doc.setFillColor(239, 246, 255); // blue-50
      doc.setDrawColor(...COLORS.primaryLight);
      doc.setLineWidth(0.4);
      doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, "FD");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.primary);
      doc.text(rec.title || "", MARGIN + 4, y + 5.5);
      y += 12;

      (rec.items || []).forEach((item) => {
        ensureSpace(12);
        // Bullet dot
        doc.setFillColor(...COLORS.accent);
        doc.circle(MARGIN + 3, y + 1.5, 1, "F");
        y = drawWrappedText(doc, item, MARGIN + 7, y, CONTENT_W - 7, 9, COLORS.text);
        y += 3;
      });

      y += 3;
    });
  }

  /* ═══ RANKING ═══ */
  if (ranking) {
    y += 4;
    ensureSpace(20);
    y = drawSectionSubheader(doc, "System Ranking", y);
    y += 3;
    y = drawWrappedText(doc, `This system ranks ${ranking.rank} out of ${ranking.total} across all systems assessed.`, MARGIN, y, CONTENT_W, 10, COLORS.text);
    y += 4;
  }

  /* ═══ FOOTER ON LAST PAGE ═══ */
  addFooter(doc);

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc);
  }

  // Save
  const safeName = systemLabel.replace(/[^a-zA-Z0-9]/g, "_");
  const safeOrg = orgName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`${safeOrg}_${safeName}_Deep_Dive_Report.pdf`);
}


/* ═══════════════════════════════════════════════════════════════
   DRAWING HELPERS
   ═══════════════════════════════════════════════════════════════ */

/** Draw the page footer */
function addFooter(doc) {
  const pageNum = doc.internal.getNumberOfPages();
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.textLight);
  doc.text(`ConseQ-X Organizational Health Report`, MARGIN, PAGE_H - 8);
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });

  // Accent line
  doc.setDrawColor(...COLORS.accent);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);
}

/** Draw a section header with accent */
function drawSectionHeader(doc, title, y) {
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(MARGIN, y, CONTENT_W, 12, 2, 2, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN + 6, y + 8);
  return y + 16;
}

/** Draw a subsection header */
function drawSectionSubheader(doc, title, y) {
  doc.setDrawColor(...COLORS.primaryLight);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y + 7, MARGIN + 20, y + 7);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.primary);
  doc.text(title, MARGIN + 23, y + 8);
  return y + 13;
}

/** Draw table header row */
function drawTableHeader(doc, headers, colWidths, y) {
  doc.setFillColor(...COLORS.tableHeader);
  doc.rect(MARGIN, y, CONTENT_W, 8, "F");
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");

  let x = MARGIN + 3;
  headers.forEach((h, i) => {
    doc.text(h, x, y + 5.5);
    x += colWidths[i];
  });
  return y + 8;
}

/** Draw a table data row */
function drawTableRow(doc, cells, colWidths, y, isStripe, statusColor) {
  if (isStripe) {
    doc.setFillColor(...COLORS.tableStripe);
    doc.rect(MARGIN, y, CONTENT_W, 8, "F");
  }
  // Bottom border
  doc.setDrawColor(...COLORS.tableBorder);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 8, MARGIN + CONTENT_W, y + 8);

  doc.setFontSize(7.5);
  let x = MARGIN + 3;
  cells.forEach((cell, i) => {
    if (i === 3 && statusColor) {
      // Status column — colored text
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...statusColor);
    } else if (i === 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.dark);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.text);
    }
    // Truncate if too wide
    const maxChars = Math.floor(colWidths[i] / 2);
    const display = cell.length > maxChars ? cell.substring(0, maxChars - 2) + ".." : cell;
    doc.text(display, x, y + 5.5);
    x += colWidths[i];
  });
  return y + 8;
}

/** Draw wrapped text and return new Y position */
function drawWrappedText(doc, text, x, y, maxW, fontSize, color) {
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text, maxW);
  const lineH = fontSize * 0.45;
  for (const line of lines) {
    if (y + lineH > PAGE_H - FOOTER_H - 6) {
      addFooter(doc);
      doc.addPage();
      y = MARGIN;
    }
    doc.text(line, x, y);
    y += lineH;
  }
  return y;
}

/** Draw an arc on the score ring (segmented line approach) */
function drawArc(doc, cx, cy, r, startAngle, endAngle, color) {
  doc.setDrawColor(...color);
  doc.setLineWidth(5);
  const segments = Math.max(2, Math.abs(endAngle - startAngle) / 3);
  for (let i = 0; i < segments; i++) {
    const a1 = (startAngle + (i / segments) * (endAngle - startAngle)) * (Math.PI / 180);
    const a2 = (startAngle + ((i + 1) / segments) * (endAngle - startAngle)) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    doc.line(x1, y1, x2, y2);
  }
}


/* ═══════════════════════════════════════════════════════════════
   TEXT CONTENT HELPERS (Plain Nigerian CEO language)
   ═══════════════════════════════════════════════════════════════ */

function getBriefText(sysName, pct, org) {
  if (pct >= 70) {
    return `${org}'s ${sysName} system scored ${pct}%. This is a very good result. This part of your organization is working the way it should. The people, processes, and structures are aligned and producing results. Companies that score above 70% are typically among the top performers in their industry. Use the practices from this system as a model for improving weaker areas.`;
  }
  if (pct >= 40) {
    return `${org}'s ${sysName} system scored ${pct}%. This tells us there is real work to be done. At ${pct}%, the system has some good things going for it, but there are gaps holding your organization back. Your team is capable, but the system is not giving them what they need to perform at their best. A focused 90-day improvement program can raise this score by 15-25%.`;
  }
  return `${org}'s ${sysName} system scored ${pct}%. This is a serious problem that needs your immediate attention. A score below 40% means the fundamentals are broken. The system has deep structural problems affecting everything else. When scores are this low, organizations typically lose good people, waste money on inefficient processes, and fall behind competitors.`;
}

function getActions(pct, sysName, org) {
  if (pct >= 70) {
    return [
      { title: "Document What Is Working", desc: `Look at the highest-scoring areas of ${sysName}. Write down exactly what your team is doing right. Turn it into a standard procedure that anyone can follow. This protects your gains when key staff leave or change roles.` },
      { title: "Share Best Practices", desc: `Take the lessons from ${sysName} and apply them to lower-scoring systems. If it works here, it can work elsewhere. This is the fastest way to improve other systems using a method already proven in your own organization.` },
      { title: "Set Up Quarterly Reviews", desc: `Schedule quarterly check-ins on ${sysName} performance. Even strong systems can slip if nobody is watching. This catches any decline early before it becomes a problem.` },
    ];
  }
  if (pct >= 40) {
    return [
      { title: "Find the Root Causes", desc: `Get your leadership team together and honestly identify the 3-5 biggest problems in ${sysName}. Use the sub-assessment scores to guide the conversation. Stop fixing symptoms and start fixing the actual problems.` },
      { title: "Pick Your Quick Wins", desc: `From the list of problems, find 2-3 that can be fixed within 30 days with minimal cost. Do those first. This builds momentum and shows the team that change is happening. Expect visible progress within one month.` },
      { title: "Create a 90-Day Plan", desc: `For bigger issues, create a realistic 90-day plan with clear ownership. Assign specific people to specific problems. Check in weekly. Your ${sysName} score can improve by 15-25% within three months if the plan is followed through.` },
    ];
  }
  return [
    { title: "Treat This as an Emergency", desc: `Gather your leadership team this week. Present these scores. Make it clear that ${sysName} at ${pct}% is not acceptable and fixing it is now a top priority. Everyone must understand the urgency.` },
    { title: "Bring In Support", desc: `At ${pct}%, internal resources alone may not be enough. Consider engaging ConseQ-X or a similar firm to run a rapid diagnostic and help build a recovery plan based on what has worked for other Nigerian organizations.` },
    { title: "Fix the Worst Areas First", desc: `Look at the sub-assessment scores. Start with the lowest-scoring area because it is dragging everything else down. Assign a dedicated team to fix it within 60 days. This lifts the overall score and reduces damage to other business areas.` },
  ];
}

function getForecastText(pct, sysName, org) {
  if (pct >= 70) {
    return `${org}'s ${sysName} system is healthy. Keep doing what you are doing. Do regular check-ups—even healthy systems need monitoring. Use this system as a benchmark to show other teams what good looks like.`;
  }
  if (pct >= 40) {
    return `If nothing changes in the next 3-5 years: expect a 15-20% drop in operational efficiency. You will miss opportunities because your team is too busy fixing internal problems instead of innovating. What is a moderate issue today will become a serious problem if left unaddressed.`;
  }
  return `If nothing changes in the next 3-5 years: you will lose between 25% and 40% of your operational efficiency. Your best staff will leave because broken systems make their work harder than it needs to be. Your competitors who fix their systems will take your market share.`;
}
