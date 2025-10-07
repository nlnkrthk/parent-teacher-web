import React, { useEffect, useMemo, useState } from "react";
import { useUser } from '../contexts/UserContext';

const STORAGE_KEY = 'announcements';

const Announcements = () => {
  const { user } = useUser();
  const isTeacher = user?.role === 'teacher';
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setAnnouncements(parsed);
      }
    } catch {}
  }, []);

  const saveAnnouncements = (list) => {
    setAnnouncements(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setError("Please provide both title and content.");
      return;
    }
    const newAnnouncement = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      content: trimmedContent,
      author: user?.name || 'Teacher',
      role: user?.role || 'teacher',
      createdAt: new Date().toISOString()
    };
    const next = [newAnnouncement, ...announcements];
    saveAnnouncements(next);
    setTitle("");
    setContent("");
  };

  const formatted = useMemo(() => {
    return announcements.map(a => ({
      ...a,
      when: new Date(a.createdAt).toLocaleString()
    }));
  }, [announcements]);

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Announcements</h2>
        </div>
        {isTeacher && (
          <form onSubmit={handleCreate} className="card" style={{ marginTop: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Create announcement</h3>
            <div className="field">
              <label>Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title" />
            </div>
            <div className="field">
              <label>Content</label>
              <textarea rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the announcement..." />
            </div>
            {error && <div className="muted" style={{ color: '#fca5a5' }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button className="button" type="submit">Publish</button>
            </div>
          </form>
        )}
        <div className="announcements-list" style={{ marginTop: '1rem' }}>
          {formatted.length === 0 ? (
            <p className="muted">No announcements yet</p>
          ) : (
            formatted.map((a) => (
              <div key={a.id} className="card" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ margin: 0 }}>{a.title}</h3>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{a.when}</span>
                </div>
                <p style={{ marginTop: '0.5rem' }}>{a.content}</p>
                <div className="muted" style={{ fontSize: '0.85rem' }}>By {a.author} ({a.role})</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
