const XLSX = require('xlsx');

const workbook = XLSX.readFile('MrandMrsFeiPaintingsForWebsite.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

console.log('Total rows:', data.length);
console.log('\nFirst row structure:');
console.log(JSON.stringify(data[0], null, 2));
console.log('\nColumn headers:');
console.log(Object.keys(data[0]));
