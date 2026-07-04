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
    .sort((a, b) => timelineMinutes(a.event_time, duty.start_time) - timelineMinutes(b.event_time, duty.start_time));

  const cleaned = removeDuplicateSameTimeSamePlace(merged);

  return addDutyCompletion(cleaned, duty);
}

function addDutyCompletion(events = [], duty = {}) {
  const finishTime = duty.finish_time;
  const finishMinutes = timelineMinutes(finishTime, duty.start_time);
  let finalEvents = [...events];

  const lastTimingPoint = [...finalEvents]
    .reverse()
    .find((event) => event.event_type === 'TIMING_POINT');

  if (lastTimingPoint) {
    const lastMinutes = timelineMinutes(lastTimingPoint.event_time, duty.start_time);
    const gap = finishMinutes !== null && lastMinutes !== null ? finishMinutes - lastMinutes : null;

    if (gap !== null && gap >= 0 && gap <= 10) {
      finalEvents = finalEvents.map((event) =>
        event === lastTimingPoint
          ? { ...event, event_type: 'END_OF_DUTY', notes: 'End of Duty' }
          : event
      );
    }
  }

  finalEvents.push({
    event_type: 'SIGN_OFF',
    event_time: finishTime,
    location: '',
    notes: 'Sign Off'
  });

  return removeDuplicateSameTimeSamePlace(
    finalEvents.sort(
      (a, b) => timelineMinutes(a.event_time, duty.start_time) - timelineMinutes(b.event_time, duty.start_time)
    )
  );
}

function removeDuplicateSameTimeSamePlace(events = []) {
  const priority = {
    START: 1,
    BREAK_START: 1,
    RESUME: 1,
    END_OF_DUTY: 1,
    SIGN_OFF: 1,
    GARAGE: 1,
    TIMING_POINT: 2
  };

  const seen = new Set();

  return events
    .sort((a, b) => {
      const timeDiff = timeToMinutes(a.event_time) - timeToMinutes(b.event_time);
      if (timeDiff !== 0) return timeDiff;
      return (priority[a.event_type] || 9) - (priority[b.event_type] || 9);
    })
    .filter((event) => {
      const key = `${timeToMinutes(event.event_time)}|${normalizeLocation(event.location)}`;

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
}

function isBetween(time, from, to) {
  const value = timeToMinutes(time);
  let start = timeToMinutes(from);
  let end = timeToMinutes(to);

  if (value === null) return false;
  if (start === null || end === null) return true;

  let adjustedValue = value;

  if (end < start) {
    end += 1440;
    if (adjustedValue < start) adjustedValue += 1440;
  }

  return adjustedValue >= start && adjustedValue <= end;
}

function timelineMinutes(value, dutyStart) {
  const minutes = timeToMinutes(value);
  const start = timeToMinutes(dutyStart);

  if (minutes === null) return 0;
  if (start === null) return minutes;

  return minutes < start ? minutes + 1440 : minutes;
}

function timeToMinutes(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return null;

  return Number(match[1]) * 60 + Number(match[2]);
}

function normalizeLocation(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/donnybrook church/g, "d'brook church")
    .replace(/donnybrook/g, "d'brook")
    .replace(/d brook/g, "d'brook")
    .replace(/dbrk/g, "d'brook")
    .replace(/eglington/g, 'eglinton')
    .replace(/\s+/g, ' ')
    .trim();
}