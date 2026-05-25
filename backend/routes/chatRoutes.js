const express = require("express");
const { poolPromise, sql } = require("../db/sql");
const { askOllama } = require("../ai/chatEngine");
const { rankByEmbedding } = require("../utils/semanticSearch");
const { embedNode } = require("../ai/nodeEmbedder");

const router = express.Router();

/**
 * POST /api/chat/ask
 */
router.post("/ask", async (req, res) => {
  try {
    const {
      question,
      userId = "guest",
      documentId = null,
      role = "USER" // USER | ADMIN
    } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ error: "Question required" });
    }

    const pool = await poolPromise;
    const queryEmbedding = await embedNode(question);


    let context = "";
    let usedDocument = false;

    /* ---- RAG SEARCH ---- */
    if (documentId || role === "ADMIN") {
      let query = `
        SELECT id, content, embedding, page_number, document_id
        FROM document_nodes
        WHERE embedding IS NOT NULL
      `;

      if (documentId) query += " AND document_id = @documentId";

      const result = await pool.request()
        .input("documentId", sql.Int, documentId)
        .query(query);

      if (result.recordset.length) {
        const ranked = rankByEmbedding(
          questionEmbedding,
          result.recordset,
          5
        );

        if (ranked.length) {
          usedDocument = true;
          context = ranked
            .map(n => `Page ${n.page_number}: ${n.content}`)
            .join("\n---\n");
        }
      }
    }

    /* ---- LLM ---- */
    const answer = await askOllama({
      mode: usedDocument ? "DOCUMENT" : "GENERAL",
      question,
      context
    });

     /* ---------- STORE CHAT (THIS WAS MISSING / BROKEN) ---------- */
    await pool.request()
      .input("user_id", sql.NVarChar, userId)
      .input("question", sql.NVarChar(sql.MAX), question)
      .input("answer", sql.NVarChar(sql.MAX), answer)
      .input("document_id", sql.Int, usedDocument ? documentId : null)
      .input("mode", sql.NVarChar, usedDocument ? "DOCUMENT" : "GENERAL")
      .query(`
        INSERT INTO chat_history
        (user_id, question, answer, document_id, mode)
        VALUES
        (@user_id, @question, @answer, @document_id, @mode)
      `);

    res.json({
      success: true,
      answer,
      mode: usedDocument ? "DOCUMENT" : "GENERAL"
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
