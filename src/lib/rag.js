// TF-IDF retrieval with localStorage persistence for uploaded documents

const STORAGE_KEY = "conseqx_rag_docs";

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildIndex(docs = []) {
  // docs: array of { id, text, meta }
  const N = docs.length;
  const termDocCount = Object.create(null);
  const docTerms = docs.map((d) => {
    const toks = tokenize(d.text);
    const tf = Object.create(null);
    toks.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
    Object.keys(tf).forEach((t) => { termDocCount[t] = (termDocCount[t] || 0) + 1; });
    return tf;
  });

  const idf = Object.create(null);
  Object.keys(termDocCount).forEach((t) => { idf[t] = Math.log(1 + N / termDocCount[t]); });

  // compute tf-idf vectors (sparse) and norms
  const docVectors = docTerms.map((tf) => {
    const vec = Object.create(null);
    let norm = 0;
    Object.entries(tf).forEach(([t, f]) => {
      const score = f * (idf[t] || 0);
      vec[t] = score;
      norm += score * score;
    });
    norm = Math.sqrt(norm) || 1;
    return { vec, norm };
  });

  return { docs, idf, docVectors };
}

function scoreQuery(index, query) {
  const qTokens = tokenize(query);
  const qtf = Object.create(null);
  qTokens.forEach((t) => { qtf[t] = (qtf[t] || 0) + 1; });

  const qvec = Object.create(null);
  let qnorm = 0;
  Object.entries(qtf).forEach(([t, f]) => {
    const val = f * (index.idf[t] || 0);
    qvec[t] = val;
    qnorm += val * val;
  });
  qnorm = Math.sqrt(qnorm) || 1;

  const scores = index.docVectors.map(({ vec, norm }, i) => {
    // dot product
    let dot = 0;
    Object.entries(qvec).forEach(([t, v]) => { if (vec[t]) dot += v * vec[t]; });
    const sim = dot / (norm * qnorm);
    return { i, sim };
  });
  return scores.sort((a, b) => b.sim - a.sim);
}

function queryIndex(index, query, topK = 5) {
  if (!index || !index.docs || index.docs.length === 0) return [];
  const scored = scoreQuery(index, query).filter(s => s.sim > 0);
  return scored.slice(0, topK).map(s => ({ score: s.sim, doc: index.docs[s.i] }));
}

// ─── Document chunking ───
function chunkText(text, chunkSize = 500, overlap = 100) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

function parseFileToChunks(fileName, content) {
  const chunks = chunkText(content);
  return chunks.map((text, i) => ({
    id: `${fileName}-chunk-${i}`,
    text,
    meta: { source: fileName, chunk: i, totalChunks: chunks.length, uploadedAt: new Date().toISOString() }
  }));
}

// ─── localStorage persistence for uploaded document chunks ───
function loadStoredDocs(orgId) {
  try {
    const key = orgId ? `${STORAGE_KEY}_${orgId}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveDocChunks(orgId, docChunks) {
  try {
    const key = orgId ? `${STORAGE_KEY}_${orgId}` : STORAGE_KEY;
    const existing = loadStoredDocs(orgId);
    const combined = [...existing, ...docChunks];
    // Limit to 500 chunks to avoid localStorage quota (~2.5MB)
    const trimmed = combined.slice(-500);
    localStorage.setItem(key, JSON.stringify(trimmed));
    return trimmed;
  } catch { return []; }
}

function clearStoredDocs(orgId) {
  const key = orgId ? `${STORAGE_KEY}_${orgId}` : STORAGE_KEY;
  localStorage.removeItem(key);
}

export { buildIndex, queryIndex, chunkText, parseFileToChunks, loadStoredDocs, saveDocChunks, clearStoredDocs };
