export function buildTimetable(rows) {
  return {
    rows,
    findRow(label) {
      const search = String(label || '').toLowerCase();

      return rows.find((row) =>
        row.some((cell) =>
          String(cell || '')
            .toLowerCase()
            .includes(search)
        )
      );
    }
  };
}