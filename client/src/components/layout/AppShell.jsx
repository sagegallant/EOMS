/**
 * AppShell.jsx — Main application layout v2.1
 * - TopNav (horizontal) replaces left sidebar
 * - Lenis smooth scroll on main content
 * - AnimatePresence page transitions
 * - GSAP ScrollTrigger initialized here
 */
import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TopNav from './TopNav';
import { useLenis } from '../../utils/animations';
import { useAuthStore } from '../../store/authStore';

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize Lenis smooth scroll
  useLenis();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div id="app-shell">
      {/* ── Horizontal TopNav ── */}
      <TopNav user={user} onLogout={handleLogout} />

      {/* ── Main Content ── */}
      <main id="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
