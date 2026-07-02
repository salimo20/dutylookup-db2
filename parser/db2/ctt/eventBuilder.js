export function buildDriverTimeline(baseEvents = [], timingPointsByPart = [], duty = {}) {
  const timingEvents = timingPointsByPart.flatMap((part) =>
    (part.timingPoints || [])
      .filter((point) => isBetween(point.time, part.from, part.to))
      .map((point) => ({
        event_type: 'TIMING_POINT',
        event_time: point.time,
        location: point.location,
        notes: ''
      }))
  );

  const base = baseEvents.map((event) => {
    if (event.event_type === 'FINISH') {
      return {
        ...event,
        event_type: 'SIGN_OFF',
        location: 'Sign Off',
        notes: ''
      };
    }

    return event;
  });

  return [...base, ...timingEvents]
    .filter((event) => event.event_time && event.location)
    .filter(removeTimingConflicts)
    .sort((a, b) => timeToMinutes(a.event_time) - timeToMinutes(b.event_time))
    .filter(removeDuplicates);
}

function removeTimingConflicts(event, index, events) {
  if (event.event_type !== 'TIMING_POINT') return true;

  const protectedTypes = new Set(['START', 'BREAK_START', 'RESUME', 'SIGN_OFF']);

  return !events.some(
    (item) =>
      protectedTypes.has(item.event_type) &&
      item.event_time === event.event_time
  );
}

function removeDuplicates(event, index, events) {
  const key = `${event.event_time}|${event.event_type}|${String(event.location).toLowerCase()}`;

  return (
    events.findIndex(
      (item) =>
        `${item.event_time}|${item.event_type}|${String(item.location).toLowerCase()}` === key
    ) === index
  );
}

function isBetween(time, from, to) {
  const value = timeToMinutes(time);
  const start = timeToMinutes(from);
  const end = timeToMinutes(to);

  if (value === null) return false;
  if (start !== null && value < start) return false;
  if (end !== null && value > end) return false;

  return true;
}

function timeToMinutes(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}