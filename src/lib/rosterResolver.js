export function normalizeRoster(input) {
  const raw = String(input || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace('DZ4-', 'DZ4/')
    .replace('DZ5-', 'DZ5/')
    .replace('L25-', 'L25/');

  if (/^\d{1,2}X$/.test(raw)) return `DZ4/${raw}`;
  if (/^\d{1,2}$/.test(raw)) return `DZ4/${Number(raw)}`;

  return raw;
}
export function resolveDutyFromRoster(roster) {
  const value = normalizeRoster(roster);

  const dz4X = value.match(/^DZ4\/(\d{1,2})X$/);
  if (dz4X) {
    const n = Number(dz4X[1]);
    if (n >= 1 && n <= 26) {
      return {
        roster: value,
        resolvedDutyNumber: String(200 + n),
        zone: 'DZ4',
        shiftHint: 'BOGEY',
        rule: 'DZ4_X_BOGEY_200_PLUS_ROSTER_NUMBER'
      };
    }
  }

  const dz4Number = value.match(/^DZ4\/(\d{1,2})$/);
  if (dz4Number) {
    const n = Number(dz4Number[1]);
    if (n >= 1 && n <= 64) {
      return {
        roster: value,
        resolvedDutyNumber: String(n).padStart(2, '0'),
        zone: 'DZ4',
        shiftHint: 'TIME_BASED_EARLY_RELIEF_LATE',
        rule: 'DZ4_STANDARD_ROSTER_EQUALS_DUTY'
      };
    }
    if (n >= 71 && n <= 77) {
      return {
        roster: value,
        resolvedDutyNumber: String(n),
        zone: 'DZ4',
        shiftHint: 'NIGHT',
        rule: 'DZ4_NIGHT_ROSTER_EQUALS_DUTY'
      };
    }
  }

  const dz5 = value.match(/^DZ5\/(\d{1,2})$/);
  if (dz5) {
    return {
      roster: value,
      resolvedDutyNumber: null,
      zone: 'DZ5',
      shiftHint: 'FROM_ROSTER_TABLE',
      rule: 'DZ5_LOOKUP_TABLE'
    };
  }

  const l25 = value.match(/^L25\/?(\d{1,2})?$/);
  if (l25) {
    return {
      roster: value,
      resolvedDutyNumber: value,
      zone: 'L25',
      shiftHint: 'STANDALONE',
      rule: 'L25_ROSTER_AS_DUTY_WHEN_NO_DUTY_NUMBER'
    };
  }

  return {
    roster: value,
    resolvedDutyNumber: null,
    zone: null,
    shiftHint: null,
    rule: 'UNKNOWN'
  };
}
