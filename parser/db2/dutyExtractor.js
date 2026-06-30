import XLSX from 'xlsx';
import { classifyShift, getDutyParts } from './shiftClassifier.js';

export function extractSheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: false,
    defval: ''
  });
}

export function findRosterRows(rows) {
  return rows.filter((row) =>
    /^DZ4\/\d{1,2}X?$/.test(String(row[0] || '').toUpperCase().trim())
  );
}

export function parseDz4RosterRow(row, dayType) {
  const isWeekday = dayType === 'weekday';

  const dutyIndex = isWeekday ? 3 : 2;
  const signOnIndex = isWeekday ? 4 : 3;
  const startTimeIndex = isWeekday ? 5 : 4;
  const startLocationIndex = isWeekday ? 6 : 5;
  const breakTimeIndex = isWeekday ? 7 : 6;
  const breakLocationIndex = isWeekday ? 8 : 7;
  const resumeTimeIndex = isWeekday ? 9 : 8;
  const resumeLocationIndex = isWeekday ? 11 : 10;
  const finishTimeIndex = isWeekday ? 14 : 13;
  const finishLocationIndex = isWeekday ? 13 : 12;
  const paidTimeIndex = isWeekday ? 15 : 14;
  const workTimeIndex = isWeekday ? 16 : 15;
  const breakDurationIndex = isWeekday ? 17 : 16;

  const dutyNumber = String(Number(row[dutyIndex]));

  const shiftType = classifyShift({
    rosterNumber: row[0],
    startTime: row[startTimeIndex],
    breakTime: row[breakTimeIndex],
    resumeTime: row[resumeTimeIndex]
  });

  const parts = getDutyParts({
    breakTime: row[breakTimeIndex],
    resumeTime: row[resumeTimeIndex]
  });

  const events = [
    {
      event_type: 'START',
      event_time: row[startTimeIndex],
      location: normalizeLocation(row[startLocationIndex])
    }
  ];

  if (parts === 2) {
    events.push(
      {
        event_type: 'BREAK_START',
        event_time: row[breakTimeIndex],
        location: normalizeLocation(row[breakLocationIndex]),
        notes: ''
      },
      {
        event_type: 'RESUME',
        event_time: row[resumeTimeIndex],
        location: normalizeLocation(row[resumeLocationIndex]),
        notes: ''
      }
    );
  }

  events.push({
    event_type: 'FINISH',
    event_time: row[finishTimeIndex],
    location: normalizeLocation(row[finishLocationIndex]),
    notes: ''
  });

  return {
    garage: 'DB2',
    zone: 'DZ4',
    roster_number: row[0],
    route: 'E1',
    day_type: dayType,
    shift_type: shiftType,
    duty_type: shiftType === 'WORKOUT' ? 'WORKOUT' : 'NORMAL',
    parts,
    duty_number: dutyNumber,
    display_duty_number: dutyNumber,
    ticket_machine_number: dutyNumber,
    sign_on_time: row[signOnIndex],
    start_time: row[startTimeIndex],
    start_location: normalizeLocation(row[startLocationIndex]),
    break_time: row[breakTimeIndex],
    break_location: normalizeLocation(row[breakLocationIndex]),
    resume_time: row[resumeTimeIndex],
    resume_location: normalizeLocation(row[resumeLocationIndex]),
    finish_time: row[finishTimeIndex],
    finish_location: normalizeLocation(row[finishLocationIndex]),
    paid_time: row[paidTimeIndex],
    work_time: row[workTimeIndex],
    break_duration: row[breakDurationIndex],
    events
  };
}

function normalizeLocation(value) {
  const text = String(value || '').trim();

  if (text.toLowerCase() === 'garage') return 'Donnybrook Garage';
  if (text.toLowerCase().includes('dbrk')) return 'Donnybrook Church';
  if (text.toLowerCase().includes('eglinton')) return 'Eglinton Road';

  return text;
}