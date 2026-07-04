import fs from 'fs';

const file = 'output/duties-db2-dz4.json';

if (!fs.existsSync(file)) {
  throw new Error(`Missing file: ${file}. Run node scripts\\import-db2-excel.js first.`);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const issues = [];

for (const duty of data.duties || []) {
  validateDuty(duty);
}

const report = {
  total: data.duties.length,
  passed: data.duties.length - new Set(issues.map((i) => i.roster_number + i.day_type)).size,
  failed: new Set(issues.map((i) => i.roster_number + i.day_type)).size,
  issues
};

fs.writeFileSync('output/validation-report-db2-dz4.json', JSON.stringify(report, null, 2));

console.log('\nDB2 DZ4 Validation');
console.log('Total duties:', report.total);
console.log('Passed:', report.passed);
console.log('Need review:', report.failed);

for (const issue of issues) {
  console.log(`${issue.roster_number} ${issue.day_type}: ${issue.message}`);
}

console.log('\nCreated: output/validation-report-db2-dz4.json');

function validateDuty(duty) {
  const events = duty.events || [];

  if (!events.length) {
    add(duty, 'No events found');
    return;
  }

  if (!events.some((e) => e.event_type === 'START')) {
    add(duty, 'Missing START');
  }

  if (!events.some((e) => e.event_type === 'SIGN_OFF')) {
    add(duty, 'Missing SIGN_OFF');
  }

  if (duty.parts === 2) {
    if (!events.some((e) => e.event_type === 'BREAK_START')) {
      add(duty, 'Two-part duty missing BREAK');
    }

    if (!events.some((e) => e.event_type === 'RESUME')) {
      add(duty, 'Two-part duty missing RESUME');
    }
  }

  checkDuplicateSameTimePlace(duty, events);
  checkChronologicalOrder(duty, events);
  checkSignOffLocation(duty, events);
}

function checkDuplicateSameTimePlace(duty, events) {
  const seen = new Set();

  for (const event of events) {
    const key = `${toMinutes(event.event_time, duty.start_time)}|${normalizeLocation(event.location)}`;

    if (event.event_type === 'SIGN_OFF') continue;

    if (seen.has(key)) {
      add(duty, `Duplicate event at ${event.event_time} ${event.location}`);
    }

    seen.add(key);
  }
}

function checkChronologicalOrder(duty, events) {
  let previous = -1;

  for (const event of events) {
    const current = toMinutes(event.event_time, duty.start_time);

    if (current < previous) {
      add(duty, `Out of order event: ${event.event_time} ${event.location || event.event_type}`);
    }

    previous = current;
  }
}

function checkSignOffLocation(duty, events) {
  const signOff = events.find((e) => e.event_type === 'SIGN_OFF');

  if (signOff && signOff.location) {
    add(duty, 'SIGN_OFF should not have a location');
  }
}

function add(duty, message) {
  issues.push({
    roster_number: duty.roster_number,
    day_type: duty.day_type,
    duty_number: duty.duty_number,
    message
  });
}

function toMinutes(value, startValue) {
  const minutes = rawMinutes(value);
  const start = rawMinutes(startValue);

  if (minutes === null) return 0;
  if (start === null) return minutes;

  return minutes < start ? minutes + 1440 : minutes;
}

function rawMinutes(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function normalizeLocation(value = '') {
  const text = String(value || '').toLowerCase();

  if (text.includes('garage')) return 'garage';

  return text
    .replace(/donnybrook church/g, "d'brook church")
    .replace(/donnybrook/g, "d'brook")
    .replace(/d brook/g, "d'brook")
    .replace(/dbrk/g, "d'brook")
    .replace(/eglington/g, 'eglinton')
    .replace(/\s+/g, ' ')
    .trim();
}