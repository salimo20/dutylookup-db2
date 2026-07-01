import fs from 'fs';
import XLSX from 'xlsx';
import { detectCttSheets } from '../parser/db2/sheetDetector.js';
import { extractSheetRows, findRosterRows, parseDz4RosterRow } from '../parser/db2/dutyExtractor.js';
import { buildWorkbookMap } from '../parser/db2/workbook/workbookMap.js';

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
  const workbookMap = buildWorkbookMap(rows);
  const rosterRows = findRosterRows(rows);
  const duties = rosterRows.map((row) => parseDz4RosterRow(row, sheet.dayType, sheet.name));

  allDuties.push(...duties);

  console.log(`\n${sheet.name}`);
  console.log(`Day: ${sheet.dayType}`);
  console.log(`Roster start row: ${workbookMap.rosterStartRow}`);
  console.log(`Location rows found: ${workbookMap.locationRows.length}`);
  console.log(`Parsed duties: ${duties.length}`);
}

const report = {
  total: allDuties.length,
  byDay: countBy(allDuties, 'day_type'),
  byShift: countBy(allDuties, 'shift_type'),
  byDutyType: countBy(allDuties, 'duty_type')
};

const packageData = {
  version: 'DB2-DZ4-OCT-2025',
  garage: 'DB2',
  zone: 'DZ4',
  sourceFile: file,
  generatedAt: new Date().toISOString(),
  duties: allDuties
};

fs.writeFileSync('output/duties-db2-dz4.json', JSON.stringify(packageData, null, 2));
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