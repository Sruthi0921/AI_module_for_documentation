const axios = require("axios");

/**
 * Document-level understanding
 * GUARANTEED SAFE JSON
 */
async function understandDocument({ text, tables, formulas, entities }) {
  const prompt = `
You are an AI document analysis engine.

RULES (STRICT):
- Output ONLY valid JSON
- No explanations
- No markdown
- No text outside JSON

Return this exact schema:

{
  "category": string,
  "summary": string,
  "confidence": number
}

Document Content:
${text.slice(0, 8000)}

Tables:
${tables.slice(0, 20).join("\n")}

Formulas:
${formulas.slice(0, 20).join("\n")}

Entities:
${JSON.stringify(entities.slice(0, 50))}
`;

  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt,
    stream: false
  });

  const raw = res.data.response;

  // SAFE JSON EXTRACTION
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    // FAIL SAFE – NEVER CRASH
    return {
      category: "Unknown Document",
      summary: "AI could not confidently classify this document.",
      confidence: 0.3
    };
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return {
      category: "Unclassified Document",
      summary: "Parsing failed, document stored for review.",
      confidence: 0.3
    };
  }
}

module.exports = { understandDocument };
