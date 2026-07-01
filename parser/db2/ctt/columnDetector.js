export function detectTripColumns(timetableRows = []) {
  const columns = new Set();

  timetableRows.forEach((row) => {
    row.forEach((cell, index) => {
      const value = String(cell || '').trim();

      if (isTripHeader(value)) {
        columns.add(index);
      }
    });
  });

  return Array.from(columns).sort((a, b) => a - b);
}

function isTripHeader(value = '') {
  return (
    /^Bus\s+\w+/i.test(value) ||
    /^\d{8}$/.test(value) ||
    /^\d{3}-\d{1,2}:\d{2}[a-z]?$/i.test(value)
  );
}