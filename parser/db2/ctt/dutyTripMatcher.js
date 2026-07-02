export function findDutyTripPartsFromHeaders(timetableRows = [], duty = {}) {
  const dutyNumber = padDutyNumber(duty.duty_number || duty.display_duty_number);

  if (!dutyNumber) return [];

  const parts = [];

  const part1 = findTripColumnByHeader(timetableRows, dutyNumber, duty.start_time, 'PART_1');

  if (part1) {
    parts.push({
      ...part1,
      part: 1,
      from: duty.start_time,
      to: duty.break_time || duty.finish_time
    });
  }

  if (duty.parts === 2 && duty.resume_time) {
    const part2 = findTripColumnByHeader(timetableRows, dutyNumber, duty.resume_time, 'PART_2');

    if (part2) {
      parts.push({
        ...part2,
        part: 2,
        from: duty.resume_time,
        to: duty.finish_time
      });
    }
  }

  return parts;
}

function findTripColumnByHeader(timetableRows = [], dutyNumber, time, label) {
  const normalizedTime = normalizeTime(time);
  if (!normalizedTime) return null;

  const targetHeader = `${dutyNumber}-${normalizedTime}`;

  for (let rowIndex = 0; rowIndex < timetableRows.length; rowIndex++) {
    const row = timetableRows[rowIndex] || [];

    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const value = String(row[columnIndex] || '').trim();

      if (value === targetHeader) {
        return { label, header: value, rowIndex, columnIndex };
      }
    }
  }

  return null;
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