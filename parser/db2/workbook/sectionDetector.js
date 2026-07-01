export function detectWorkbookSections(rows = []) {
  const roster = detectRoster(rows);

  return {
    timetable: {
      start: 0,
      end: roster.start === null ? rows.length - 1 : Math.max(0, roster.start - 1)
    },
    roster,
    summary: {
      start: roster.end === null ? null : roster.end + 1,
      end: rows.length - 1
    }
  };
}

function detectRoster(rows) {
  const rosterPattern = /^DZ\d+\/\d{1,2}X?$/i;

  const start = rows.findIndex((row) =>
    rosterPattern.test(String(row[0] || '').trim())
  );

  if (start < 0) {
    return {
      start: null,
      end: null
    };
  }

  let end = start;

  while (
    end < rows.length &&
    rosterPattern.test(String(rows[end][0] || '').trim())
  ) {
    end++;
  }

  return {
    start,
    end: end - 1
  };
}