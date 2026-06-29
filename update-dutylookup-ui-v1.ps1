@'
import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, CalendarDays, Ticket, Coffee, Flag, ArrowLeft, Play, MapPin } from 'lucide-react';
import { normalizeRoster, resolveDutyFromRoster } from './lib/rosterResolver.js';
import { hasSupabaseConfig, supabase } from './lib/supabaseClient.js';
import { findDemoDuty } from './lib/demoData.js';
import './styles.css';

const dayLabels = {
  weekday: 'Monday–Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

function todayLabel() {
  return new Intl.DateTimeFormat('en-IE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());
}

function App() {
  const [page, setPage] = useState('search');
  const [rosterInput, setRosterInput] = useState('DZ4/23');
  const [dayType, setDayType] = useState('weekday');
  const [duty, setDuty] = useState(null);
  const [status, setStatus] = useState('');

  const resolver = useMemo(() => resolveDutyFromRoster(rosterInput), [rosterInput]);

  async function searchDuty() {
    const roster = normalizeRoster(rosterInput);
    setStatus('Searching duty...');

    if (hasSupabaseConfig) {
      const { data, error } = await supabase
        .from('duty_cards')
        .select('*')
        .eq('roster_number', roster)
        .eq('day_type', dayType)
        .eq('is_active', true)
        .maybeSingle();

      if (!error && data) {
        const { data: events, error: eventsError } = await supabase
          .from('timeline_events')
          .select('*')
          .eq('duty_id', data.duty_id)
          .order('sequence', { ascending: true });

        if (!eventsError) {
          setDuty({ ...data, events: events || [] });
          setPage('card');
          setStatus('');
          return;
        }
      }
    }

    const demo = findDemoDuty(roster, dayType);
    if (demo) {
      setDuty(demo);
      setPage('card');
      setStatus('');
    } else {
      setDuty(null);
      setStatus(`No duty found yet. Resolver: ${resolver.resolvedDutyNumber || 'table lookup required'}`);
    }
  }

  return (
    <main className="app-shell">
      {page === 'search' ? (
        <SearchPage
          rosterInput={rosterInput}
          setRosterInput={setRosterInput}
          dayType={dayType}
          setDayType={setDayType}
          status={status}
          onSearch={searchDuty}
        />
      ) : (
        <DutyPage duty={duty} dayType={dayType} onBack={() => setPage('search')} />
      )}
    </main>
  );
}

function SearchPage({ rosterInput, setRosterInput, dayType, setDayType, status, onSearch }) {
  return (
    <section className="search-page">
      <div className="search-card">
        <div className="brand">DUTY LOOKUP</div>

        <label>Roster Number</label>
        <input
          value={rosterInput}
          onChange={(e) => setRosterInput(e.target.value)}
          placeholder="DZ4/23"
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />

        <label>Day</label>
        <div className="day-buttons">
          {Object.entries(dayLabels).map(([key, label]) => (
            <button key={key} className={dayType === key ? 'active' : ''} onClick={() => setDayType(key)}>
              {label}
            </button>
          ))}
        </div>

        <button className="primary" onClick={onSearch}>
          <Search size={18} /> Search Duty
        </button>

        {status ? <p className="status">{status}</p> : null}
      </div>
      <SafetyNotice />
    </section>
  );
}

function DutyPage({ duty, dayType, onBack }) {
  if (!duty) {
    return (
      <section className="card-page">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
        <div className="duty-card"><p>No duty loaded.</p></div>
        <SafetyNotice />
      </section>
    );
  }

  const ticket = duty.display_duty_number || duty.ticket_machine_number || duty.duty_number || '---';

  return (
    <section className="card-page">
      <button className="back-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
      <div className="duty-card">
        <div className="day-title">{dayLabels[dayType] || duty.day_type}</div>

        <div className="meta-row">
          <span><CalendarDays size={16} /> {todayLabel()}</span>
          <span><Ticket size={16} /> {ticket}</span>
        </div>

        <div className="route-block">
          <span>Route</span>
          <strong>{duty.route || '—'}</strong>
        </div>

        <div className="info-row">
          <div><span>Roster</span><strong>{duty.roster_number}</strong></div>
          <ShiftBadge value={duty.shift_type} />
        </div>

        <Timeline duty={duty} ticket={ticket} />
      </div>
      <SafetyNotice />
    </section>
  );
}

function ShiftBadge({ value }) {
  const shift = (value || 'SHIFT').toUpperCase();
  return <div className={`shift-badge ${shift.toLowerCase()}`}>{shift}</div>;
}

function Timeline({ duty, ticket }) {
  const events = duty.events || [];
  const handovers = events.filter(e => e.event_type === 'HAND_OVER');
  const takeovers = events.filter(e => e.event_type === 'TAKE_OVER');
  const visible = events.filter(e => !['HAND_OVER', 'TAKE_OVER', 'SIGN_ON'].includes(e.event_type));

  function exchangeFor(event) {
    if (event.event_type === 'BREAK_START') {
      const h = handovers.find(x => samePoint(x, event)) || handovers[0];
      return h?.to_duty_number ? { label: 'Break', text: `${shortDuty(ticket)} → ${shortDuty(h.to_duty_number)}` } : { label: 'Break', text: event.notes };
    }
    if (event.event_type === 'RESUME') {
      const t = takeovers.find(x => samePoint(x, event)) || takeovers[0];
      return t?.from_duty_number ? { label: 'Resume', text: `${shortDuty(t.from_duty_number)} → ${shortDuty(ticket)}` } : { label: 'Resume', text: event.notes };
    }
    if (event.event_type === 'FINISH') {
      const h = handovers.find(x => samePoint(x, event)) || handovers[handovers.length - 1];
      return h?.to_duty_number ? { label: 'Finish', text: `${shortDuty(ticket)} → ${shortDuty(h.to_duty_number)}` } : { label: 'Finish', text: event.notes };
    }
    return null;
  }

  return (
    <section className="timeline">
      {visible.map((event, index) => {
        const exchange = exchangeFor(event);
        const locClass = locationClass(event.location);
        return (
          <div className={`event ${event.event_type?.toLowerCase() || ''}`} key={index}>
            <div className="event-marker">{markerIcon(event.event_type)}</div>
            <div className="event-content">
              <div className="event-main">
                <strong>{event.event_time}</strong>
                <span className={locClass}>{event.location}</span>
              </div>
              {exchange ? (
                <div className="exchange-line">
                  <b>{exchange.label}</b>
                  {exchange.text ? <em>{exchange.text}</em> : null}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function samePoint(a, b) {
  return a.event_time === b.event_time && String(a.location || '').toLowerCase() === String(b.location || '').toLowerCase();
}

function shortDuty(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return String(value || '—');
  return String(Number(digits.slice(-3)));
}

function locationClass(location = '') {
  const value = location.toLowerCase();
  if (value.includes('northwood')) return 'loc-red';
  if (value.includes('ballywaltrim')) return 'loc-blue';
  return '';
}

function markerIcon(type) {
  if (type === 'BREAK_START') return <Coffee size={17} />;
  if (type === 'RESUME') return <Play size={17} />;
  if (type === 'FINISH') return <Flag size={17} />;
  return <MapPin size={17} />;
}

function SafetyNotice() {
  return <p className="safety">⚠️ Do not use mobile while driving.</p>;
}

createRoot(document.getElementById('root')).render(<App />);
'@ | Set-Content -Encoding UTF8 src\main.jsx

@'
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #ecfeff;
  background: #020617;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(20,184,166,.20), transparent 24rem),
    radial-gradient(circle at bottom right, rgba(59,130,246,.12), transparent 26rem),
    #020617;
}
button, input { font: inherit; }
.app-shell {
  width: min(520px, calc(100% - 24px));
  margin: 0 auto;
  padding: 22px 0 34px;
}
.search-page, .card-page { min-height: calc(100vh - 56px); display: grid; align-content: center; gap: 14px; }
.search-card, .duty-card {
  border: 1px solid rgba(103,232,249,.16);
  background: linear-gradient(180deg, rgba(15,23,42,.92), rgba(2,6,23,.94));
  box-shadow: 0 24px 70px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.04);
  border-radius: 30px;
  padding: 24px;
}
.brand { text-align: center; font-size: 30px; font-weight: 950; letter-spacing: .14em; margin: 4px 0 26px; }
label { display: block; color: #94a3b8; margin: 16px 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: .14em; }
input {
  width: 100%;
  padding: 17px 18px;
  border-radius: 18px;
  border: 1px solid rgba(103,232,249,.25);
  background: rgba(2,6,23,.9);
  color: #fff;
  outline: none;
  font-size: 24px;
  text-transform: uppercase;
  font-weight: 800;
}
input:focus { border-color: #22d3ee; box-shadow: 0 0 0 4px rgba(34,211,238,.12); }
.day-buttons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.day-buttons button, .primary, .back-button {
  border: 0;
  color: #dbeafe;
  background: rgba(30,41,59,.82);
  padding: 13px 10px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 800;
}
.day-buttons button.active { color: #031314; background: linear-gradient(90deg, #22d3ee, #a7f3d0); }
.primary {
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  background: linear-gradient(90deg, #06b6d4, #14b8a6);
  color: white;
}
.status { color: #fbbf24; line-height: 1.4; text-align: center; }
.safety { color: #94a3b8; text-align: center; font-size: 13px; margin: 0; }
.back-button { display: inline-flex; align-items: center; gap: 8px; justify-self: start; padding: 10px 13px; }
.day-title { color: #a7f3d0; text-transform: uppercase; letter-spacing: .14em; font-size: 12px; font-weight: 900; text-align: center; margin-bottom: 14px; }
.meta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 18px;
}
.meta-row span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px;
  border-radius: 16px;
  background: rgba(15,23,42,.74);
  color: #dbeafe;
  font-weight: 900;
}
.route-block {
  text-align: center;
  padding: 18px;
  border-top: 1px solid rgba(148,163,184,.12);
  border-bottom: 1px solid rgba(148,163,184,.12);
  margin-bottom: 14px;
}
.route-block span { display: block; color: #94a3b8; text-transform: uppercase; letter-spacing: .18em; font-size: 12px; }
.route-block strong { display: block; font-size: 54px; line-height: 1; margin-top: 6px; }
.info-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.info-row span { display: block; color: #94a3b8; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; }
.info-row strong { font-size: 20px; }
.shift-badge { padding: 10px 13px; border-radius: 999px; background: rgba(168,85,247,.20); border: 1px solid rgba(196,181,253,.32); color: #ddd6fe; font-weight: 950; }
.shift-badge.bogey { background: rgba(245,158,11,.16); color: #fbbf24; border-color: rgba(251,191,36,.3); }
.shift-badge.night { background: rgba(99,102,241,.18); color: #c7d2fe; border-color: rgba(165,180,252,.3); }
.shift-badge.late { background: rgba(239,68,68,.14); color: #fca5a5; border-color: rgba(252,165,165,.3); }
.timeline { margin-top: 8px; }
.event { display: grid; grid-template-columns: 34px 1fr; gap: 12px; padding: 13px 0; border-bottom: 1px solid rgba(148,163,184,.10); }
.event-marker { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: rgba(34,211,238,.13); color: #67e8f9; margin-top: 1px; }
.break_start .event-marker { background: rgba(245,158,11,.17); color: #fbbf24; }
.resume .event-marker { background: rgba(34,197,94,.15); color: #86efac; }
.finish .event-marker { background: rgba(59,130,246,.18); color: #bfdbfe; }
.event-main { display: flex; gap: 12px; align-items: baseline; font-size: 17px; }
.event-main strong { min-width: 52px; color: #fef3c7; font-size: 18px; }
.event-main span { color: #ffffff; font-weight: 800; }
.event-main .loc-red { color: #f87171; }
.event-main .loc-blue { color: #60a5fa; }
.exchange-line { margin: 7px 0 0 64px; display: grid; gap: 2px; }
.exchange-line b { color: #ffffff; }
.exchange-line em { color: #a7f3d0; font-style: normal; font-weight: 950; font-size: 20px; }
@media (max-width: 430px) {
  .app-shell { width: min(100% - 18px, 520px); padding-top: 12px; }
  .search-card, .duty-card { padding: 20px; border-radius: 26px; }
  .day-buttons { grid-template-columns: 1fr; }
}
'@ | Set-Content -Encoding UTF8 src\styles.css

Write-Host "DutyLookup UI updated. Now run: npm.cmd run dev"
