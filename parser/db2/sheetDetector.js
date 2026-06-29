export function detectCttSheets(sheetNames = []) {
  return sheetNames
    .filter((name) => {
      const lower = name.toLowerCase();

      const isCtt = lower.includes('ctt') || lower.includes('crew');

      const isDz4ServiceSheet =
        lower.includes('e1') &&
        (
          lower.includes('m-f') ||
          lower.includes('sat') ||
          lower.includes('sun')
        ) &&
        !lower.includes('board');

      return isCtt || isDz4ServiceSheet;
    })
    .map((name) => {
      const lower = name.toLowerCase();

      let dayType = 'unknown';
      if (lower.includes('m-f') || lower.includes('m_f') || lower.includes('mon') || lower.includes('weekday')) {
        dayType = 'weekday';
      }
      if (lower.includes('sat')) dayType = 'saturday';
      if (lower.includes('sun')) dayType = 'sunday';

      return { name, dayType, kind: 'ctt' };
    });
}