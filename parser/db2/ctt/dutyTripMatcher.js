export function findDutyTripColumnsFromHeader(timetableRows = [], duty = {}) {
  const dutyNumber = padDutyNumber(duty.duty_number || duty.display_duty_number);
  const startTime = normalizeTime(duty.start_time);

  if (!dutyNumber || !startTime) return [];

  const targetHeader = `${dutyNumber}-${startTime}`;
  const matches = [];

  timetableRows.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const value = String(cell || '').trim();

      if (value === targetHeader) {
        matches.push({
          columnIndex,
          rowIndex,
          header: value
        });
      }
    });
  });

  return matches;
}

function padDutyNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return String(number).padStart(3, '0');
}

function normalizeTime(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return '';

  return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
}