import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';

const STORAGE_ATTENDANCE = 'attendance_records';
const STORAGE_STUDENTS = 'students_list';

const defaultStudents = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
  { id: '3', name: 'Charlie Lee' },
];

const Attendance = () => {
  const { user } = useUser();
  const isTeacher = user?.role === 'teacher';

  const [students, setStudents] = useState(defaultStudents);
  const [records, setRecords] = useState({}); // { studentId: { 'YYYY-MM-DD': true|false } }
  const [selectedStudent, setSelectedStudent] = useState(defaultStudents[0]?.id || '1');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [present, setPresent] = useState(true);

  useEffect(() => {
    try {
      const rawS = localStorage.getItem(STORAGE_STUDENTS);
      if (rawS) {
        const parsedS = JSON.parse(rawS);
        if (Array.isArray(parsedS)) setStudents(parsedS);
      } else {
        localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(defaultStudents));
      }
    } catch {}
    (async () => {
      const sid = (user?.role === 'teacher' ? selectedStudent : (user?.id || defaultStudents[0].id));
      if (!sid) return;
      try {
        const res = await fetch(`/api/attendance?studentId=${encodeURIComponent(sid)}`);
        const data = await res.json();
        const map = { [sid]: {} };
        (data.records || []).forEach(r => { map[sid][r.Day?.slice(0,10) || r.day] = !!(r.Present ?? r.present); });
        setRecords(map);
      } catch {}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent]);

  const saveRecords = (map) => {
    setRecords(map);
    try { localStorage.setItem(STORAGE_ATTENDANCE, JSON.stringify(map)); } catch {}
  };

  const markAttendance = (e) => {
    e.preventDefault();
    const sid = selectedStudent;
    const day = date;
    (async () => {
      try {
        const res = await fetch('/api/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: sid, day, present })
        });
        if (!res.ok) throw new Error('Failed');
        const list = await fetch(`/api/attendance?studentId=${encodeURIComponent(sid)}`);
        const data = await list.json();
        const map = { [sid]: {} };
        (data.records || []).forEach(r => { map[sid][r.Day?.slice(0,10) || r.day] = !!(r.Present ?? r.present); });
        setRecords(map);
      } catch {}
    })();
  };

  const studentIdForView = isTeacher ? selectedStudent : (user?.id || defaultStudents[0].id);
  const summary = useMemo(() => {
    const rec = records[studentIdForView] || {};
    const days = Object.keys(rec);
    const presentDays = days.filter(d => rec[d] === true).length;
    const absentDays = days.filter(d => rec[d] === false).length;
    const total = presentDays + absentDays;
    const percentage = total === 0 ? 0 : Math.round((presentDays / total) * 100);
    return { presentDays, absentDays, total, percentage };
  }, [records, studentIdForView]);

  const studentName = useMemo(() => {
    const s = students.find(s => s.id === studentIdForView);
    return s ? s.name : 'Student';
  }, [students, studentIdForView]);

  const recentRecords = useMemo(() => {
    const rec = records[studentIdForView] || {};
    return Object.entries(rec)
      .map(([d, val]) => ({ date: d, present: !!val }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [records, studentIdForView]);

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Attendance</h2>
          {isTeacher && (
            <form onSubmit={markAttendance} style={{ display: 'flex', alignItems: 'end', gap: '0.5rem' }}>
              <div>
                <label>Student</label>
                <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label>Status</label>
                <select value={present ? 'present' : 'absent'} onChange={(e) => setPresent(e.target.value === 'present')}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div style={{ alignSelf: 'center', paddingTop: '1.25rem' }}>
                <button className="button" type="submit">Mark</button>
              </div>
            </form>
          )}
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Summary — {studentName}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="card">
              <div className="muted">Present Days</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.presentDays}</div>
            </div>
            <div className="card">
              <div className="muted">Absent Days</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.absentDays}</div>
            </div>
            <div className="card">
              <div className="muted">Total Marked</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.total}</div>
            </div>
            <div className="card">
              <div className="muted">Attendance %</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{summary.percentage}%</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Recent Records</h3>
          {recentRecords.length === 0 ? (
            <div className="muted">No records yet</div>
          ) : (
            recentRecords.map((r) => (
              <div key={r.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span>{new Date(r.date).toLocaleDateString()}</span>
                <span className="muted">{r.present ? 'Present' : 'Absent'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;


