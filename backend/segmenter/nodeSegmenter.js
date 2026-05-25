function segmentTextToNodes(text, pageNumber) {
  const nodes = [];
  if (!text || text.length < 5) return nodes;

  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  for (const line of lines) {

    if (/[=<>±√∑∫]/.test(line)) {
      nodes.push({ node_type: "formula", content: line, page_number: pageNumber });
      continue;
    }

    if (/\|/.test(line) || /\s{3,}/.test(line)) {
      nodes.push({ node_type: "table_row", content: line, page_number: pageNumber });
      continue;
    }

    if (line.length < 60 && line === line.toUpperCase()) {
      nodes.push({ node_type: "heading", content: line, page_number: pageNumber });
      continue;
    }

    nodes.push({ node_type: "paragraph", content: line, page_number: pageNumber });
  }

  return nodes;
}

module.exports = { segmentTextToNodes };
