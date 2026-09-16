/**
 * TopNav.jsx — Horizontal pill-tab navigation
 * Inspired by Crextio HR Dashboard (HR_Dashboard.webp)
 *
 * Layout:
 *   [EOMS Logo]  [Dashboard • People • Onboarding • Tasks …]  [🔔 Bell · Avatar]
 *
 * - Active tab: dark pill (#1C2128 bg, white text)
 * - Role-filtered tabs
 * - Notification bell with unread dot
 * - Mobile: hamburger → slide-down drawer
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, X, LogOut } from 'lucide-react';
import { tabsFor } from '../../utils/navigation';
import { Avatar } from '../common/ui';

export default function TopNav({ user, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const tabs = tabsFor(user?.roles || []);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout?.();
    navigate('/login');
  };

  return (
    <>
      {/* ── Nav Bar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        height: 'var(--nav-h)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-green)',
        boxShadow: '0 1px 0 rgba(22,163,74,0.08)',
        display: 'flex', alignItems: 'center',
        padding: '0 var(--page-px)',
        gap: 'var(--sp-6)',
      }}>
        {/* Logo */}
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 'var(--r-sm)',
            background: 'linear-gradient(135deg, #16A34A, #4ADE80)',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 2px 6px rgba(22,163,74,0.35)',
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '-0.02em' }}>E</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>EOMS</span>
        </NavLink>

        {/* Pill tabs — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          className="hide-scrollbar">
          {tabs.map(tab => (
            <NavLink key={tab.to} to={tab.to}
              style={({ isActive }) => ({
                display: 'inline-flex', alignItems: 'center',
                padding: '6px 14px',
                borderRadius: 'var(--r-full)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all var(--t-fast)',
                background: isActive ? 'var(--bg-dark)' : 'transparent',
                color: isActive ? '#fff' : 'var(--text-muted)',
              })}>
              {tab.label}
            </NavLink>
          ))}
        </div>

        {/* Right: Bell + Avatar — desktop */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 'auto' }}>
          <NavLink to="/notifications" style={{ position: 'relative', color: 'var(--text-muted)', display: 'grid', placeItems: 'center' }}>
            <Bell size={19} />
            <span style={{ position: 'absolute', top: -1, right: -2, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)', border: '1.5px solid var(--bg-surface)' }} />
          </NavLink>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={handleLogout} title="Sign out">
            <Avatar name={user?.name || 'User'} size={32} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }} className="desktop-only">{user?.name}</span>
          </div>
          {/* Mobile hamburger */}
          <button onClick={() => setDrawerOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'none' }} className="mobile-only">
            {drawerOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 'var(--nav-h)', left: 0, right: 0, zIndex: 190,
              background: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-green)',
              padding: 'var(--sp-4) var(--sp-5)',
              boxShadow: 'var(--shadow-hover)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tabs.map(tab => (
                <NavLink key={tab.to} to={tab.to} onClick={() => setDrawerOpen(false)}
                  style={({ isActive }) => ({
                    padding: '10px 14px', borderRadius: 'var(--r-md)',
                    fontSize: '0.9375rem', fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  })}>
                  {tab.label}
                </NavLink>
              ))}
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginTop: 8, borderRadius: 'var(--r-md)', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9375rem' }}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: grid !important; }
        }
        @media (min-width: 769px) {
          .mobile-only  { display: none !important; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
