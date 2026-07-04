export function extractRouteInstructionFromColumn(timetableRows = [], columnIndex) {
  for (let rowIndex = 0; rowIndex < timetableRows.length; rowIndex++) {
    const route = String(timetableRows[rowIndex]?.[columnIndex] || '').trim();

    if (!isRouteCode(route)) continue;

    const departure = cleanTime(timetableRows[rowIndex - 1]?.[columnIndex]);
    const line1 = cleanText(timetableRows[rowIndex + 2]?.[columnIndex]);
    const line2 = cleanText(timetableRows[rowIndex + 3]?.[columnIndex]);
    const arrival = findNextTime(timetableRows, columnIndex, rowIndex + 4);
    const garageArrival = findNextGarageTime(timetableRows, columnIndex, rowIndex + 4);

    if (!departure || !line1 || !line2 || !arrival) continue;

    const { origin, destination } = parseOriginDestination(line1, line2);

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
  return /^[A-Z]?\d+[A-Z]?$/i.test(value);
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