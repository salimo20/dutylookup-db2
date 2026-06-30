import fs from 'fs';
import XLSX from 'xlsx';
import { detectCttSheets } from '../parser/db2/sheetDetector.js';
import { extractSheetRows, findRosterRows, parseDz4RosterRow } from '../parser/db2/dutyExtractor.js';

const file = 'DB2-Z4-Routes E1-X1 Oct 2025.xlsx';
const testRoster = 'DZ4/23';

if (!fs.existsSync(file)) {
  throw new Error(`Missing file: ${file}`);
}

const workbook = XLSX.readFile(file);
const cttSheets = detectCttSheets(workbook.SheetNames);

console.log('DutyLookup DB2 Parser Test');
console.log(`Workbook: ${file}`);
console.log(`Searching for: ${testRoster}`);

for (const sheet of cttSheets) {
  const rows = extractSheetRows(workbook, sheet.name);
  const rosterRows = findRosterRows(rows);
  const duties = rosterRows.map((row) => parseDz4RosterRow(row, sheet.dayType));

  console.log(`\nSheet: ${sheet.name} (${sheet.dayType})`);
  console.log(`Parsed duties: ${duties.length}`);
  console.log(JSON.stringify(duties.slice(0, 3), null, 2));
}