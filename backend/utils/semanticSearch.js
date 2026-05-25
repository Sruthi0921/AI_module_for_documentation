function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return 0;
  if (a.length !== b.length) return 0;

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (magA === 0 || magB === 0) return 0;

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function normalizeEmbedding(e) {
  if (!e) return null;

  // Stored as NVARCHAR JSON
  if (typeof e === "string") {
    try {
      return JSON.parse(e);
    } catch {
      return null;
    }
  }

  // Already array
  if (Array.isArray(e)) return e;

  return null;
}

function rankByEmbedding(queryEmbedding, nodes, limit = 6) {
  const q = normalizeEmbedding(queryEmbedding);
  if (!q) return [];

  return nodes
    .map(n => {
      const emb = normalizeEmbedding(n.embedding);
      if (!emb) return null;

      const score = cosineSimilarity(q, emb);
      if (!isFinite(score)) return null;

      return { ...n, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { rankByEmbedding };
