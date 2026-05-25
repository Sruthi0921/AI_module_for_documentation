import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentDetails, updateDocumentNode } from "../services/api";

export default function DocumentEditor() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    getDocumentDetails(id).then(setDoc);
  }, [id]);

  if (!doc) return <p>Loading…</p>;

  async function saveNode(nodeId, content) {
    await updateDocumentNode({ nodeId, content });
    alert("Node updated");
  }

  return (
    <div style={{ padding: 30 }}>
      <h2>Edit Document: {doc.file_name}</h2>

      {doc.nodes.map(node => (
        <div key={node.id} style={styles.nodeEdit}>
          <b>{node.node_type} (Page {node.page_number})</b>

          <textarea
            defaultValue={node.content}
            rows={4}
            style={styles.textarea}
            onBlur={e => saveNode(node.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

const styles = {
  nodeEdit: {
    marginBottom: 20,
    background: "#fff",
    padding: 15,
    border: "1px solid #ddd"
  },
  textarea: {
    width: "100%",
    marginTop: 8
  }
};
