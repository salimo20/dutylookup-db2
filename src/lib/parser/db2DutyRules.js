export function getTicketMachineNumber({ zone, rosterNumber, rawDutyNumber }) {
  const roster = String(rosterNumber || '').toUpperCase().trim();

  if (zone === 'DZ4') {
    const xMatch = roster.match(/DZ4\/(\d{1,2})X/);
    if (xMatch) return String(200 + Number(xMatch[1]));

    const normalMatch = roster.match(/DZ4\/(\d{1,2})/);
    if (normalMatch) return String(Number(normalMatch[1]));
  }

  if (zone === 'DZ5') {
    return String(rawDutyNumber || '').slice(-3);
  }

  if (zone === 'L25') {
    return String(rawDutyNumber || '');
  }

  return String(rawDutyNumber || '');
}

export function getShiftType({ zone, rosterNumber, startTime }) {
  const roster = String(rosterNumber || '').toUpperCase();

  if (roster.includes('X')) return 'BOGEY';
  if (/DZ4\/7\d/.test(roster)) return 'NIGHT';

  const hour = Number(String(startTime || '00:00').split(':')[0]);

  if (hour >= 4 && hour < 10) return 'EARLY';
  if (hour >= 10 && hour < 14) return 'RELIEF';
  if (hour >= 14 && hour < 19) return 'LATE';
  return 'NIGHT';
}