export function extractTripReferencesFromDuty(row = []) {
  return row
    .map((cell, index) => ({
      index,
      value: String(cell || '').trim()
    }))
    .filter((item) => isTripReference(item.value));
}

export function isTripReference(value = '') {
  const text = String(value || '').trim();

  return (
    /^\d{3}-\d{1,2}:\d{2}[a-z]?$/i.test(text) ||
    /^Bus\s+\w+/i.test(text) ||
    /^\d{8}$/.test(text)
  );
}

export function findTripColumns(timetableRows = [], tripReferences = []) {
  const refs = tripReferences.map((item) => item.value.toUpperCase());

  const matches = [];

  timetableRows.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      const value = String(cell || '').trim().toUpperCase();

      if (refs.includes(value)) {
        matches.push({
          reference: value,
          rowIndex,
          columnIndex
        });
      }
    });
  });

  return matches;
}