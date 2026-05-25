const { poolPromise, sql } = require("../db/sql");

async function storeNode(documentId, node, entities, embedding) {
  const pool = await poolPromise;

  const nodeResult = await pool.request()
    .input("document_id", sql.Int, documentId)
    .input("page_number", sql.Int, node.page_number)
    .input("node_type", sql.NVarChar, node.node_type)
    .input("content", sql.NVarChar(sql.MAX), node.content)
    .input("embedding", sql.NVarChar(sql.MAX), embedding ? JSON.stringify(embedding) : null)
    .input("confidence", sql.Float, 0.8)
    .query(`
      INSERT INTO document_nodes
      (document_id, page_number, node_type, content, embedding, confidence)
      OUTPUT INSERTED.id
      VALUES
      (@document_id, @page_number, @node_type, @content, @embedding, @confidence)
    `);

  const nodeId = nodeResult.recordset[0].id;

for (const e of entities) {
  await pool.request()
    .input("node_id", sql.Int, nodeId)
    .input("entity_type", sql.NVarChar, e.type)
    .input("entity_value", sql.NVarChar(sql.MAX), e.value)
    .input("confidence", sql.Float, e.confidence)
    .query(`
      INSERT INTO document_entities
      (node_id, entity_type, entity_value, confidence)
      VALUES
      (@node_id, @entity_type, @entity_value, @confidence)
    `);
}


  return nodeId;
}

module.exports = { storeNode };
