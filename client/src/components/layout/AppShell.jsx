import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { navFor } from '../../utils/navigation';
import { Avatar } from '../common/ui';

const ICONS = {
  grid: '▦',
  users: '◎',
  route: '→',
  check: '✓',
  file: '▤',
  cap: '🎓',
  laptop: '💻',
  bell: '🔔',
  chart: '📊',
  shield: '🛡',
  list: '☰',
  gear: '⚙',
  help: '?',
  user: '◍',
};

const Icon = ({ name }) => <span aria-hidden="true">{ICONS[name] ?? '•'}</span>;

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 16px 8px' }}>
      <span
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: 'var(--surface)',
          boxShadow: 'var(--neo-md)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        E
      </span>
      <span style={{ fontWeight: 750, fontSize: '1.1rem', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
        EOMS
      </span>
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const nav = navFor(user?.roles);

  const renderNavList = () => (
    <nav aria-label="Primary">
      {nav.map(({ section, items }) => (
        <div key={section} style={{ marginTop: 'var(--sp-4)' }}>
          <div
            className="meta"
            style={{
              padding: '8px 12px',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              fontWeight: 700,
            }}
          >
            {section}
          </div>
          {items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setDrawerOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                marginBottom: 4,
                borderRadius: 'var(--r-sm)',
                fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--text-2)',
                background: isActive ? 'var(--surface-white)' : 'transparent',
                boxShadow: isActive ? 'var(--neo-sm)' : 'none',
              })}
            >
              <Icon name={item.icon} /> {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: 'var(--sidebar-w)',
          flexShrink: 0,
          padding: 'var(--sp-5) var(--sp-4)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          borderRight: '1px solid rgba(163,177,198,.2)',
        }}
        className="eoms-sidebar"
      >
        <Logo />
        {renderNavList()}
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header
          className="eoms-topbar"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-3)',
            padding: 'var(--sp-3) var(--sp-5)',
            background: 'var(--surface)',
            boxShadow: '0 2px 10px rgba(163,177,198,.2)',
          }}
        >
          <button
            className="eoms-menu-btn pressable"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              padding: '6px 10px',
              borderRadius: 'var(--r-sm)',
              boxShadow: 'var(--neo-sm)',
              fontSize: '1.2rem',
            }}
          >
            ☰
          </button>

          <nav aria-label="Breadcrumb" className="meta" style={{ marginLeft: 8 }}>
            Home / {pathname.split('/').filter(Boolean).join(' / ') || 'Dashboard'}
          </nav>

          <div style={{ flex: 1 }} />

          <input
            className="eoms-search"
            type="search"
            placeholder="Search employees, tasks, documents…  ⌘K"
            aria-label="Global search"
            style={{
              maxWidth: 340,
              width: '100%',
              padding: '9px 16px',
              borderRadius: 'var(--r-full)',
              background: 'var(--surface-sunken)',
              boxShadow: 'var(--neo-in-sm)',
              border: 'none',
              color: 'var(--text-1)',
              fontSize: '.875rem',
            }}
          />

          <button
            aria-label={`Notifications (3 unread)`}
            className="pressable"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              boxShadow: 'var(--neo-sm)',
              position: 'relative',
              fontSize: 17,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            🔔
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 17,
                height: 17,
                borderRadius: '50%',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              3
            </span>
          </button>

          <button
            className="pressable"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--r-sm)',
              boxShadow: 'var(--neo-sm)',
              fontWeight: 600,
              fontSize: '.875rem',
              color: 'var(--primary)',
            }}
          >
            + Quick Action
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
            <Avatar name={user?.username || 'User'} size={38} />
            <div className="eoms-user-meta">
              <div style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--text-1)' }}>
                {user?.username || 'Guest'}
              </div>
              <div className="meta">{user?.roles?.[0]?.replaceAll('_', ' ') || 'Guest'}</div>
            </div>
            <button
              onClick={logout}
              className="caption pressable"
              aria-label="Log out"
              style={{
                color: 'var(--text-3)',
                padding: '6px 10px',
                borderRadius: 'var(--r-sm)',
                boxShadow: 'var(--neo-sm)',
                marginLeft: 4,
              }}
            >
              Log out
            </button>
          </div>
        </header>

        <main
          style={{
            flex: 1,
            padding: 'var(--sp-5) var(--sp-6)',
            maxWidth: 1440,
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(45,49,66,.4)' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 280,
              height: '100%',
              background: 'var(--surface)',
              boxShadow: 'var(--neo-lg)',
              padding: 'var(--sp-5) var(--sp-4)',
              overflowY: 'auto',
            }}
          >
            <Logo />
            {renderNavList()}
          </div>
        </div>
      )}
    </div>
  );
}
