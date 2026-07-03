export function extractTimingPointsFromTimetable(timetableRows = [], tripColumns = []) {
  const points = [];

  timetableRows.forEach((row, rowIndex) => {
    const location = normalizeLocation(row[0]);

    if (!location) return;

    tripColumns.forEach((columnIndex) => {
      const time = extractTime(row[columnIndex]);

      if (!time) return;

      points.push({
        event_type: 'TIMING_POINT',
        event_time: time,
        time,
        location,
        rowIndex,
        columnIndex,
        notes: ''
      });
    });
  });

  return removeDuplicates(points);
}

function normalizeLocation(value) {
  const text = String(value || '').trim();
  const lower = text.toLowerCase();

  if (!text) return '';

  if (lower.includes('northwood')) return 'Northwood';
  if (lower.includes('ballymun')) return 'Ballymun Rd';
  if (lower.includes("d'brook") || lower.includes('d brook') || lower.includes('dbrk')) {
    return "D'Brook Church";
  }
  if (lower.includes('ballywaltrim')) return 'Ballywaltrim';
  if (lower.includes('foxrock')) return 'Foxrock Church';
  if (lower.includes('eglinton') || lower.includes('eglington')) return 'Eglinton Road';
  if (lower.includes('parnell')) return 'Parnell Sq West';

  return '';
}

function extractTime(value) {
  const text = String(value || '').trim();

  if (!text) return '';

  const match = text.match(/(\d{1,2}:\d{2})/);

  return match ? match[1] : '';
}

function removeDuplicates(points = []) {
  const seen = new Set();

  return points.filter((point) => {
    const key = `${point.event_time}|${point.location}|${point.columnIndex}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}