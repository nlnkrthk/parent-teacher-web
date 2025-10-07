import { Outlet, NavLink } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Layout = () => {
  const { user, logout } = useUser();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">Parent–Teacher</div>
          <div className="muted" style={{ fontSize: '0.85rem' }}>
            Portal
          </div>
        </div>
        <nav className="nav">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Dashboard</NavLink>
          <NavLink to="/announcements" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Announcements</NavLink>
          <NavLink to="/assignments" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Assignments</NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Calendar</NavLink>
          <NavLink to="/attendance" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Attendance</NavLink>
        </nav>
      </aside>
      <div>
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>Welcome, {user?.name}</span>
            {user?.role && (
              <span style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                fontSize: '0.8rem',
                color: 'var(--text)',
                background: 'rgba(59, 130, 246, 0.12)'
              }}>{user.role}</span>
            )}
          </div>
          <button className="button ghost" onClick={logout}>Logout</button>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
