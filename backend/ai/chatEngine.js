const axios = require("axios");

async function askOllama({ mode, question, context }) {
  const prompt =
    mode === "DOCUMENT"
      ? `
You are a Document AI.
Answer ONLY from context.
If not found say "Not found in document".

Context:
${context}

Question:
${question}
`
      : `
You are a general AI assistant.
Answer clearly.

Question:
${question}
`;

  const res = await axios.post("http://localhost:11434/api/generate", {
    model: "llama3",
    prompt,
    stream: false
  });

  return res.data.response;
}

module.exports = { askOllama };
