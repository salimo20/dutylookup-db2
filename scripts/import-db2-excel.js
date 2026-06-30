import fs from 'fs';
import XLSX from 'xlsx';
import { detectCttSheets } from '../parser/db2/sheetDetector.js';
import { extractSheetRows, findRosterRows, parseDz4RosterRow } from '../parser/db2/dutyExtractor.js';

const file = 'DB2-Z4-Routes E1-X1 Oct 2025.xlsx';

if (!fs.existsSync(file)) {
  throw new Error(`Missing file: ${file}`);
}

const workbook = XLSX.readFile(file);
const cttSheets = detectCttSheets(workbook.SheetNames);

const allDuties = [];

console.log('DutyLookup DB2 Importer');
console.log(`Workbook: ${file}`);

for (const sheet of cttSheets) {
  const rows = extractSheetRows(workbook, sheet.name);
  const rosterRows = findRosterRows(rows);
  const duties = rosterRows.map((row) => parseDz4RosterRow(row, sheet.dayType));

  allDuties.push(...duties);

  console.log(`\n${sheet.name}`);
  console.log(`Day: ${sheet.dayType}`);
  console.log(`Parsed duties: ${duties.length}`);
}

const report = {
  total: allDuties.length,
  byDay: countBy(allDuties, 'day_type'),
  byShift: countBy(allDuties, 'shift_type'),
  byDutyType: countBy(allDuties, 'duty_type')
};

fs.writeFileSync('output/duties-db2-dz4.json', JSON.stringify(allDuties, null, 2));
fs.writeFileSync('output/import-report-db2-dz4.json', JSON.stringify(report, null, 2));

console.log('\nImport complete');
console.log(report);
console.log('\nCreated: output/duties-db2-dz4.json');
console.log('Created: output/import-report-db2-dz4.json');

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'UNKNOWN';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}