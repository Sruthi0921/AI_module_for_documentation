import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDocumentDetails } from "../services/api";

export default function DocumentViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    getDocumentDetails(id).then(setDoc);
  }, [id]);

  if (!doc) return <p>Loading…</p>;

  return (
    <div style={{ padding: 30 }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>{doc.file_name}</h2>

      <p><strong>Type:</strong> {doc.document_type}</p>
      <p><strong>Status:</strong> {doc.extraction_status}</p>
      <p><strong>Accuracy:</strong> {Math.round(doc.confidence * 100)}%</p>
      <p><strong>Table:</strong> documents_{doc.document_type}</p>

      <h3>Extracted Fields</h3>
      <table className="dataTable">
        <thead>
          <tr><th>Field</th><th>Value</th></tr>
        </thead>
        <tbody>
          {doc.fields.map((f, i) => (
            <tr key={i}>
              <td>{f.name}</td>
              <td>{f.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Raw Text</h3>
      <pre style={{ background: "#f1f5f9", padding: 10 }}>
        {doc.raw_text}
      </pre>
    </div>
  );
}
