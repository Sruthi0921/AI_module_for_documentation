const pdf = require("./pdf");
const word = require("./word");
const excel = require("./excel");
const image = require("./image");

module.exports = async function extractText(file) {
  const type = file.mimetype;

  if (type === "application/pdf") return pdf(file);
  if (type.includes("word")) return word(file);
  if (type.includes("excel") || type.includes("spreadsheet")) return excel(file);
  if (type.startsWith("image/")) return image(file);

  throw new Error("Unsupported file type");
};
