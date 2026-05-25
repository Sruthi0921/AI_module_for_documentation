const express = require("express");
const multer = require("multer");

const extractText = require("../extractors");
const { segmentTextToNodes } = require("../segmenter/nodeSegmenter");
const { embedNode } = require("../ai/nodeEmbedder");
const { extractEntities } = require("../ai/entityExtractor");
const { storeNode } = require("../utils/nodeStore");
const { processEmbedBatch } = require("../utils/embedBatchProcessor");
const {chunkText} = require("../utils/chunkText");
const { understandDocument } = require("../ai/documentUnderstanding");
const { aggregateEntities } = require("../ai/entityAggregator");

const { poolPromise, sql } = require("../db/sql");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/* GET ALL DOCUMENTS (ADMIN)*/
router.get("/all", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        id,
        file_name,
        file_type,
        page_count,
        document_category,
        confidence,
        status,
        uploaded_at
      FROM documents
      ORDER BY uploaded_at DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*  GET DOCUMENT DETAILS */
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const id = parseInt(req.params.id, 10);

    const doc = await pool.request()
      .input("id", sql.Int, id)
      .query(`SELECT * FROM documents WHERE id=@id`);

    if (!doc.recordset.length) {
      return res.status(404).json({ error: "Document not found" });
    }

    const pages = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT page_number, raw_text
        FROM document_pages
        WHERE document_id=@id
        ORDER BY page_number
      `);

    const nodes = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT *
        FROM document_nodes
        WHERE document_id=@id
        ORDER BY page_number, id
      `);

    const entities = await pool.request()
      .input("id", sql.Int, id)
      .query(`
        SELECT e.*
        FROM document_entities e
        JOIN document_nodes n ON e.node_id = n.id
        WHERE n.document_id=@id
      `);

    res.json({
      ...doc.recordset[0],
      pages: pages.recordset,
      nodes: nodes.recordset,
      entities: entities.recordset
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*  UPDATE NODE (EDIT MODE) */
router.post("/update-node", async (req, res) => {
  const { nodeId, content } = req.body;
  const pool = await poolPromise;

  await pool.request()
    .input("id", sql.Int, nodeId)
    .input("content", sql.NVarChar(sql.MAX), content)
    .query(`
      UPDATE document_nodes
      SET content = @content
      WHERE id = @id
    `);

  res.json({ success: true });
});

/* UPLOAD DOCUMENT (CORE)*/
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extracted = await extractText(req.file);

    if (!extracted || !extracted.pages || extracted.pages.length === 0) {
      extracted = { pages: ["[NO TEXT CONTENT FOUND]"] };
    }

    const pages = extracted.pages;
    const pool = await poolPromise;

    /* INSERT DOCUMENT */
    const docInsert = await pool.request()
      .input("file_name", sql.NVarChar, req.file.originalname)
      .input("file_type", sql.NVarChar, req.file.mimetype)
      .input("page_count", sql.Int, pages.length)
      .input("status", sql.NVarChar, "PROCESSING")
      .query(`
        INSERT INTO documents (file_name, file_type, page_count, status)
        OUTPUT INSERTED.id
        VALUES (@file_name, @file_type, @page_count, @status)
      `);

    const documentId = docInsert.recordset[0].id;

    /* RESPOND IMMEDIATELY */
    res.json({
      success: true,
      documentId,
      message: "Upload accepted. Processing started."
    });

    /*  BACKGROUND PROCESSING */
    setImmediate(async () => {
  try {
    let fullText = "";
    let allEntities = [];
    let tables = [];
    let formulas = [];

    for (let i = 0; i < pages.length; i++) {
      const pageText = pages[i];
      fullText += pageText + "\n";

      await pool.request()
        .input("document_id", sql.Int, documentId)
        .input("page_number", sql.Int, i + 1)
        .input("raw_text", sql.NVarChar(sql.MAX), pageText)
        .query(`
          INSERT INTO document_pages (document_id, page_number, raw_text)
          VALUES (@document_id, @page_number, @raw_text)
        `);

      const nodes = segmentTextToNodes(pageText, i + 1);

    const EMBED_BATCH_SIZE = 5;
const embedQueue = [];

const chunks = chunkText(pageText);

for (const chunk of chunks) {
  const nodes = segmentTextToNodes(chunk, i + 1);

  for (const node of nodes) {

    if (node.node_type === "table_row") tables.push(node.content);
    if (node.node_type === "formula") formulas.push(node.content);

    const entities = extractEntities(node);
    allEntities.push(...entities);

    embedQueue.push({ node, entities });

    if (embedQueue.length >= EMBED_BATCH_SIZE) {
      await processEmbedBatch(embedQueue, documentId);
      embedQueue.length = 0;
    }
  }
}


// process remaining
if (embedQueue.length > 0) {
  await processEmbedBatch(embedQueue, documentId);
}

      // PROGRESS TRACKING (VERY IMPORTANT)
      await pool.request()
  .input("id", sql.Int, documentId)
  .input("processed", sql.Int, i + 1)
  .query(`
    UPDATE documents
    SET processed_pages = @processed
    WHERE id = @id
  `);
    }

    const understanding = await understandDocument({
      text: fullText,
      tables,
      formulas,
      entities: allEntities
    });

    await pool.request()
      .input("id", sql.Int, documentId)
      .input("category", sql.NVarChar, understanding.category)
      .input("summary", sql.NVarChar(sql.MAX), understanding.summary)
      .input("confidence", sql.Float, understanding.confidence)
      .input("understanding", sql.NVarChar(sql.MAX), JSON.stringify(understanding))
      .query(`
        UPDATE documents SET
          status='READY',
          document_category=@category,
          document_summary=@summary,
          understanding_json=@understanding,
          confidence=@confidence
        WHERE id=@id
      `);

    console.log("DOCUMENT READY:", documentId);

  } catch (err) {
    console.error("BACKGROUND ERROR:", err.message);

    await pool.request()
      .input("id", sql.Int, documentId)
      .query(`UPDATE documents SET status='FAILED' WHERE id=@id`);
  }
});


  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
