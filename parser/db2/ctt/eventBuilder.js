export function buildDriverTimeline(baseEvents = [], timingPoints = [], duty = {}) {
  const startMinutes = timeToMinutes(duty.start_time);
  const finishMinutes = timeToMinutes(duty.finish_time);

  const filteredTimingPoints = timingPoints
    .filter((point) => {
      const minutes = timeToMinutes(point.time);

      if (minutes === null) return false;
      if (startMinutes !== null && minutes < startMinutes) return false;
      if (finishMinutes !== null && minutes > finishMinutes) return false;

      return true;
    })
    .map((point) => ({
      event_type: 'TIMING_POINT',
      event_time: point.time,
      location: point.location,
      notes: ''
    }));

  return [...baseEvents, ...filteredTimingPoints]
    .filter((event) => event.event_time && event.location)
    .sort((a, b) => {
      const aTime = timeToMinutes(a.event_time);
      const bTime = timeToMinutes(b.event_time);
      return (aTime ?? 0) - (bTime ?? 0);
    })
    .filter(removeDuplicateEvents);
}

function removeDuplicateEvents(event, index, events) {
  const key = `${event.event_time}|${String(event.location || '').toLowerCase()}`;

  return events.findIndex((item) =>
    `${item.event_time}|${String(item.location || '').toLowerCase()}` === key
  ) === index;
}

function timeToMinutes(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}