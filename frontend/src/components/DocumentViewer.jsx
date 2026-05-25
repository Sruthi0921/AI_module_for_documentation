import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentDetails } from "../services/api";

export default function DocumentViewer() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    getDocumentDetails(id).then(setDoc);
  }, [id]);

  if (!doc) return <p>Loading document…</p>;

  // Group nodes by page
  const nodesByPage = {};
  doc.nodes.forEach(n => {
    if (!nodesByPage[n.page_number]) {
      nodesByPage[n.page_number] = [];
    }
    nodesByPage[n.page_number].push(n);
  });

  return (
    <div style={{ padding: 30 }}>
      <h2>{doc.file_name}</h2>

      <p><b>Type:</b> {doc.file_type}</p>
      <p><b>Status:</b> {doc.status}</p>
      <p><b>Total Pages:</b> {doc.pages.length}</p>

      <hr />

      {doc.pages.map(page => (
        <details key={page.page_number} open>
          <summary style={styles.pageHeader}>
            📄 Page {page.page_number}
          </summary>

          <div style={styles.pageBox}>
            {(nodesByPage[page.page_number] || []).map(node => (
              <NodeCard
                key={node.id}
                node={node}
                entities={doc.entities.filter(e => e.node_id === node.id)}
              />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function NodeCard({ node, entities }) {
  return (
    <div style={styles.nodeCard}>
      <div style={styles.nodeType}>{node.node_type}</div>

      <div style={styles.nodeContent}>
        {highlightEntities(node.content, entities)}
      </div>
    </div>
  );
}

function highlightEntities(text, entities) {
  let result = text;
  entities.forEach(e => {
    result = result.replace(
      e.entity_value,
      `<mark>${e.entity_value}</mark>`
    );
  });
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

const styles = {
  pageHeader: {
    fontWeight: "bold",
    marginBottom: 10,
    cursor: "pointer"
  },
  pageBox: {
    padding: 15,
    background: "#f8fafc",
    border: "1px solid #ddd"
  },
  nodeCard: {
    padding: 10,
    marginBottom: 10,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 6
  },
  nodeType: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 6
  },
  nodeContent: {
    fontSize: 14,
    lineHeight: 1.6
  }
};
