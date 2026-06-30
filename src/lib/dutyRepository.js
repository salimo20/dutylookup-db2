export async function findImportedDuty(rosterNumber, dayType) {
  const response = await fetch('/duties-db2-dz4.json');

  if (!response.ok) {
    throw new Error('Could not load imported duties.');
  }

  const packageData = await response.json();
  const roster = String(rosterNumber || '').toUpperCase().trim();

  const duty = packageData.duties.find((item) =>
    String(item.roster_number || '').toUpperCase().trim() === roster &&
    item.day_type === dayType
  );

  if (!duty) {
    return {
      duty: null,
      version: packageData.version,
      generatedAt: packageData.generatedAt
    };
  }

  return {
    duty: {
      ...duty,
      data_version: packageData.version,
      data_source: 'Imported Excel'
    },
    version: packageData.version,
    generatedAt: packageData.generatedAt
  };
  export async function getImportedDutySuggestions(query, dayType) {
  const response = await fetch('/duties-db2-dz4.json');

  if (!response.ok) return [];

  const packageData = await response.json();
  const q = String(query || '').toUpperCase().replace(/\s+/g, '');

  if (!q) return [];

  return packageData.duties
    .filter((duty) => duty.day_type === dayType)
    .filter((duty) => {
      const roster = String(duty.roster_number || '').toUpperCase();
      const dutyNo = String(duty.duty_number || '').toUpperCase();
      const shift = String(duty.shift_type || '').toUpperCase();

      return (
        roster.includes(q) ||
        dutyNo.includes(q) ||
        shift.includes(q)
      );
    })
    .slice(0, 8);
}

}