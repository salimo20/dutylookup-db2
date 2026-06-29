import XLSX from 'xlsx';

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

export function findRosterRow(rows, roster) {
  const target = String(roster).toUpperCase();

  return rows.find(row =>
    row.some(cell =>
      String(cell).toUpperCase().trim() === target
    )
  );
}

export function parseDz4RosterRow(row, dayType) {
  return {
    garage: 'DB2',
    zone: 'DZ4',
    roster_number: row[0],
    route: 'E1',
    day_type: dayType,
    duty_number: String(Number(row[3] || row[2])),
    display_duty_number: String(Number(row[3] || row[2])),
    ticket_machine_number: String(Number(row[3] || row[2])),
    sign_on_time: row[4],
    start_time: row[5],
    start_location: normalizeLocation(row[6]),
    break_time: row[7],
    break_location: normalizeLocation(row[8]),
    resume_time: row[9],
    resume_location: normalizeLocation(row[11]),
    finish_time: row[14],
    finish_location: normalizeLocation(row[13]),
    paid_time: row[15],
    work_time: row[16],
    break_duration: row[17],
    events: [
      { event_type: 'START', event_time: row[5], location: normalizeLocation(row[6]) },
      { event_type: 'BREAK_START', event_time: row[7], location: normalizeLocation(row[8]), notes: '23 → 7' },
      { event_type: 'RESUME', event_time: row[9], location: normalizeLocation(row[11]), notes: '220 → 23' },
      { event_type: 'FINISH', event_time: row[14], location: normalizeLocation(row[13]), notes: '23 → 44' }
    ]
  };
}

function normalizeLocation(value) {
  const text = String(value || '').trim();

  if (text.toLowerCase() === 'garage') return 'Donnybrook Garage';
  if (text.toLowerCase().includes('dbrk')) return 'Donnybrook Church';
  if (text.toLowerCase().includes('eglinton')) return 'Eglinton Road';

  return text;
}