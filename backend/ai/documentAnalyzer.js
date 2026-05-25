function analyzeDocument(pages, nodes, entities) {
  const totalPages = pages.length;
  const textLength = pages.join(" ").length;

  const entityCount = entities.length;
  const hasId = entities.some(e =>
    ["aadhaar", "pan", "email", "phone"].includes(e.entity_type)
  );

  let category = "GENERIC";
  if (entities.some(e => e.entity_type === "aadhaar")) category = "AADHAAR";
  else if (entities.some(e => e.entity_type === "pan")) category = "PAN";
  else if (/resume/i.test(pages.join(" "))) category = "RESUME";
  else if (/certificate/i.test(pages.join(" "))) category = "CERTIFICATE";

  const confidence =
    Math.min(
      1,
      (textLength / 5000) * 0.4 +
      (entityCount / 10) * 0.4 +
      (hasId ? 0.2 : 0)
    );

  return {
    category,
    confidence: Number(confidence.toFixed(2)),
    coverage: textLength,
    entityCount
  };
}

module.exports = { analyzeDocument };
