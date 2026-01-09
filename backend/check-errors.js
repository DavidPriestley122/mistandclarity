const XLSX = require('xlsx');

const workbook = XLSX.readFile('MrandMrsFeiPaintingsForWebsite.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

console.log('Checking problem rows...\n');

const problemIndexes = [593, 26, 35, 39];

for (const idx of problemIndexes) {
  const row = data.find(r => r.Index === idx);
  if (row) {
    console.log(`=== Row ${idx} ===`);
    console.log('Dimensions_H:', row.Dimensions_H, typeof row.Dimensions_H);
    console.log('Dimensions_W:', row.Dimensions_W, typeof row.Dimensions_W);
    console.log('Date:', row['Date (cyclical\r\n if given)'], typeof row['Date (cyclical\r\n if given)']);
    console.log('Artist:', row.Artist);
    console.log('Descriptive Title:', row['Descriptive\r\nTitle']);
    console.log('');
  } else {
    console.log(`Row ${idx} not found\n`);
  }
}
