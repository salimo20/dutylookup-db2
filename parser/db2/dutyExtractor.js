import XLSX from 'xlsx';
import { classifyShift, getDutyParts } from './shiftClassifier.js';
import { resolveDz4Route } from './routeResolver.js';

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

const DZ4_LAYOUTS = {
  weekday: {
    duty: 3,
    signOn: 4,
    startTime: 5,
    startLocation: 6,
    breakTime: 7,
    breakLocation: 8,
    resumeTime: 9,
    resumeLocation: 11,
    finishLocation: 13,
    finishTime: 14,
    paidTime: 15,
    workTime: 16,
    breakDuration: 17
  },
  weekend: {
    duty: 2,
    signOn: 3,
    startTime: 4,
    startLocation: 5,
    breakTime: 6,
    breakLocation: 7,
    resumeTime: 8,
    resumeLocation: 10,
    finishLocation: 12,
    finishTime: 13,
    paidTime: 14,
    workTime: 15,
    breakDuration: 16
  }
};

export function parseDz4RosterRow(row, dayType, sheetName = '') {
  const layout = dayType === 'weekday' ? DZ4_LAYOUTS.weekday : DZ4_LAYOUTS.weekend;

  const dutyNumber = String(Number(row[layout.duty]));

  const shiftType = classifyShift({
    rosterNumber: row[0],
    startTime: row[layout.startTime],
    breakTime: row[layout.breakTime],
    resumeTime: row[layout.resumeTime]
  });

  const parts = getDutyParts({
    breakTime: row[layout.breakTime],
    resumeTime: row[layout.resumeTime]
  });

  const events = [
    {
      event_type: 'START',
      event_time: row[layout.startTime],
      location: normalizeLocation(row[layout.startLocation])
    }
  ];

  if (parts === 2) {
    events.push(
      {
        event_type: 'BREAK_START',
        event_time: row[layout.breakTime],
        location: normalizeLocation(row[layout.breakLocation]),
        notes: ''
      },
      {
        event_type: 'RESUME',
        event_time: row[layout.resumeTime],
        location: normalizeLocation(row[layout.resumeLocation]),
        notes: ''
      }
    );
  }

  events.push({
    event_type: 'FINISH',
    event_time: row[layout.finishTime],
    location: normalizeLocation(row[layout.finishLocation]),
    notes: ''
  });
  const journey_note = normalizeJourney(row[28]);

  return {
    garage: 'DB2',
    zone: 'DZ4',
    roster_number: row[0],
    route: 'E1',
    journey_note,
    day_type: dayType,
    shift_type: shiftType,
    duty_type: shiftType === 'WORKOUT' ? 'WORKOUT' : 'NORMAL',
    parts,
    duty_number: dutyNumber,
    display_duty_number: dutyNumber,
    ticket_machine_number: dutyNumber,
    sign_on_time: row[layout.signOn],
    start_time: row[layout.startTime],
    start_location: normalizeLocation(row[layout.startLocation]),
    break_time: row[layout.breakTime],
    break_location: normalizeLocation(row[layout.breakLocation]),
    resume_time: row[layout.resumeTime],
    resume_location: normalizeLocation(row[layout.resumeLocation]),
    finish_time: row[layout.finishTime],
    finish_location: normalizeLocation(row[layout.finishLocation]),
    paid_time: row[layout.paidTime],
    work_time: row[layout.workTime],
    break_duration: row[layout.breakDuration],
    events
  };
}

function normalizeLocation(value) {
  const text = String(value || '').trim();

  if (text.toLowerCase() === 'garage') return 'Donnybrook Garage';
  if (text.toLowerCase().includes('dbrk')) return 'Donnybrook Church';
  if (text.toLowerCase().includes('eglinton')) return 'Eglinton Road';
  const route = resolveDz4Route({ sheetName, row });
  if (text.toLowerCase().includes('northwoord')) return 'Northwood';
  return text;
}
function normalizeJourney(value) {
  const text = String(value || '').trim();

  if (!text) return '';

  return text
    .replace(/Northwoord/gi, 'Northwood')
    .replace(/\bGar\b/gi, 'Donnybrook Garage');
}