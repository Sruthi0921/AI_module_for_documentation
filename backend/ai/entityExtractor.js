function extractEntities(node) {
  if (!node || !node.content) return [];

  const text = node.content;
  const out = [];

  const push = (type, value, confidence = 0.9) => {
    out.push({ type, value, confidence });
  };

  text.match(/\b\d{4}\s\d{4}\s\d{4}\b/g)?.forEach(v => push("aadhaar", v, 0.99));
  text.match(/\b[A-Z]{5}[0-9]{4}[A-Z]\b/g)?.forEach(v => push("pan", v, 0.99));
  text.match(/\b\d{10}\b/g)?.forEach(v => push("phone", v, 0.9));
  text.match(/\b[\w.-]+@[\w.-]+\.\w+\b/g)?.forEach(v => push("email", v, 0.95));

  if (node.node_type === "formula") {
    push("formula", text, 1.0);
  }

  return out;
}

module.exports = { extractEntities };
