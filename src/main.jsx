import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, CalendarDays, Ticket, Route, Clock, MapPin, Repeat2, Coffee, Flag, LogIn, UploadCloud, Database, ShieldAlert } from 'lucide-react';
import { normalizeRoster, resolveDutyFromRoster } from './lib/rosterResolver.js';
import { hasSupabaseConfig, supabase } from './lib/supabaseClient.js';
import { findDemoDuty } from './lib/demoData.js';
import './styles.css';

const dayLabels = {
  weekday: 'Monday–Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

function eventIcon(type) {
  if (type === 'BREAK_START' || type === 'RESUME') return <Coffee size={18} />;
  if (type === 'HAND_OVER' || type === 'TAKE_OVER') return <Repeat2 size={18} />;
  if (type === 'FINISH') return <Flag size={18} />;
  if (type === 'SIGN_ON' || type === 'START') return <Clock size={18} />;
  return <MapPin size={18} />;
}

function App() {
  const [rosterInput, setRosterInput] = useState('DZ4/23');
  const [dayType, setDayType] = useState('weekday');
  const [duty, setDuty] = useState(findDemoDuty('DZ4/23', 'weekday'));
  const [status, setStatus] = useState('Demo data loaded. Connect Supabase after running the SQL schema.');

  const resolver = useMemo(() => resolveDutyFromRoster(rosterInput), [rosterInput]);

  async function searchDuty() {
    const roster = normalizeRoster(rosterInput);
    const resolved = resolveDutyFromRoster(roster);

    setStatus(`Searching ${roster} • ${dayLabels[dayType]} • rule ${resolved.rule}`);

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
          setStatus('Loaded from Supabase.');
          return;
        }
      }
    }

    const demo = findDemoDuty(roster, dayType);
    if (demo) {
      setDuty(demo);
      setStatus('Loaded from local demo data.');
    } else {
      setDuty(null);
      setStatus(`No duty found yet. Resolver result: ${resolved.resolvedDutyNumber || 'lookup table required'}`);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">DB2 Driver Duty Lookup</p>
          <h1>DutyLookup DB2</h1>
          <p className="subtitle">Search by roster number. The app resolves the ticket-machine duty number and displays the full driver exchange timeline.</p>
        </div>
        <div className="warning"><ShieldAlert size={18} /> Do not use while driving.</div>
      </section>

      <section className="grid">
        <div className="panel search-panel">
          <h2><Search size={20} /> Search Duty</h2>
          <label>Roster Number</label>
          <input value={rosterInput} onChange={(e) => setRosterInput(e.target.value)} placeholder="DZ4/23" />

          <label>Day Type</label>
          <div className="day-buttons">
            {Object.entries(dayLabels).map(([key, label]) => (
              <button key={key} className={dayType === key ? 'active' : ''} onClick={() => setDayType(key)}>{label}</button>
            ))}
          </div>

          <button className="primary" onClick={searchDuty}>Search</button>

          <div className="resolver-box">
            <strong>Resolver</strong>
            <span>Roster: {resolver.roster || '—'}</span>
            <span>Zone: {resolver.zone || '—'}</span>
            <span>Duty: {resolver.resolvedDutyNumber || 'table lookup'}</span>
            <span>Rule: {resolver.rule}</span>
          </div>
          <p className="status">{status}</p>
        </div>

        <DutyCard duty={duty} dayType={dayType} />
      </section>

      <section className="panel admin-note">
        <h2><UploadCloud size={20} /> Admin Roadmap</h2>
        <p>Upload each new Dublin Bus bill as a new duty-book version. Import, verify, then activate. The driver app stays the same when routes or times change.</p>
        <div className="chips"><span>DZ4 E1/X1</span><span>DZ5 7/7A/7B/47</span><span>L25 standalone</span><span>Future DB1/BG</span></div>
      </section>
    </main>
  );
}

function DutyCard({ duty, dayType }) {
  if (!duty) {
    return <div className="panel duty-card empty"><Database size={36} /><h2>No duty loaded</h2><p>Import the real Excel data or use demo roster DZ4/23.</p></div>;
  }

  const takeovers = (duty.events || []).filter(e => e.event_type === 'TAKE_OVER');
  const handovers = (duty.events || []).filter(e => e.event_type === 'HAND_OVER');

  return (
    <div className="panel duty-card">
      <div className="card-top">
        <div><p className="eyebrow">{duty.garage} • {duty.zone}</p><h2>{dayLabels[dayType] || duty.day_type}</h2></div>
        <span className="shift">{duty.shift_type || 'SHIFT'}</span>
      </div>

      <div className="duty-number-box">
        <Ticket size={28} />
        <div><p>Ticket Machine Duty Number</p><strong>{duty.display_duty_number || duty.duty_number}</strong><span>Enter this number on the ticket machine</span></div>
      </div>

      <div className="facts">
        <Fact label="Roster" value={duty.roster_number} />
        <Fact label="Route" value={duty.route} icon={<Route size={16} />} />
        <Fact label="Ticket Machine" value={duty.ticket_machine_number || '000'} />
        <Fact label="Sign On" value={`${duty.sign_on_time || '—'} • ${duty.sign_on_location || ''}`} />
        <Fact label="Finish" value={`${duty.finish_time || '—'} • ${duty.finish_location || ''}`} />
      </div>

      {(takeovers.length || handovers.length) ? (
        <section className="exchange-section">
          <h3><Repeat2 size={18} /> Driver Exchange</h3>
          {takeovers.map((e, idx) => <Exchange key={`t-${idx}`} title="Take over from" duty={e.from_duty_number} time={e.event_time} location={e.location} />)}
          {handovers.map((e, idx) => <Exchange key={`h-${idx}`} title="Hand over to" duty={e.to_duty_number} time={e.event_time} location={e.location} />)}
        </section>
      ) : null}

      <section className="timeline">
        <h3><CalendarDays size={18} /> Timeline</h3>
        {(duty.events || []).map((event, index) => (
          <div className={`event ${event.event_type?.toLowerCase()}`} key={index}>
            <div className="event-icon">{eventIcon(event.event_type)}</div>
            <div className="event-time">{event.event_time}</div>
            <div className="event-body"><strong>{event.location}</strong><span>{event.event_type?.replaceAll('_', ' ')}</span>{event.notes && <small>{event.notes}</small>}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Fact({ label, value, icon }) {
  return <div className="fact"><span>{icon}{label}</span><strong>{value || '—'}</strong></div>;
}

function Exchange({ title, duty, time, location }) {
  return <div className="exchange-card"><span>{title}</span><strong>Duty {duty || '—'}</strong><small>{time || '—'} • {location || '—'}</small></div>;
}

createRoot(document.getElementById('root')).render(<App />);
