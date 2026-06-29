import fs from 'fs';
import XLSX from 'xlsx';
import { detectCttSheets } from '../parser/db2/sheetDetector.js';

const inputFiles = [
  'DB2-Z4-Routes E1-X1 Oct 2025.xlsx',
  'DZ5 Final .xlsx',
  'L25 New MH 24.xlsx'
];

console.log('DutyLookup DB2 Importer');
console.log('Reading source files...');

for (const file of inputFiles) {
  if (!fs.existsSync(file)) {
    console.log(`MISSING: ${file}`);
    continue;
  }

  const workbook = XLSX.readFile(file);
  const cttSheets = detectCttSheets(workbook.SheetNames);

  console.log(`\nFOUND: ${file}`);
  console.log('Driver CTT sheets only:');

  cttSheets.forEach((sheet) => {
    console.log(`  ${sheet.dayType}: ${sheet.name}`);
  });
}