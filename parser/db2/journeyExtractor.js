export function extractJourneyPoints(journeyNote = '') {
  const text = String(journeyNote || '').trim();

  if (!text) return [];

  return text
    .split('-')
    .map((part) => normalizeJourneyPoint(part))
    .filter(Boolean);
}

function normalizeJourneyPoint(value) {
  const text = String(value || '').trim();
  const lower = text.toLowerCase();

  if (!text) return '';
  if (lower === 'gar') return 'Donnybrook Garage';
  if (lower === 'garage') return 'Donnybrook Garage';
  if (lower.includes('northwoord')) return 'Northwood';
  if (lower.includes('northwood')) return 'Northwood';
  if (lower.includes('ballywaltrim')) return 'Ballywaltrim';
  if (lower.includes('dbrk')) return 'Donnybrook Church';
  if (lower.includes('eglinton')) return 'Eglinton Road';

  return text;
}