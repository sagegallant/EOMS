import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { navFor } from '../../utils/navigation';
import { Avatar } from '../common/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, LogOut, LayoutDashboard, Users, Compass, CheckSquare, FileText,
  GraduationCap, Laptop, BarChart3, ShieldCheck, ListFilter, Settings, HelpCircle, User,
  Menu, X
} from 'lucide-react';
import { notificationApi } from '../../api/notifications';

const ICON_MAP = {
  grid: LayoutDashboard, users: Users, route: Compass, check: CheckSquare,
  file: FileText, cap: GraduationCap, laptop: Laptop, bell: Bell,
  chart: BarChart3, shield: ShieldCheck, list: ListFilter,
  gear: Settings, help: HelpCircle, user: User,
};

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16,1,0.3,1] } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
};

export default function AppShell() {
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const nav = navFor(user?.roles);
  const items = nav.flatMap(s => s.items);

  useEffect(() => {
    const fetchCount = () => {
      if (user) {
        notificationApi.list().then(res => {
          const data = res.data || [];
          const unread = data.filter(n => !n.isRead && !n.readAt).length;
          setUnreadCount(unread);
        }).catch(err => {
          console.error('Failed to fetch notifications:', err);
        });
      }
    };

    fetchCount();
    window.addEventListener('notifications_updated', fetchCount);
    return () => window.removeEventListener('notifications_updated', fetchCount);
  }, [user, location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const NavContent = ({ mobile }) => (
    <nav style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 4 : 20, alignItems: mobile ? 'stretch' : 'center', flex: 1, padding: mobile ? '20px' : '0 24px' }}>
      {items.map(item => {
        const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
        return (
          <NavLink key={item.to} to={item.to} onClick={() => mobile && setDrawerOpen(false)}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap: 6,
              padding: mobile ? '12px 16px' : '8px 12px',
              borderRadius:'var(--r-md)',
              fontSize:'0.875rem', fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
              background: isActive && mobile ? 'var(--sage-100)' : 'transparent',
              borderBottom: isActive && !mobile ? '2px solid var(--primary)' : '2px solid transparent',
              transition:'all var(--t-fast) var(--ease)',
            })}
          >
            {mobile && <IconComp size={18} style={{ flexShrink:0 }} />}
            <span>{item.label}</span>
            {item.to === '/notifications' && unreadCount > 0 && (
              <span style={{ display:'grid', placeItems:'center', minWidth:24, height:20, padding: '0 6px', borderRadius:'10px', background:'var(--danger)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, marginLeft: 4 }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'var(--bg-app)' }}>
      {/* Top Header */}
      <header style={{ height: 64, background: '#ffffff', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px', display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 180 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', flexShrink: 0, background: 'var(--sage-900)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '1rem' }}>E</div>
          <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>EOMS</div>
        </div>

        {/* Desktop Nav */}
        <div className="desktop-only" style={{ flex: 1, display: 'flex' }}>
          <NavContent mobile={false} />
        </div>

        {/* Right side utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          
          <div onClick={() => navigate('/dashboard')} style={{ display:'flex', alignItems:'center', gap:10, paddingLeft: 16, borderLeft: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
            <Avatar name={user?.username||'User'} size={32} />
            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--text-primary)', lineHeight: 1.2, transition: 'color var(--t-fast)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>{user?.username||'User'}</span>
            </div>
          </div>

          <button onClick={handleLogout} title="Sign out"
            style={{ width:32, height:32, borderRadius:'var(--r-sm)', display:'grid', placeItems:'center', color:'var(--text-muted)', transition:'all var(--t-fast)', border: 'none', background: 'transparent', marginLeft: 8, cursor: 'pointer' }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--danger)'}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text-muted)'}}>
            <LogOut size={18} />
          </button>

          <button onClick={() => setDrawerOpen(true)} className="mobile-only" style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', border: 'none', background: 'transparent' }}>
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex:1, padding:'32px', maxWidth:1380, width:'100%', margin:'0 auto' }}>
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)' }} onClick={() => setDrawerOpen(false)}>
            <motion.div initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }} transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              style={{ width:260, height:'100%', background:'#fff', boxShadow: '2px 0 10px rgba(0,0,0,0.05)' }} onClick={e=>e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
                <button onClick={() => setDrawerOpen(false)} style={{ width:32, height:32, borderRadius:'var(--r-sm)', display:'grid', placeItems:'center', color:'var(--text-muted)', border: 'none', background: 'transparent' }}><X size={20} /></button>
              </div>
              <NavContent mobile={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-only { display: flex !important; }
        .mobile-only { display: none !important; }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: grid !important; }
        }
      `}</style>
    </div>
  );
}
