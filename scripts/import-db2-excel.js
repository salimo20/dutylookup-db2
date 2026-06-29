import fs from 'fs';
import XLSX from 'xlsx';

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
  console.log(`\nFOUND: ${file}`);
  console.log('Sheets:');
  workbook.SheetNames.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`);
  });
}