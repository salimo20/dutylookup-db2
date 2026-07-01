const IMPORTANT_LOCATIONS = [
  'Northwood',
  'Ballywaltrim',
  'Eglinton',
  'DBRK',
  'Donnybrook',
  'Garage'
];

export function extractTimingPointsFromTimetable(timetableRows = [], tripColumns = []) {
  const timingPoints = [];

  timetableRows.forEach((row, rowIndex) => {
    const location = normalizeTimingLocation(row[0]);

    if (!location) return;

    tripColumns.forEach((columnIndex) => {
      const time = cleanTime(row[columnIndex]);

      if (!time) return;

      timingPoints.push({
        rowIndex,
        columnIndex,
        location,
        time,
        event_type: 'TIMING_POINT'
      });
    });
  });

  return removeDuplicateTimingPoints(timingPoints);
}

function normalizeTimingLocation(value) {
  const text = String(value || '').trim();
  const lower = text.toLowerCase();

  if (!text) return '';

  if (lower.includes('northwood')) return 'Northwood';
  if (lower.includes('ballywaltrim')) return 'Ballywaltrim';
  if (lower.includes('eglinton')) return 'Eglinton Road';
  if (lower.includes('dbrk')) return 'Donnybrook Church';
  if (lower.includes('donnybrook')) return 'Donnybrook';
  if (lower === 'garage') return 'Donnybrook Garage';

  const isImportant = IMPORTANT_LOCATIONS.some((place) =>
    lower.includes(place.toLowerCase())
  );

  return isImportant ? text : '';
}

function cleanTime(value) {
  const text = String(value || '').trim();

  if (!text) return '';

  const match = text.match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : '';
}

function removeDuplicateTimingPoints(points = []) {
  const seen = new Set();

  return points.filter((point) => {
    const key = `${point.time}|${point.location}|${point.columnIndex}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}