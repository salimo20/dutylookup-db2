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
}