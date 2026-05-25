const XLSX = require("xlsx");

module.exports = async function excelExtractor(file) {
  const wb = XLSX.read(file.buffer, { type: "buffer" });
  const pages = [];

  wb.SheetNames.forEach(name => {
    const sheet = XLSX.utils.sheet_to_csv(wb.Sheets[name]);
    pages.push(`SHEET: ${name}\n${sheet}`);
  });

  return { pages };
};
