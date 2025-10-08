import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';

const STORAGE_SUBMISSIONS = 'assignment_submissions';

const Assignments = () => {
  const { user } = useUser();
  const isTeacher = user?.role === 'teacher';

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/assignments');
        const data = await res.json();
        setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      } catch {}
    })();
    try {
      const rawS = localStorage.getItem(STORAGE_SUBMISSIONS);
      if (rawS) {
        const parsedS = JSON.parse(rawS);
        if (parsedS && typeof parsedS === 'object') setSubmissions(parsedS);
      }
    } catch {}
  }, []);

  const refreshAssignments = async () => {
    try {
      const res = await fetch('/api/assignments');
      const data = await res.json();
      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
    } catch {}
  };

  const saveSubmissions = (map) => {
    setSubmissions(map);
    try { localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(map)); } catch {}
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    const s = subject.trim();
    const t = title.trim();
    const d = description.trim();
    const due = dueDate.trim();
    if (!s || !t || !d || !due) {
      setError('Please fill subject, title, description and due date.');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: s, title: t, description: d, dueDate: due, author: user?.name })
        });
        if (!res.ok) throw new Error('Failed');
        await refreshAssignments();
        setShowModal(false);
        setSubject(''); setTitle(''); setDescription(''); setDueDate('');
      } catch (e) {
        setError('Failed to create assignment');
      }
    })();
  };

  const userId = user?.id || 'parent';
  const toggleSubmission = (assignmentId) => {
    const current = submissions[userId] || {};
    const nextUser = { ...current, [assignmentId]: !(current[assignmentId]) };
    const next = { ...submissions, [userId]: nextUser };
    saveSubmissions(next);
  };

  const formatted = useMemo(() => {
    return assignments
      .map(a => ({ ...a, due: new Date(a.dueDate) }))
      .sort((a, b) => a.due.getTime() - b.due.getTime());
  }, [assignments]);

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Assignments</h2>
          {isTeacher && <button className="button" onClick={() => setShowModal(true)}>Create Assignment</button>}
        </div>
        <div className="muted" style={{ marginTop: '0.75rem' }}>Assignments appear for both teachers and parents.</div>

        <div style={{ marginTop: '1rem' }}>
          {formatted.length === 0 ? (
            <div className="card muted">No assignments yet</div>
          ) : (
            formatted.map(a => {
              const isSubmitted = !!(submissions[userId]?.[a.id]);
              return (
                <div key={a.id} className="card" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{a.title}</h3>
                      <div className="muted" style={{ fontSize: '0.9rem' }}>{a.subject} • Due {a.due.toLocaleDateString()}</div>
                    </div>
                    {!isTeacher && (
                      <button className="button" onClick={() => toggleSubmission(a.id)}>
                        {isSubmitted ? 'Submitted' : 'Mark as Submitted'}
                      </button>
                    )}
                  </div>
                  <p style={{ marginTop: '0.5rem' }}>{a.description}</p>
                  {!isTeacher && (
                    <div className="muted" style={{ fontSize: '0.9rem' }}>Status: {isSubmitted ? 'Submitted' : 'Pending'}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Create Assignment</h3>
              <button className="button ghost" onClick={() => setShowModal(false)}>Close</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Mathematics" />
              </div>
              <div className="field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Algebra Worksheet" />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions and details" />
              </div>
              <div className="field">
                <label>Due Date</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              {error && <div className="muted" style={{ color: '#fca5a5' }}>{error}</div>}
              <div className="modal-actions">
                <button className="button ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="button" type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignments;


