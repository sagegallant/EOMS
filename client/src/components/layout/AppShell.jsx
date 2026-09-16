import { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { navFor } from '../../utils/navigation';
import { Avatar } from '../common/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Compass, CheckSquare, FileText,
  GraduationCap, Laptop, Bell, BarChart3, ShieldCheck,
  ListFilter, Settings, HelpCircle, User, Search, LogOut,
  Menu, X, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';

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
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const nav = navFor(user?.roles);
  const items = nav.flatMap(s => s.items);

  const handleLogout = () => { logout(); navigate('/login'); };
  const sidebarW = collapsed ? 56 : 220;

  const SidebarContent = ({ onNav }) => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      {/* Logo mark */}
      <div style={{ display:'flex', alignItems:'center', gap: collapsed ? 0 : 10, padding: collapsed ? '16px 0' : '16px 14px', justifyContent: collapsed ? 'center' : 'flex-start', overflow:'hidden' }}>
        <div style={{ width:32, height:32, borderRadius:'var(--r-md)', flexShrink:0, background:'var(--sage-900)', color:'#fff', display:'grid', placeItems:'center', fontWeight:700, fontSize:'0.9375rem' }}>E</div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight:700, fontSize:'0.9375rem', color:'var(--text-primary)', lineHeight:1 }}>EOMS</div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:1 }}>Employee Onboarding</div>
          </div>
        )}
      </div>

      <div style={{ height:1, background:'var(--border-subtle)', margin:'0 12px 8px' }} />

      {/* Nav */}
      <nav style={{ flex:1, overflowY:'auto', padding:'0 8px' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
          {items.map(item => {
            const IconComp = ICON_MAP[item.icon] || LayoutDashboard;
            return (
              <NavLink key={item.to} to={item.to} onClick={() => onNav?.()} title={collapsed ? item.label : undefined}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap: collapsed ? 0 : 9,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  padding: collapsed ? '10px 0' : '8px 10px',
                  borderRadius:'var(--r-md)',
                  fontSize:'0.8125rem', fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--sage-800)' : 'var(--text-muted)',
                  background: isActive ? 'var(--sage-100)' : 'transparent',
                  transition:'all var(--t-fast) var(--ease)',
                })}
              >
                <IconComp size={16} style={{ flexShrink:0 }} />
                {!collapsed && <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div style={{ height:1, background:'var(--border-subtle)', margin:'8px 12px 0' }} />

      {/* User */}
      <div style={{ display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'space-between', gap:8, padding: collapsed ? '12px 0' : '12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
          <Avatar name={user?.username||'User'} size={28} />
          {!collapsed && (
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:'0.8125rem', fontWeight:600, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.username||'Employee'}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{(user?.roles?.[0]||'EMPLOYEE').replace('_',' ')}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={handleLogout} title="Sign out"
            style={{ width:26, height:26, borderRadius:'var(--r-sm)', display:'grid', placeItems:'center', color:'var(--text-muted)', transition:'all var(--t-fast)' }}
            onMouseEnter={e=>{e.currentTarget.style.color='var(--danger)';e.currentTarget.style.background='var(--danger-bg)'}}
            onMouseLeave={e=>{e.currentTarget.style.color='var(--text-muted)';e.currentTarget.style.background='transparent'}}>
            <LogOut size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-app)' }}>
      {/* Desktop sidebar */}
      <motion.aside animate={{ width: sidebarW }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
        style={{ background:'var(--bg-surface)', borderRight:'1px solid var(--border-subtle)', position:'sticky', top:0, height:'100vh', zIndex:40, flexShrink:0, overflow:'hidden' }} className="desktop-sidebar">
        <SidebarContent />
      </motion.aside>

      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Topbar */}
        <header style={{ height:'var(--topbar-h)', background:'var(--bg-surface)', borderBottom:'1px solid var(--border-subtle)', padding:'0 var(--sp-6)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setCollapsed(c => !c)} className="desktop-only" title={collapsed ? 'Expand' : 'Collapse'}
              style={{ width:32, height:32, borderRadius:'var(--r-sm)', display:'grid', placeItems:'center', color:'var(--text-muted)', transition:'all var(--t-fast)' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-100)';e.currentTarget.style.color='var(--text-primary)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}>
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <button onClick={() => setDrawerOpen(true)} className="mobile-only" style={{ width:32, height:32, borderRadius:'var(--r-sm)', display:'grid', placeItems:'center', color:'var(--text-muted)' }}>
              <Menu size={16} />
            </button>

            {/* Search */}
            <div style={{ position:'relative' }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', pointerEvents:'none' }} />
              <input type="text" placeholder="Search… (Ctrl+K)"
                style={{ width:220, padding:'7px 10px 7px 30px', fontSize:'0.8125rem', borderRadius:'var(--r-full)', border:'1.5px solid var(--border-default)', background:'var(--sage-50)', color:'var(--text-primary)', outline:'none', transition:'border-color var(--t-fast)' }}
                onFocus={e=>e.target.style.borderColor='var(--sage-500)'}
                onBlur={e=>e.target.style.borderColor='var(--border-default)'} />
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => navigate('/notifications')} title="Notifications"
              style={{ position:'relative', width:36, height:36, borderRadius:'var(--r-full)', display:'grid', placeItems:'center', color:'var(--text-muted)', transition:'all var(--t-fast)', background:'var(--sage-50)', border:'1.5px solid var(--border-subtle)' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-100)';e.currentTarget.style.color='var(--sage-800)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--sage-50)';e.currentTarget.style.color='var(--text-muted)'}}>
              <Bell size={16} />
              <span style={{ position:'absolute', top:8, right:8, width:7, height:7, borderRadius:'50%', background:'var(--danger)', boxShadow:'0 0 0 2px var(--bg-surface)' }} />
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 10px 4px 4px', borderRadius:'var(--r-full)', border:'1.5px solid var(--border-subtle)', background:'var(--sage-50)' }}>
              <Avatar name={user?.username||'User'} size={28} />
              <span style={{ fontSize:'0.8125rem', fontWeight:500, color:'var(--text-primary)' }}>{user?.username||'User'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, padding:'var(--sp-5) var(--sp-6)', maxWidth:1380, width:'100%', margin:'0 auto' }}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(26,60,42,0.4)', backdropFilter:'blur(6px)' }} onClick={() => setDrawerOpen(false)}>
            <motion.div initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
              style={{ width:260, height:'100%', background:'var(--bg-surface)', borderRight:'1px solid var(--border-subtle)' }} onClick={e=>e.stopPropagation()}>
              <div style={{ position:'absolute', top:12, right:12 }}>
                <button onClick={() => setDrawerOpen(false)} style={{ width:28, height:28, borderRadius:'var(--r-sm)', display:'grid', placeItems:'center', color:'var(--text-muted)' }}><X size={16} /></button>
              </div>
              <SidebarContent onNav={() => setDrawerOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .desktop-only{display:grid;}
        .mobile-only{display:none;}
        @media(max-width:768px){
          .desktop-sidebar{display:none!important;}
          .desktop-only{display:none!important;}
          .mobile-only{display:grid!important;}
        }
      `}</style>
    </div>
  );
}
