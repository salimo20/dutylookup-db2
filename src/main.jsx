import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, CalendarDays, Ticket, ArrowLeft, Coffee, Flag, Play } from 'lucide-react';
import { normalizeRoster, resolveDutyFromRoster } from './lib/rosterResolver.js';
import { findDemoDuty } from './lib/demoData.js';
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

  function searchDuty() {
    const roster = normalizeRoster(rosterInput);
    const resolved = resolveDutyFromRoster(roster);
    const found = findDemoDuty(roster, dayType);

    setDuty(found || {
      roster_number: roster,
      route: 'E1',
      display_duty_number: resolved.resolvedDutyNumber || '---',
      shift_type: resolved.shiftHint === 'BOGEY' ? 'BOGEY' : 'EARLY',
      events: []
    });

    setPage('card');
  }

  if (page === 'search') {
    return (
      <main className="screen search-screen">
        <h1>Duty Lookup</h1>

        <label>Roster Number</label>
        <input value={rosterInput} onChange={(e) => setRosterInput(e.target.value)} placeholder="DZ4/23" />

        <label>Day</label>
        <div className="day-buttons">
          {Object.entries(dayLabels).map(([key, label]) => (
            <button key={key} className={dayType === key ? 'active' : ''} onClick={() => setDayType(key)}>
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
  const ticket = duty.display_duty_number || duty.duty_number || duty.ticket_machine_number || '---';
  const today = new Date().toLocaleDateString('en-IE');

  return (
    <main className="screen card-screen">
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={18} /> Back
      </button>

      <h2>{dayLabels[dayType]}</h2>

      <div className="mini-row">
        <span><CalendarDays size={16} /> {today}</span>
        <span><Ticket size={16} /> {ticket}</span>
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
          <strong className={`shift ${String(duty.shift_type || '').toLowerCase()}`}>{duty.shift_type || 'SHIFT'}</strong>
        </div>
      </div>

      <section className="timeline">
        {(duty.events || []).map((event, index) => (
          <TimelineItem event={event} key={index} />
        ))}
      </section>

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

  return (
    <div className="timeline-item">
      <span className="dot" />
      <div>
        <strong>{event.event_time} <span className={locationClass}>{event.location}</span></strong>
      </div>
    </div>
  );
}

function getLocationClass(location = '') {
  const value = location.toLowerCase();
  if (value.includes('northwood')) return 'northwood';
  if (value.includes('ballywaltrim')) return 'ballywaltrim';
  return '';
}

createRoot(document.getElementById('root')).render(<App />);