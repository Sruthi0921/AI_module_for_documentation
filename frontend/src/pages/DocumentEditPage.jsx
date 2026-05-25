import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDocumentDetails, updateDocumentFields } from "../services/api";

export default function DocumentEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [fields, setFields] = useState([]);
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    getDocumentDetails(id).then(d => {
      setDoc(d);
      setFields(d.fields);
      setConfidence(d.confidence || 0);
    });
  }, [id]);

  if (!doc) return <p>Loading…</p>;

  const updateField = (i, value) => {
    const updated = [...fields];
    updated[i].value = value;
    setFields(updated);
  };

  async function save() {
    await updateDocumentFields({
      documentId: doc.id,
      documentType: doc.document_type,
      fields,
      confidence
    });

    alert("Saved!");
    navigate(-1);
  }

  return (
    <div style={{ padding: 30 }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>Edit: {doc.file_name}</h2>

      {fields.map((f, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <label>{f.name}</label>
          <input
            value={f.value}
            onChange={e => updateField(i, e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </div>
      ))}

      <div>
        <label>Accuracy:</label>
        <input
          type="number"
          step="0.01"
          value={confidence}
          onChange={e => setConfidence(+e.target.value)}
        />
      </div>

      <button onClick={save}>💾 Save</button>
    </div>
  );
}
