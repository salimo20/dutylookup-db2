import fs from 'fs';
import XLSX from 'xlsx';

import { detectCttSheets } from '../parser/db2/sheetDetector.js';
import { extractSheetRows, findRosterRows, parseDz4RosterRow } from '../parser/db2/dutyExtractor.js';
import { buildWorkbookMap } from '../parser/db2/workbook/workbookMap.js';
import { detectWorkbookSections } from '../parser/db2/workbook/sectionDetector.js';
import { extractTimingPointsFromTimetable } from '../parser/db2/ctt/timingPointExtractor.js';
import { buildDriverTimeline } from '../parser/db2/ctt/eventBuilder.js';
import { findDutyTripPartsFromHeaders } from '../parser/db2/ctt/dutyTripMatcher.js';

const file = 'DB2-Z4-Routes E1-X1 Oct 2025.xlsx';

if (!fs.existsSync(file)) {
  throw new Error(`Missing file: ${file}`);
}

const workbook = XLSX.readFile(file);
const cttSheets = detectCttSheets(workbook.SheetNames);
const allDuties = [];

console.log('DutyLookup DB2 Importer v4');
console.log(`Workbook: ${file}`);

for (const sheet of cttSheets) {
  const rows = extractSheetRows(workbook, sheet.name);
  const workbookMap = buildWorkbookMap(rows);
  const sections = detectWorkbookSections(rows);

  const timetableRows =
    sections.timetable.end === null
      ? []
      : rows.slice(sections.timetable.start, sections.timetable.end + 1);

  const rosterRows = findRosterRows(rows);

  const duties = rosterRows.map((row) => {
    const duty = parseDz4RosterRow(row, sheet.dayType, sheet.name);
    const tripParts = findDutyTripPartsFromHeaders(timetableRows, duty);

    const timingPointsByPart = tripParts.map((part) => ({
      ...part,
      timingPoints: extractTimingPointsFromTimetable(timetableRows, [part.columnIndex])
    }));

    return {
      ...duty,
      trip_parts: tripParts,
      events: buildDriverTimeline(duty.events, timingPointsByPart, duty)
    };
  });

  allDuties.push(...duties);

  const matchedDuties = duties.filter((duty) => duty.trip_parts.length > 0).length;
  const twoPartMatched = duties.filter((duty) => duty.parts === 2 && duty.trip_parts.length === 2).length;

  console.log(`\n${sheet.name}`);
  console.log(`Day: ${sheet.dayType}`);
  console.log(`Roster start row: ${workbookMap.rosterStartRow}`);
  console.log(`Parsed duties: ${duties.length}`);
  console.log(`Duties with matched trip parts: ${matchedDuties}`);
  console.log(`Two-part duties fully matched: ${twoPartMatched}`);
}

const report = {
  total: allDuties.length,
  byDay: countBy(allDuties, 'day_type'),
  byShift: countBy(allDuties, 'shift_type'),
  byDutyType: countBy(allDuties, 'duty_type'),
  matchedTripParts: allDuties.filter((duty) => duty.trip_parts.length > 0).length,
  fullyMatchedTwoPartDuties: allDuties.filter((duty) => duty.parts === 2 && duty.trip_parts.length === 2).length
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