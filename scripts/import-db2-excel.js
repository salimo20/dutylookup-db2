import fs from 'fs';

const inputFiles = [
  'DB2-Z4-Routes E1-X1 Oct 2025.xlsx',
  'DZ5 Final .xlsx',
  'L25 New MH 24.xlsx'
];

console.log('DutyLookup DB2 Importer');
console.log('Checking source files...');

for (const file of inputFiles) {
  const exists = fs.existsSync(file);
  console.log(`${exists ? 'FOUND' : 'MISSING'}: ${file}`);
}

console.log('Next step: parse workbook sheets and build duty cards.');