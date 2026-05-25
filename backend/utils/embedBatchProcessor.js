const { embedNode } = require("../ai/nodeEmbedder");
const { storeNode } = require("./nodeStore");

/**
 * Process nodes in small batches to avoid Ollama overload
 */
async function processEmbedBatch(batch, documentId) {
  for (const { node, entities } of batch) {

    let embedding = null;

    // Skip tiny / useless text
    if (node.content && node.content.length > 20) {
      try {
        const safeText = node.content.slice(0, 1500);
        embedding = await embedNode(safeText);
      } catch (err) {
        console.error("Embedding failed:", err.message);
      }
    }

    // ALWAYS store node (embedding can be null)
    try {
      await storeNode(documentId, node, entities, embedding);
    } catch (dbErr) {
      console.error("DB insert failed:", dbErr.message);
    }
  }
}

module.exports = { processEmbedBatch };
