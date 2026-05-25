const BASE = "http://localhost:5000/api";

/* DOCUMENT APIs*/

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE}/documents/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function getAllDocuments() {
  const res = await fetch(`${BASE}/documents/all`);
  if (!res.ok) throw new Error("Failed to load documents");
  return res.json();
}

export async function getDocumentDetails(id) {
  const res = await fetch(`${BASE}/documents/${id}`);
  if (!res.ok) throw new Error("Failed to load document");
  return res.json();
}

export async function updateDocumentFields(payload) {
  const res = await fetch(`${BASE}/documents/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function updateDocumentNode(payload) {
  const res = await fetch("http://localhost:5000/api/documents/update-node", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

/*  CHAT API */

export async function askChat(payload) {
  const res = await fetch("http://localhost:5000/api/chat/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

