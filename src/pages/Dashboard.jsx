import React, { useEffect, useMemo, useState } from "react";
import { useUser } from '../contexts/UserContext';

const ANNOUNCEMENTS_KEY = 'announcements';
const ASSIGNMENTS_KEY = 'assignments';
const SUBMISSIONS_KEY = 'assignment_submissions';

const Dashboard = () => {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    try {
      const rawA = localStorage.getItem(ANNOUNCEMENTS_KEY);
      if (rawA) {
        const parsed = JSON.parse(rawA);
        if (Array.isArray(parsed)) setAnnouncements(parsed);
      }
    } catch {}
    try {
      const rawAsg = localStorage.getItem(ASSIGNMENTS_KEY);
      if (rawAsg) {
        const parsed = JSON.parse(rawAsg);
        if (Array.isArray(parsed)) setAssignments(parsed);
      }
    } catch {}
    try {
      const rawS = localStorage.getItem(SUBMISSIONS_KEY);
      if (rawS) {
        const parsedS = JSON.parse(rawS);
        if (parsedS && typeof parsedS === 'object') setSubmissions(parsedS);
      }
    } catch {}
  }, []);

  const recentAnnouncements = useMemo(() => {
    return announcements
      .map(a => ({ ...a, when: new Date(a.createdAt) }))
      .sort((a, b) => b.when.getTime() - a.when.getTime())
      .slice(0, 3);
  }, [announcements]);

  const userId = user?.id || 'parent';
  const recentAssignments = useMemo(() => {
    return assignments
      .map(a => ({ ...a, due: new Date(a.dueDate) }))
      .sort((a, b) => a.due.getTime() - b.due.getTime())
      .slice(0, 3);
  }, [assignments]);

  return (
    <div className="container">
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Recent Announcements</h3>
          {recentAnnouncements.length === 0 ? (
            <p className="muted">No recent announcements</p>
          ) : (
            recentAnnouncements.map(a => (
              <div key={a.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong>{a.title}</strong>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{a.when.toLocaleString()}</span>
                </div>
                <div className="muted" style={{ marginTop: '0.25rem' }}>{a.content.length > 100 ? a.content.slice(0, 100) + '…' : a.content}</div>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Upcoming Events</h3>
          <p className="muted">No upcoming events</p>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Assignments</h3>
          {recentAssignments.length === 0 ? (
            <p className="muted">No assignments</p>
          ) : (
            recentAssignments.map(a => {
              const isSubmitted = !!(submissions[userId]?.[a.id]);
              return (
                <div key={a.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <strong>{a.title}</strong>
                    <span className="muted" style={{ fontSize: '0.85rem' }}>Due {a.due.toLocaleDateString()}</span>
                  </div>
                  <div className="muted" style={{ marginTop: '0.25rem' }}>{a.subject}</div>
                  {user?.role !== 'teacher' && (
                    <div className="muted" style={{ marginTop: '0.25rem' }}>Status: {isSubmitted ? 'Submitted' : 'Pending'}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
