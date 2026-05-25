const mammoth = require("mammoth");

module.exports = async function wordExtractor(file) {
  const result = await mammoth.extractRawText({ buffer: file.buffer });

  const pages = result.value
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  return { pages };
};
