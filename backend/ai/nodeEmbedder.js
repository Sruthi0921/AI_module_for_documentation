const axios = require("axios");

const OLLAMA_URL = "http://localhost:11434/api/embeddings";
const MODEL = "nomic-embed-text";

/**
 * Generate embedding safely
 */
async function embedNode(text) {
  if (!text || text.length < 20) return null;

  // HARD LIMIT — Ollama fails on long input
  const safeText = text.slice(0, 1500);

  try {
    const res = await axios.post(
      OLLAMA_URL,
      {
        model: MODEL,
        prompt: safeText
      },
      { timeout: 30000 }
    );

    if (!res.data || !Array.isArray(res.data.embedding)) {
      return null;
    }

    return res.data.embedding;

  } catch (err) {
    console.error("EMBED ERROR:", err.message);
    return null;
  }
}

module.exports = { embedNode };
