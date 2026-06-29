export function detectCttSheets(sheetNames = []) {
  return sheetNames
    .filter((name) => /ctt/i.test(name))
    .map((name) => {
      const lower = name.toLowerCase();

      let dayType = 'unknown';
      if (lower.includes('m-f') || lower.includes('mon')) dayType = 'weekday';
      if (lower.includes('sat')) dayType = 'saturday';
      if (lower.includes('sun')) dayType = 'sunday';

      return {
        name,
        dayType,
        kind: 'ctt'
      };
    });
}