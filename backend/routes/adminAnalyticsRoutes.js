const express = require("express");
const { poolPromise, sql } = require("../db/sql");

const router = express.Router();

/**
 * GET /api/admin/analytics/summary
 * High-level dashboard stats
 */
router.get("/analytics/summary", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM documents) AS total_documents,
        (SELECT COUNT(*) FROM documents WHERE CAST(uploaded_at AS DATE) = CAST(GETDATE() AS DATE)) AS documents_today,
        (SELECT COUNT(*) FROM documents WHERE uploaded_at >= DATEADD(DAY, -7, GETDATE())) AS documents_last_7_days,
        (SELECT COUNT(*) FROM documents WHERE status != 'UPLOADED') AS processed_documents,
        (SELECT COUNT(*) FROM documents WHERE status = 'FAILED') AS failed_documents,
        (SELECT COUNT(*) FROM document_nodes) AS total_nodes,
        (SELECT COUNT(*) FROM document_nodes WHERE embedding IS NULL) AS nodes_without_embedding,
        (SELECT COUNT(*) FROM chat_history) AS total_chats
    `);

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("ADMIN SUMMARY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/analytics/documents-by-type
 */
router.get("/analytics/documents-by-type", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        file_type,
        COUNT(*) AS count
      FROM documents
      GROUP BY file_type
      ORDER BY count DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("DOC TYPE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/analytics/node-types
 */
router.get("/analytics/node-types", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        node_type,
        COUNT(*) AS count
      FROM document_nodes
      GROUP BY node_type
      ORDER BY count DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("NODE TYPE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/analytics/nodes-per-document
 */
router.get("/analytics/nodes-per-document", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        d.id AS document_id,
        d.file_name,
        COUNT(n.id) AS node_count
      FROM documents d
      LEFT JOIN document_nodes n ON d.id = n.document_id
      GROUP BY d.id, d.file_name
      ORDER BY node_count DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("NODE PER DOC ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/analytics/chat-stats
 */
router.get("/analytics/chat-stats", async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        role,
        COUNT(*) AS chat_count
      FROM chat_history
      GROUP BY role
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("CHAT STATS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
