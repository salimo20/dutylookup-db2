export function extractRouteInstructionFromColumn(timetableRows = [], columnIndex) {
  for (let rowIndex = 0; rowIndex < timetableRows.length; rowIndex++) {
    const route = cleanText(timetableRows[rowIndex]?.[columnIndex]);
    const nextLine = cleanText(timetableRows[rowIndex + 1]?.[columnIndex]).toLowerCase();

    if (!isRouteCode(route)) continue;
    if (nextLine !== 'from') continue;

    const departure = cleanTime(timetableRows[rowIndex - 1]?.[columnIndex]);
    const line1 = cleanText(timetableRows[rowIndex + 2]?.[columnIndex]);
    const line2 = cleanText(timetableRows[rowIndex + 3]?.[columnIndex]);

    if (!departure || !line1 || !line2) continue;

    const { origin, destination } = parseOriginDestination(line1, line2);
    const arrival = findNextTime(timetableRows, columnIndex, rowIndex + 4);
    const garageArrival = findNextGarageTime(timetableRows, columnIndex, rowIndex + 4);

    if (!arrival) continue;

    return {
      route,
      departure,
      origin,
      destination,
      arrival,
      garageArrival
    };
  }

  return null;
}

function isRouteCode(value = '') {
  const text = cleanText(value);

  if (!text) return false;
  if (/^bus/i.test(text)) return false;
  if (/^\d{6,}$/.test(text)) return false;

  return /^[A-Z]?\d+[A-Z]?$/i.test(text);
}

function parseOriginDestination(line1, line2) {
  if (/\bto\b$/i.test(line1)) {
    return {
      origin: line1.replace(/\bto\b/i, '').trim(),
      destination: line2
    };
  }

  return {
    origin: line1,
    destination: line2
  };
}

function findNextTime(rows, columnIndex, startRow) {
  for (let row = startRow; row < startRow + 8; row++) {
    const value = cleanText(rows[row]?.[columnIndex]);

    if (/^\d{1,2}:\d{2}g?$/i.test(value)) {
      return cleanTime(value);
    }
  }

  return '';
}

function findNextGarageTime(rows, columnIndex, startRow) {
  for (let row = startRow; row < startRow + 10; row++) {
    const value = cleanText(rows[row]?.[columnIndex]);

    if (/^\d{1,2}:\d{2}g$/i.test(value)) {
      return cleanTime(value);
    }
  }

  return '';
}

function cleanTime(value) {
  return cleanText(value).replace(/g$/i, '');
}

function cleanText(value) {
  return String(value || '').trim();
}