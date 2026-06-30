export function classifyShift({ rosterNumber, startTime, breakTime, resumeTime }) {
  const roster = String(rosterNumber || '').toUpperCase();

  if (roster.includes('X')) return 'BOGEY';
  if (/DZ4\/7\d/.test(roster)) return 'NIGHT';

  const hasBreak = Boolean(String(breakTime || '').trim());
  const hasResume = Boolean(String(resumeTime || '').trim());

  if (!hasBreak && !hasResume) return 'WORKOUT';

  const hour = Number(String(startTime || '00:00').split(':')[0]);

  if (hour >= 4 && hour < 10) return 'EARLY';
  if (hour >= 10 && hour < 14) return 'RELIEF';
  if (hour >= 14 && hour < 19) return 'LATE';

  return 'NIGHT';
}

export function getDutyParts({ breakTime, resumeTime }) {
  const hasBreak = Boolean(String(breakTime || '').trim());
  const hasResume = Boolean(String(resumeTime || '').trim());

  return hasBreak && hasResume ? 2 : 1;
}