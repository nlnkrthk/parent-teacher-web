import { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';

const STORAGE_KEY = 'events';

const Calendar = () => {
  const { user } = useUser();
  const isTeacher = user?.role === 'teacher';
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEvents(parsed);
      }
    } catch {}
  }, []);

  const saveEvents = (list) => {
    setEvents(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    const t = title.trim();
    const d = date.trim();
    const tm = time.trim();
    if (!t || !d || !tm) {
      setError('Please fill title, date and time.');
      return;
    }
    const iso = new Date(`${d}T${tm}:00`).toISOString();
    const newEvent = {
      id: crypto.randomUUID(),
      title: t,
      description: description.trim(),
      dateTime: iso,
      author: user?.name || 'Teacher',
      role: user?.role || 'teacher',
      createdAt: new Date().toISOString()
    };
    const next = [newEvent, ...events];
    saveEvents(next);
    setShowModal(false);
    setTitle('');
    setDate('');
    setTime('');
    setDescription('');
  };

  const monthEvents = useMemo(() => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    return events
      .map(ev => ({ ...ev, dt: new Date(ev.dateTime) }))
      .filter(ev => ev.dt.getFullYear() === y && ev.dt.getMonth() === m)
      .sort((a, b) => a.dt.getTime() - b.dt.getTime());
  }, [events, currentMonth]);

  const monthLabel = useMemo(() => {
    return currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [currentMonth]);

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>School Calendar — {monthLabel}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isTeacher && <button className="button" onClick={() => setShowModal(true)}>Add Event</button>}
            <button className="button ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>Prev</button>
            <button className="button" onClick={() => setCurrentMonth(new Date())}>Today</button>
            <button className="button ghost" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>Next</button>
          </div>
        </div>
        <div className="muted" style={{ marginTop: '0.75rem' }}>Events are visible to both teachers and parents.</div>

        <div style={{ marginTop: '1rem' }}>
          {monthEvents.length === 0 ? (
            <div className="card muted">No events this month</div>
          ) : (
            monthEvents.map(ev => (
              <div key={ev.id} className="card" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ margin: 0 }}>{ev.title}</h3>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{ev.dt.toLocaleString()}</span>
                </div>
                {ev.description && <p style={{ marginTop: '0.5rem' }}>{ev.description}</p>}
                <div className="muted" style={{ fontSize: '0.85rem' }}>By {ev.author}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Add Event</h3>
              <button className="button ghost" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Parent-Teacher Meeting" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="field">
                  <label>Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="field">
                  <label>Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about the event" />
              </div>
              {error && <div className="muted" style={{ color: '#fca5a5' }}>{error}</div>}
              <div className="modal-actions">
                <button className="button ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="button" type="submit">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
