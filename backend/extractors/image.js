const Tesseract = require("tesseract.js");

module.exports = async function imageExtractor(file) {
  const res = await Tesseract.recognize(file.buffer, "eng");
  return { pages: [res.data.text || "[NO TEXT FOUND]"] };
};
