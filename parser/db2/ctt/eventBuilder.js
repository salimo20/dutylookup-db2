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

  const baseWithoutFinish = baseEvents.filter((event) => event.event_type !== 'FINISH');

  const merged = [...baseWithoutFinish, ...timingEvents]
    .filter((event) => event.event_time)
    .filter(removeTimingConflicts)
    .sort((a, b) => timeToMinutes(a.event_time) - timeToMinutes(b.event_time))
    .filter(removeDuplicates);

  return addDutyCompletion(merged, duty);
}

function addDutyCompletion(events = [], duty = {}) {
  const finishTime = duty.finish_time;
  const finishMinutes = timeToMinutes(finishTime);

  const lastTimingPoint = [...events]
    .reverse()
    .find((event) => event.event_type === 'TIMING_POINT');

  let finalEvents = [...events];

  if (lastTimingPoint) {
    const lastMinutes = timeToMinutes(lastTimingPoint.event_time);
    const gap = finishMinutes !== null && lastMinutes !== null ? finishMinutes - lastMinutes : null;

    if (gap !== null && gap >= 0 && gap <= 10) {
      finalEvents = finalEvents.map((event) => {
        if (event === lastTimingPoint) {
          return {
            ...event,
            event_type: 'END_OF_DUTY',
            notes: 'End of Duty'
          };
        }

        return event;
      });
    }
  }

  finalEvents.push({
    event_type: 'SIGN_OFF',
    event_time: finishTime,
    location: '',
    notes: 'Sign Off'
  });

  return finalEvents
    .sort((a, b) => timeToMinutes(a.event_time) - timeToMinutes(b.event_time))
    .filter(removeDuplicates);
}

function removeTimingConflicts(event, index, events) {
  if (event.event_type !== 'TIMING_POINT') return true;

  const protectedTypes = new Set(['START', 'BREAK_START', 'RESUME']);

  return !events.some(
    (item) => protectedTypes.has(item.event_type) && item.event_time === event.event_time
  );
}

function removeDuplicates(event, index, events) {
  const key = `${event.event_time}|${event.event_type}|${String(event.location || '').toLowerCase()}`;

  return (
    events.findIndex(
      (item) =>
        `${item.event_time}|${item.event_type}|${String(item.location || '').toLowerCase()}` === key
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