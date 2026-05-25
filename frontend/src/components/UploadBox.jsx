import { useState } from "react";
import { uploadDocument } from "../services/api";

export default function UploadBox({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return alert("Please select a file");

    try {
      setLoading(true);
      await uploadDocument(file);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
      alert("Uploaded successfully");
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3>Upload Document</h3>

      <div style={styles.drop}>
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          disabled={loading}
        />
        <p>PDF, Word, Excel, Image supported</p>
      </div>

      <button style={styles.btn} onClick={upload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginBottom: 20
  },
  drop: {
    border: "2px dashed #c7d2fe",
    padding: 20,
    borderRadius: 10,
    textAlign: "center"
  },
 
  btn: {
    marginTop: 15,
    padding: "10px 400px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    width: "100%",
    cursor: "pointer"
  }
};
