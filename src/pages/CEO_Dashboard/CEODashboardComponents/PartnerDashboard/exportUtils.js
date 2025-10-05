// Lightweight client-side export helpers (stubs for now)
export function exportToCSV(filename = 'export.csv', rows = []) {
  try {
    if (!rows || !rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  } catch (e) { console.warn('exportToCSV failed', e); }
}

export async function exportToPDF(node, filename = 'export.pdf') {
  // placeholder: requires html2canvas/jsPDF in real build; we'll attempt a minimal fallback
  try {
    const html = node ? node.innerText || node.textContent : 'Report';
    const blob = new Blob([html], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  } catch (e) { console.warn('exportToPDF failed', e); }
}

export function shareToSlack(webhookUrl, payload) {
  // stub: cannot perform cross-origin without server; dispatch event for dev
  window.dispatchEvent(new CustomEvent('conseqx:share:slack', { detail: { webhookUrl, payload } }));
}

export function shareToEmail(to, subject, body) {
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}
