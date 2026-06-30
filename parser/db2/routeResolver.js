export function resolveDz4Route({ sheetName, row }) {
  const sheet = String(sheetName || '').toUpperCase();
  const rowText = (row || []).join(' ').toUpperCase();

  if (rowText.includes('7E')) return '7E';
  if (rowText.includes('X1')) return 'X1';
  if (sheet.includes('X1') && rowText.includes('X')) return 'X1';

  return 'E1';
}