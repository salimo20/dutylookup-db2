export function buildWorkbookMap(rows = []) {
  return {
    totalRows: rows.length,
    rosterStartRow: findRosterStartRow(rows),
    locationRows: findLocationRows(rows),
    dutyRows: findDutyRows(rows)
  };
}

function findRosterStartRow(rows) {
  const index = rows.findIndex((row) =>
    /^DZ4\/\d{1,2}X?$/.test(String(row[0] || '').toUpperCase().trim())
  );

  return index >= 0 ? index : null;
}

function findDutyRows(rows) {
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) =>
      /^DZ4\/\d{1,2}X?$/.test(String(row[0] || '').toUpperCase().trim())
    )
    .map(({ index, row }) => ({
      index,
      roster: String(row[0] || '').trim()
    }));
}

function findLocationRows(rows) {
  const locations = ['Northwood', 'Ballywaltrim', 'Eglinton', 'DBRK', 'Garage'];

  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => {
      const text = row.join(' ').toLowerCase();
      return locations.some((location) => text.includes(location.toLowerCase()));
    })
    .map(({ index, row }) => ({
      index,
      firstCell: String(row[0] || '').trim()
    }));
}