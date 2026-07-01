export function findDutyTripColumns(dutyRow = [], tripColumns = []) {
  const candidateTimes = extractCandidateTimes(dutyRow);

  return tripColumns.filter((columnIndex) =>
    candidateTimes.includes(String(dutyRow[columnIndex] || '').trim())
  );
}

function extractCandidateTimes(row = []) {
  return row
    .map((cell) => String(cell || '').trim())
    .filter((value) => /^\d{1,2}:\d{2}$/.test(value));
}