const express = require("express");
const { poolPromise, sql } = require("../db/sql");

const router = express.Router();

/**
 * POST /api/admin/train
 * Admin corrects AI output
 */
router.post("/train", async (req, res) => {
  try {
    const {
      rawDocumentId,
      correctedDocumentType,
      correctedFields,
      note
    } = req.body;

    if (!rawDocumentId || !correctedDocumentType) {
      return res.status(400).json({ error: "Missing training data" });
    }

    const pool = await poolPromise;

    // Fetch original document
    const doc = await pool.request()
      .input("id", sql.Int, rawDocumentId)
      .query(`
        SELECT document_type, raw_text
        FROM raw_documents
        WHERE id = @id
      `);

    if (doc.recordset.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    const originalType = doc.recordset[0].document_type;

    // Save feedback
    await pool.request()
      .input("raw_document_id", sql.Int, rawDocumentId)
      .input("original_document_type", sql.NVarChar, originalType)
      .input("corrected_document_type", sql.NVarChar, correctedDocumentType)
      .input("original_fields", sql.NVarChar(sql.MAX), null)
      .input("corrected_fields", sql.NVarChar(sql.MAX), JSON.stringify(correctedFields || {}))
      .input("feedback_note", sql.NVarChar, note || "")
      .query(`
        INSERT INTO ai_feedback
        (raw_document_id, original_document_type, corrected_document_type,
         original_fields, corrected_fields, feedback_note)
        VALUES
        (@raw_document_id, @original_document_type, @corrected_document_type,
         @original_fields, @corrected_fields, @feedback_note)
      `);

    // Update document type immediately
    await pool.request()
      .input("id", sql.Int, rawDocumentId)
      .input("document_type", sql.NVarChar, correctedDocumentType)
      .query(`
        UPDATE raw_documents
        SET document_type = @document_type
        WHERE id = @id
      `);

    res.json({ success: true, message: "AI trained successfully" });

  } catch (err) {
    console.error("TRAIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
