const pdfParse = require("pdf-parse");

module.exports = async function pdfExtractor(file) {
  const data = await pdfParse(file.buffer, { pagerender: renderPage });

  return { pages: data.text.split("\n\nPAGE_BREAK\n\n") };
};

function renderPage(pageData) {
  return pageData.getTextContent().then(tc => {
    let text = tc.items.map(i => i.str).join(" ");
    return text + "\n\nPAGE_BREAK\n\n";
  });
}
