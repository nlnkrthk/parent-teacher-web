import React, { useEffect, useMemo, useState } from "react";
import { useUser } from '../contexts/UserContext';

const Announcements = () => {
  const { user } = useUser();
  const isTeacher = user?.role === 'teacher';
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/announcements');
        const data = await res.json();
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
      } catch (e) {
        setError('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    setError("");
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) {
      setError("Please provide both title and content.");
      return;
    }
    const post = async () => {
      try {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: trimmedTitle, content: trimmedContent, author: user?.name, role: user?.role })
        });
        if (!res.ok) throw new Error('Failed');
        // reload list
        const listRes = await fetch('/api/announcements');
        const data = await listRes.json();
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
        setTitle("");
        setContent("");
      } catch (e) {
        setError('Failed to create announcement');
      }
    };
    post();
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
          {loading ? (
            <p className="muted">Loading…</p>
          ) : formatted.length === 0 ? (
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
