import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowLeft, CalendarDays, Coffee, Flag, Play, Search, Ticket } from 'lucide-react';
import { normalizeRoster, resolveDutyFromRoster } from './lib/rosterResolver.js';
import { findDemoDuty } from './lib/demoData.js';
import { getRouteInfo } from './lib/driverFacilities.js';
import { findImportedDuty, getImportedDutySuggestions } from './lib/dutyRepository.js';
import './styles.css';

const dayLabels = {
  weekday: 'Monday–Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

function App() {
  const [page, setPage] = useState('search');
  const [rosterInput, setRosterInput] = useState('DZ4/23');
  const [dayType, setDayType] = useState('weekday');
  const [duty, setDuty] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  async function searchDuty() {
    const roster = normalizeRoster(rosterInput);
    const resolved = resolveDutyFromRoster(roster);

    try {
      const { duty: importedDuty } = await findImportedDuty(roster, dayType);

      if (importedDuty) {
        setDuty(importedDuty);
        setPage('card');
        return;
      }
    } catch (error) {
      console.warn('Imported duty lookup failed, falling back to demo data.', error);
    }

    const found = findDemoDuty(roster, dayType);

    setDuty(found || {
      roster_number: roster,
      route: 'E1',
      display_duty_number: resolved.resolvedDutyNumber || '---',
      ticket_machine_number: resolved.resolvedDutyNumber || '---',
      shift_type: resolved.shiftHint === 'BOGEY' ? 'BOGEY' : 'EARLY',
      events: [],
      data_source: found ? 'Demo Data' : 'Resolver Only',
      data_version: 'Demo'
    });

    setPage('card');
  }

  async function handleRosterChange(value) {
    setRosterInput(value);
    setSuggestions(await getImportedDutySuggestions(value, dayType));
  }

  if (page === 'search') {
    return (
      <main className="screen search-screen">
        <h1>Duty Lookup</h1>

        <label>Roster Number</label>
        <input
          value={rosterInput}
          onChange={(e) => handleRosterChange(e.target.value)}
          placeholder="DZ4/23"
        />

        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((item) => (
              <button
                key={`${item.roster_number}-${item.day_type}`}
                onClick={() => {
                  setRosterInput(item.roster_number);
                  setSuggestions([]);
                }}
              >
                <strong>{item.roster_number}</strong>
                <span>{item.shift_type}</span>
              </button>
            ))}
          </div>
        )}

        <label>Day</label>
        <div className="day-buttons">
          {Object.entries(dayLabels).map(([key, label]) => (
            <button
              key={key}
              className={dayType === key ? 'active' : ''}
              onClick={() => {
                setDayType(key);
                setSuggestions([]);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <button className="search-button" onClick={searchDuty}>
          <Search size={18} /> Search Duty
        </button>

        <p className="safety">⚠️ Do not use mobile while driving.</p>
      </main>
    );
  }

  return <DutyCard duty={duty} dayType={dayType} onBack={() => setPage('search')} />;
}

function DutyCard({ duty, dayType, onBack }) {
  const ticket = duty.ticket_machine_number || duty.display_duty_number || duty.duty_number || '---';
  const today = new Date().toLocaleDateString('en-IE');
  const events = filterDriverEvents(duty.events || []);
  const driverInfo = getRouteInfo(duty.route);

  return (
    <main className="screen card-screen">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <h2>{dayLabels[dayType]}</h2>

      <div className="mini-row">
        <span><CalendarDays size={16} /> {today}</span>
        <span className="ticket-mini">
          <Ticket size={16} />
          <small>Ticket Machine</small>
          <strong>{ticket}</strong>
        </span>
      </div>

      <div className="route-box">
        <small>Route</small>
        <strong>{duty.route || '---'}</strong>
      </div>

      <div className="details-row">
        <div>
          <small>Roster</small>
          <strong>{duty.roster_number}</strong>
        </div>
        <div>
          <small>Shift</small>
          <strong className={`shift ${String(duty.shift_type || '').toLowerCase()}`}>
            {duty.shift_type || 'SHIFT'}
          </strong>
        </div>
      </div>

      <div className="hours-summary">
        <div>
          <small>Hours</small>
          <strong>{duty.work_time || '—'}</strong>
        </div>
        <div>
          <small>Break</small>
          <strong>{duty.break_duration || '—'}</strong>
        </div>
        <div>
          <small>Total</small>
          <strong>{duty.paid_time || '—'}</strong>
        </div>
      </div>
      {duty.journey_note && (
  <div className="journey-note">
    <small>Journey</small>
    <strong>{duty.journey_note}</strong>
  </div>
)}
      <section className="timeline">
        {events.map((event, index) => (
          <TimelineItem event={event} key={index} />
        ))}
      </section>

      {driverInfo && <DriverInfo route={duty.route} info={driverInfo} />}

      <div className="data-version">
        <span>{duty.data_source || 'Data Source'}</span>
        <strong>{duty.data_version || 'Unknown Version'}</strong>
      </div>

      <p className="safety">⚠️ Do not use mobile while driving.</p>
    </main>
  );
}

function TimelineItem({ event }) {
  const type = event.event_type || '';
  const locationClass = getLocationClass(event.location);

  if (type === 'BREAK_START') {
    return (
      <div className="timeline-item break">
        <Coffee size={18} />
        <div>
          <strong>{event.event_time} <span className={locationClass}>{event.location}</span></strong>
          <p>Break</p>
          {event.notes && <em>{event.notes}</em>}
        </div>
      </div>
    );
  }

  if (type === 'RESUME') {
    return (
      <div className="timeline-item resume">
        <Play size={18} />
        <div>
          <strong>{event.event_time} <span className={locationClass}>{event.location}</span></strong>
          <p>Resume</p>
          {event.notes && <em>{event.notes}</em>}
        </div>
      </div>
    );
  }

  if (type === 'FINISH') {
    return (
      <div className="timeline-item finish">
        <Flag size={18} />
        <div>
          <strong>{event.event_time} <span className={locationClass}>{event.location}</span></strong>
          <p>Finish</p>
          {event.notes && <em>{event.notes}</em>}
        </div>
      </div>
    );
  }
  if (type === 'END_OF_DUTY') {
  return (
    <div className="timeline-item finish">
      <Flag size={18} />
      <div>
        <strong>{event.event_time} <span>{event.location}</span></strong>
        <p>End of Duty</p>
      </div>
    </div>
  );
}
  if (type === 'SIGN_OFF') {
  return (
    <div className="timeline-item finish">
      <Flag size={18} />
      <div>
        <strong>{event.event_time} <span>{event.location}</span></strong>
        <p>Sign Off</p>
      </div>
    </div>
  );
}
if (type === 'GARAGE') {
  return (
    <div className="timeline-item">
      <span className="dot" />
      <div>
        <strong>{event.event_time} <span>{event.location}</span></strong>
        <p>Garage</p>
      </div>
    </div>
  );
}

  return (
    <div className="timeline-item">
      <span className="dot" />
      <div>
        <strong>{event.event_time} <span className={locationClass}>{event.location}</span></strong>
      </div>
    </div>
  );
}

function DriverInfo({ route, info }) {
  return (
    <section className="driver-info">
      <h3>Driver Facilities & Contact</h3>

      {info.routeNote && (
        <div className="route-note">
          <strong>{route}</strong>
          <p>{info.routeNote}</p>
        </div>
      )}

      <div className="facility-list">
        {info.facilities.map((item, index) => (
          <div className="facility-item" key={index}>
            <strong>{item.place}</strong>
            {item.lines.map((line, lineIndex) => (
              <p key={lineIndex}>{line}</p>
            ))}
          </div>
        ))}
      </div>

      <div className="controller-box">
        <small>Controller Contact</small>
        <strong>{info.controllerPhone}</strong>
        <span>{info.controllerRoutes}</span>
        <a href={`tel:${info.controllerPhone.replace(/\s+/g, '')}`}>Call Controller</a>
      </div>
    </section>
  );
}

function filterDriverEvents(events = []) {
  const importantTypes = new Set([
    'START',
    'GARAGE',
    'BREAK_START',
    'RESUME',
    'END_OF_DUTY',
    'SIGN_OFF',
    'FINISH'
  ]);

  const importantTimingPlaces = [
    'northwood',
    'ballywaltrim',
    "d'brook church",
    'donnybrook church',
    'eglinton',
    'killcoole',
    'kilcoole',
    'hawkins'
  ];

  const cleaned = events.filter((event) => {
    const type = event.event_type || '';
    const location = String(event.location || '').toLowerCase();

    if (importantTypes.has(type)) return true;

    if (type === 'TIMING_POINT') {
      return importantTimingPlaces.some((place) => location.includes(place));
    }

    return false;
  });

  return removeDuplicateDriverEvents(cleaned);
}
function removeDuplicateDriverEvents(events = []) {
  const startEvent = events.find((event) => event.event_type === 'START');
  const dutyStart = startEvent?.event_time;

  const priority = {
    START: 1,
    BREAK_START: 1,
    RESUME: 1,
    END_OF_DUTY: 1,
    SIGN_OFF: 1,
    GARAGE: 1,
    TIMING_POINT: 2
  };

  const sorted = [...events].sort((a, b) => {
    const timeA = timelineMinutes(a.event_time, dutyStart);
    const timeB = timelineMinutes(b.event_time, dutyStart);

    if (timeA !== timeB) return timeA - timeB;

    return (priority[a.event_type] || 9) - (priority[b.event_type] || 9);
  });

  const seen = new Set();

  return sorted.filter((event) => {
    const key = `${timelineMinutes(event.event_time, dutyStart)}|${normalizeDriverLocation(event.location)}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function timelineMinutes(value, dutyStart) {
  const minutes = timeToMinutes(value);
  const start = timeToMinutes(dutyStart);

  if (minutes === null) return 0;
  if (start === null) return minutes;

  return minutes < start ? minutes + 1440 : minutes;
}


function normalizeDriverLocation(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/donnybrook/g, "d'brook")
    .replace(/dbrk/g, "d'brook")
    .replace(/d brook/g, "d'brook")
    .replace(/eglington/g, 'eglinton')
    .replace(/\s+/g, ' ')
    .trim();
}

function timeToMinutes(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return 0;

  return Number(match[1]) * 60 + Number(match[2]);
}
function getLocationClass(location = '') {
  const value = location.toLowerCase();
  if (value.includes('northwood')) return 'northwood';
  if (value.includes('ballywaltrim')) return 'ballywaltrim';
  return '';
}

createRoot(document.getElementById('root')).render(<App />);