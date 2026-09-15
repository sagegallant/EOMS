import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { navFor } from '../../utils/navigation';
import { Avatar } from '../common/ui';
import {
  LayoutDashboard,
  Users,
  Compass,
  CheckSquare,
  FileText,
  GraduationCap,
  Laptop,
  Bell,
  BarChart3,
  ShieldCheck,
  ListFilter,
  Settings,
  HelpCircle,
  User,
  Search,
  LogOut,
  Menu,
  X,
  Building2,
  Sparkles,
} from 'lucide-react';

const ICON_MAP = {
  grid: LayoutDashboard,
  users: Users,
  route: Compass,
  check: CheckSquare,
  file: FileText,
  cap: GraduationCap,
  laptop: Laptop,
  bell: Bell,
  chart: BarChart3,
  shield: ShieldCheck,
  list: ListFilter,
  gear: Settings,
  help: HelpCircle,
  user: User,
};

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px 24px 8px' }}>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          display: 'grid',
          placeItems: 'center',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
        }}
      >
        E
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          EOMS
        </div>
        <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Employee Onboarding
        </div>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const nav = navFor(user?.roles);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavList = () => (
    <nav aria-label="Primary" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {nav.map(({ section, items }) => (
        <div key={section}>
          <div
            style={{
              padding: '6px 14px',
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
              color: '#64748B',
            }}
          >
            {section}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map(item => {
              const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawerOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '9px 14px',
                    borderRadius: 'var(--r-sm)',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    background: isActive ? 'rgba(79, 70, 229, 0.22)' : 'transparent',
                    borderLeft: isActive ? '3px solid #6366F1' : '3px solid transparent',
                    transition: 'all 150ms ease',
                  })}
                >
                  <IconComp size={17} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* ── Desktop Sidebar ───────────────────────────────────── */}
      <aside
        style={{
          width: 'var(--sidebar-w)',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid #1E293B',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        <Logo />

        <div style={{ flex: 1, overflowY: 'auto', margin: '0 -8px', padding: '0 8px' }}>
          {renderNavList()}
        </div>

        {/* Sidebar Footer User Info */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            borderTop: '1px solid #1E293B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Avatar name={user?.username || 'User'} size={34} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username || 'Employee'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                {user?.roles?.[0] || 'EMPLOYEE'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--r-sm)',
              display: 'grid',
              placeItems: 'center',
              color: '#94A3B8',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ── Topbar ─────────────────────────────────────────── */}
        <header
          style={{
            height: 'var(--topbar-h)',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 var(--sp-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 360px', maxWidth: 440 }}>
            {/* Mobile Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              style={{ display: 'none', padding: 6, color: 'var(--text-secondary)' }}
              className="mobile-hamburger"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>

            {/* Quick Search */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search employees, tasks, documents… (Ctrl + K)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 36px',
                  fontSize: '0.8125rem',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Tech Hub Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--r-full)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              <Building2 size={13} style={{ color: 'var(--primary)' }} />
              <span>Bengaluru Tech HQ 🇮🇳</span>
            </div>

            {/* Active Role Indicator */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--primary-light)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                color: 'var(--primary)',
                borderRadius: 'var(--r-full)',
                padding: '4px 12px',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={12} />
              {user?.roles?.[0] || 'EMPLOYEE'}
            </span>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/notifications')}
              title="Notifications"
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: 'var(--r-md)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--text-secondary)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                transition: 'all var(--t-fast) var(--ease)',
              }}
            >
              <Bell size={17} />
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--danger)',
                  boxShadow: '0 0 0 2px var(--bg-surface)',
                }}
              />
            </button>
          </div>
        </header>

        {/* ── Main Page Content ───────────────────────────────── */}
        <main style={{ flex: 1, padding: 'var(--sp-6)', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Drawer ─────────────────────────────────────── */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              width: 280,
              height: '100%',
              background: 'var(--bg-sidebar)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Logo />
              <button onClick={() => setDrawerOpen(false)} style={{ color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {renderNavList()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
