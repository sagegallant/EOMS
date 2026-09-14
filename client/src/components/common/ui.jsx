import styled from 'styled-components';
import { forwardRef, useState, useEffect, useRef } from 'react';
import { X, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────
   CARD
───────────────────────────────────────────────────────── */
export const Card = styled.section`
  background: ${({ $dark }) => $dark ? 'var(--dark-panel)' : 'var(--bg-surface)'};
  border: 1px solid ${({ $dark }) => $dark ? 'var(--dark-panel-border)' : 'var(--border-subtle)'};
  border-radius: var(--r-xl);
  padding: ${({ $p }) => $p || 'var(--sp-5)'};
  color: ${({ $dark }) => $dark ? 'var(--text-on-dark)' : 'inherit'};
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);
  &:hover {
    border-color: ${({ $hoverable, $dark }) => $hoverable ? ($dark ? 'var(--dark-panel-hover)' : 'var(--border-default)') : 'inherit'};
    box-shadow: ${({ $hoverable }) => $hoverable ? 'var(--shadow-sm)' : 'none'};
  }
`;

export const TintedCard = styled(Card)`
  background: var(--bg-surface-tinted);
  border-color: var(--sage-200);
`;

/* ─────────────────────────────────────────────────────────
   BUTTON — Crextio dark-pill style + variants
───────────────────────────────────────────────────────── */
export const Button = forwardRef(({ variant = 'primary', size = 'md', isLoading, icon: Icon, children, ...props }, ref) => (
  <StyledBtn ref={ref} $variant={variant} $size={size} disabled={props.disabled || isLoading} {...props}>
    {isLoading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
      : Icon ? <Icon size={13} /> : null}
    {children}
  </StyledBtn>
));

const StyledBtn = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  font-weight: 600; white-space: nowrap; border-radius: var(--r-full);
  transition: all var(--t-fast) var(--ease); user-select: none;

  ${({ $size }) => ({ xs:'padding:3px 10px;font-size:0.75rem;', sm:'padding:6px 14px;font-size:0.8125rem;', md:'padding:9px 18px;font-size:0.875rem;', lg:'padding:12px 24px;font-size:0.9375rem;' }[$size])}

  ${({ $variant }) => ({
    primary:    `background:var(--sage-900);color:#fff;&:hover:not(:disabled){background:var(--sage-800);}`,
    secondary:  `background:#fff;color:var(--text-primary);border:1.5px solid var(--border-default);&:hover:not(:disabled){background:var(--sage-100);border-color:var(--sage-300);}`,
    soft:       `background:var(--sage-100);color:var(--sage-800);&:hover:not(:disabled){background:var(--sage-200);}`,
    ghost:      `background:transparent;color:var(--text-muted);&:hover:not(:disabled){background:var(--sage-100);color:var(--text-primary);}`,
    danger:     `background:var(--danger);color:#fff;&:hover:not(:disabled){background:var(--danger-hover);}`,
    dangerSoft: `background:var(--danger-bg);color:var(--danger);border:1px solid var(--danger-border);&:hover:not(:disabled){background:#fee2e2;}`,
    dark:       `background:var(--dark-panel);color:#fff;border:1px solid var(--dark-panel-border);&:hover:not(:disabled){background:var(--dark-panel-hover);}`,
  }[$variant])}

  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

/* ─────────────────────────────────────────────────────────
   FORM ELEMENTS
───────────────────────────────────────────────────────── */
export const Input = styled.input`
  width:100%; padding:9px 13px; font-size:0.875rem; color:var(--text-primary);
  background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--r-md);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
  &::placeholder { color:var(--text-muted); }
  &:focus { outline:none; border-color:var(--sage-500); box-shadow:0 0 0 3px var(--primary-ring); }
`;
export const Select = styled.select`
  width:100%; padding:9px 13px; font-size:0.875rem; color:var(--text-primary);
  background:var(--bg-surface); border:1.5px solid var(--border-default); border-radius:var(--r-md); cursor:pointer;
  &:focus { outline:none; border-color:var(--sage-500); box-shadow:0 0 0 3px var(--primary-ring); }
`;
export const Label = styled.label`
  display:block; font-size:0.8125rem; font-weight:600; color:var(--text-primary); margin-bottom:5px;
`;

/* ─────────────────────────────────────────────────────────
   BADGE
───────────────────────────────────────────────────────── */
const BADGE = {
  success: { bg:'var(--success-bg)',  text:'var(--success-text)',  dot:'var(--success)' },
  warning: { bg:'var(--warning-bg)',  text:'var(--warning-text)',  dot:'var(--warning)' },
  danger:  { bg:'var(--danger-bg)',   text:'var(--danger-text)',   dot:'var(--danger)' },
  info:    { bg:'var(--info-bg)',     text:'var(--info-text)',     dot:'var(--info)' },
  neutral: { bg:'var(--bg-subtle)',   text:'var(--text-secondary)',dot:'var(--text-muted)' },
  sage:    { bg:'var(--sage-100)',    text:'var(--sage-800)',      dot:'var(--sage-500)' },
  dark:    { bg:'var(--sage-900)',    text:'#fff',                 dot:'var(--sage-300)' },
};
export function Badge({ tone = 'neutral', showDot = true, children }) {
  const s = BADGE[tone] || BADGE.neutral;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:s.bg, borderRadius:'var(--r-full)', padding:'3px 9px', fontSize:'0.75rem', fontWeight:600, color:s.text, whiteSpace:'nowrap' }}>
      {showDot && <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, flexShrink:0 }} />}
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   COUNT-UP HOOK
───────────────────────────────────────────────────────── */
export function useCountUp(target, duration = 700, decimals = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(+(target * ease).toFixed(decimals));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, decimals]);
  return val;
}

/* ─────────────────────────────────────────────────────────
   KPI STAT CARD — Crextio giant-number style
───────────────────────────────────────────────────────── */
export function KpiCard({ icon: Icon, label, value, unit = '', hint, tone = 'default', suffix = '', size = 'xl' }) {
  const numVal = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const animated = useCountUp(numVal, 800);
  const display = Number.isInteger(numVal) ? Math.round(animated) : animated.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
      style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'var(--r-xl)', padding:'var(--sp-5)', display:'flex', flexDirection:'column', gap:8 }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span className="label-caps">{label}</span>
        {Icon && (
          <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:'var(--sage-100)', color:'var(--sage-700)', display:'grid', placeItems:'center' }}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div className={`kpi-${size}`} style={{ lineHeight:1 }}>
        {display}{suffix}
        {unit && <span style={{ fontSize:'0.5em', fontWeight:500, color:'var(--text-muted)', marginLeft:4 }}>{unit}</span>}
      </div>
      {hint && <div className="meta" style={{ marginTop:2 }}>{hint}</div>}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   STAT CARD (legacy compatible)
───────────────────────────────────────────────────────── */
export function StatCard({ icon: Icon, label, value, hint, trend }) {
  return (
    <Card style={{ padding:'var(--sp-4)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
        <span className="label-caps">{label}</span>
        {Icon && <div style={{ width:28, height:28, borderRadius:'var(--r-sm)', background:'var(--sage-100)', color:'var(--sage-700)', display:'grid', placeItems:'center' }}><Icon size={14} /></div>}
      </div>
      <div style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1, marginBottom:4, fontFeatureSettings:'"tnum" 1' }}>{value}</div>
      {(hint || trend) && (
        <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', gap:6 }}>
          {trend && <span style={{ color:'var(--success)', fontWeight:600 }}>{trend}</span>}
          {hint}
        </div>
      )}
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────
   PROGRESS (thin bar)
───────────────────────────────────────────────────────── */
export function Progress({ value = 0, label, showValue = true, size = 'md', color }) {
  const h = { sm:3, md:5, lg:7 }[size];
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      {label && showValue && (
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:'0.8125rem' }}>
          <span style={{ color:'var(--text-muted)' }}>{label}</span>
          <span style={{ fontWeight:600, color:'var(--text-primary)', fontFeatureSettings:'"tnum" 1' }}>{pct}%</span>
        </div>
      )}
      <div style={{ height:h, borderRadius:'var(--r-full)', background:'var(--bg-sunken)', overflow:'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
          style={{ height:'100%', borderRadius:'inherit', background: color || (pct >= 100 ? 'var(--success)' : 'var(--sage-600)') }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────── */
const AVATAR_COLORS = ['#2B7A4B','#6DBE8D','#F59E0B','#3B82F6','#F43F5E','#8B5CF6','#14B8A6','#F97316','#0EA5E9','#EC4899'];
export function Avatar({ name = 'User', size = 32 }) {
  const parts = (name||'U').trim().split(' ');
  const init = parts.length > 1 ? (parts[0][0]+parts[parts.length-1][0]).toUpperCase() : parts[0].slice(0,2).toUpperCase();
  const bg = AVATAR_COLORS[Math.abs(name.split('').reduce((a,c)=>a+c.charCodeAt(0),0)) % AVATAR_COLORS.length];
  return (
    <span style={{ width:size, height:size, borderRadius:'50%', flexShrink:0, display:'grid', placeItems:'center', fontSize:size*0.36, fontWeight:700, background:bg+'22', color:bg, border:`1.5px solid ${bg}44` }}>
      {init}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   SEGMENTED PROGRESS — Crextio top-strip style
───────────────────────────────────────────────────────── */
export function SegmentedProgress({ segments = [] }) {
  // segments: [{ label, value, color }]
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', gap:6, alignItems:'stretch', height:20 }}>
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${(seg.value/total)*100}%` }}
            transition={{ duration: 0.6, delay: i*0.1, ease:[0.16,1,0.3,1] }}
            title={`${seg.label}: ${seg.value}%`}
            style={{ height:'100%', borderRadius: i===0 ? 'var(--r-full) 0 0 var(--r-full)' : i===segments.length-1 ? '0 var(--r-full) var(--r-full) 0' : 0, background: seg.color || 'var(--sage-600)', minWidth: seg.value > 0 ? 32 : 0, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}
          >
            {seg.value > 5 && <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#fff', whiteSpace:'nowrap', padding:'0 6px' }}>{seg.value}%</span>}
          </motion.div>
        ))}
      </div>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--text-secondary)' }}>
            <div style={{ width:8, height:8, borderRadius:2, background:seg.color || 'var(--sage-600)', flexShrink:0 }} />
            <span>{seg.label}</span>
            <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   CIRCULAR TIMER / ARC — Crextio time-tracker style
───────────────────────────────────────────────────────── */
export function CircularArc({ value = 0, max = 100, size = 140, strokeWidth = 10, centerContent, color = 'var(--sage-600)', label }) {
  const pct = Math.min(1, value / (max || 1));
  const r = (size/2) - strokeWidth - 4;
  const circum = 2 * Math.PI * r;
  const dashOffset = circum * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  // Generate dashes for the track (Crextio dashed style)
  const dashCount = 48;
  const dashLen = (circum / dashCount) * 0.6;
  const gapLen  = (circum / dashCount) * 0.4;

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <div style={{ position:'relative', width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
          {/* Dashed track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-default)" strokeWidth={strokeWidth} strokeDasharray={`${dashLen} ${gapLen}`} strokeLinecap="round" />
          {/* Animated fill */}
          <motion.circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            initial={{ strokeDashoffset: circum }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
            strokeDasharray={circum}
          />
        </svg>
        {centerContent && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
            {centerContent}
          </div>
        )}
      </div>
      {label && <div className="meta" style={{ textAlign:'center' }}>{label}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DARK PANEL — Crextio right-side task panel
───────────────────────────────────────────────────────── */
export function DarkPanel({ title, counter, children, subtitle }) {
  return (
    <div style={{ background:'var(--dark-panel)', borderRadius:'var(--r-xl)', padding:'var(--sp-5)', height:'100%', display:'flex', flexDirection:'column', gap:'var(--sp-4)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:'1rem', fontWeight:600, color:'#fff' }}>{title}</div>
          {subtitle && <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', marginTop:2 }}>{subtitle}</div>}
        </div>
        {counter && <div style={{ fontSize:'1.5rem', fontWeight:700, color:'#fff', fontFeatureSettings:'"tnum" 1' }}>{counter}</div>}
      </div>
      <div style={{ flex:1, overflow:'auto' }}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   DARK TASK ITEM
───────────────────────────────────────────────────────── */
export function DarkTaskItem({ title, subtitle, done = false, onClick, icon: Icon }) {
  return (
    <div
      onClick={onClick}
      style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.07)', cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background: done ? 'var(--sage-700)' : 'rgba(255,255,255,0.08)', display:'grid', placeItems:'center', flexShrink:0, transition:'background var(--t-fast)' }}>
        {done
          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          : Icon ? <Icon size={14} style={{ color:'rgba(255,255,255,0.5)' }} /> : null
        }
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'0.875rem', fontWeight:500, color: done ? 'rgba(255,255,255,0.4)' : '#fff', textDecoration: done ? 'line-through' : 'none' }}>{title}</div>
        {subtitle && <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop:1 }}>{subtitle}</div>}
      </div>
      <div style={{ width:18, height:18, borderRadius:'50%', border:`1.5px solid ${done ? 'var(--sage-500)' : 'rgba(255,255,255,0.2)'}`, background: done ? 'var(--sage-700)' : 'transparent', flexShrink:0 }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MODAL
───────────────────────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, description, children, footer, maxWidth = 500 }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div role="dialog" aria-modal initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.15 }}
          style={{ position:'fixed', inset:0, zIndex:999, display:'grid', placeItems:'center', padding:'var(--sp-4)', background:'rgba(26,60,42,0.35)', backdropFilter:'blur(8px)' }}
          onClick={e => e.target===e.currentTarget && onClose()}>
          <motion.div initial={{ opacity:0, scale:0.95, y:12 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.95, y:12 }} transition={{ duration:0.2, ease:[0.16,1,0.3,1] }}
            style={{ width:'100%', maxWidth, background:'#fff', borderRadius:'var(--r-2xl)', border:'1px solid var(--border-subtle)', boxShadow:'var(--shadow-xl)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border-subtle)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 className="h2">{title}</h3>
                {description && <p className="meta" style={{ marginTop:2 }}>{description}</p>}
              </div>
              <button onClick={onClose} style={{ width:28, height:28, borderRadius:'var(--r-sm)', display:'grid', placeItems:'center', color:'var(--text-muted)' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-100)';e.currentTarget.style.color='var(--text-primary)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='var(--text-muted)'}}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding:'18px 20px', maxHeight:'70vh', overflowY:'auto' }}>{children}</div>
            {footer && <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border-subtle)', background:'var(--sage-50)', display:'flex', justifyContent:'flex-end', gap:8 }}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <div style={{ textAlign:'center', padding:'var(--sp-7) var(--sp-4)' }}>
      {Icon && <div style={{ width:44, height:44, borderRadius:'var(--r-lg)', background:'var(--sage-100)', color:'var(--sage-600)', display:'grid', placeItems:'center', margin:'0 auto 12px' }}><Icon size={22} /></div>}
      <h3 className="h3" style={{ marginBottom:4 }}>{title}</h3>
      {hint && <p className="caption" style={{ color:'var(--text-muted)', maxWidth:340, margin:'0 auto' }}>{hint}</p>}
      {action && <div style={{ marginTop:'var(--sp-3)' }}>{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ANIMATED LIST + ITEM
───────────────────────────────────────────────────────── */
const LIST_CTR = { hidden:{}, show:{ transition:{ staggerChildren:0.04 } } };
const LIST_ITM = { hidden:{ opacity:0, y:8 }, show:{ opacity:1, y:0, transition:{ duration:0.28, ease:[0.16,1,0.3,1] } } };
export function AnimatedList({ children, style }) {
  return <motion.div variants={LIST_CTR} initial="hidden" animate="show" style={style}>{children}</motion.div>;
}
export function AnimatedItem({ children, style }) {
  return <motion.div variants={LIST_ITM} style={style}>{children}</motion.div>;
}

/* ─────────────────────────────────────────────────────────
   COLLAPSIBLE
───────────────────────────────────────────────────────── */
export function Collapsible({ title, children, defaultOpen = false, rightContent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', background:'none', border:'none', cursor:'pointer', borderTop:'1px solid var(--border-subtle)' }}>
        <span className="h3">{title}</span>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {rightContent}
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} style={{ color:'var(--text-muted)' }} />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }} style={{ overflow:'hidden' }}>
            <div style={{ paddingBottom:'var(--sp-4)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE HEADER
───────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action, breadcrumb }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:'var(--sp-5)' }}>
      <div>
        {breadcrumb && <div className="meta" style={{ marginBottom:4 }}>{breadcrumb}</div>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="caption" style={{ marginTop:3, maxWidth:480 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink:0 }}>{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   TOGGLE SWITCH
───────────────────────────────────────────────────────── */
export function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width:40, height:22, borderRadius:'var(--r-full)', background: value ? 'var(--sage-700)' : 'var(--bg-sunken)', position:'relative', border:'none', cursor:'pointer', flexShrink:0, transition:'background var(--t-normal)' }}>
      <motion.div animate={{ x: value ? 20 : 2 }} transition={{ type:'spring', stiffness:400, damping:28 }} style={{ position:'absolute', top:3, width:16, height:16, borderRadius:'50%', background:'#fff', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────
   MINI CALENDAR (Crextio inline calendar widget)
───────────────────────────────────────────────────────── */
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MiniCalendar({ highlightDates = [] }) {
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = cur.getFullYear();
  const month = cur.getMonth();
  const first = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = Array.from({ length: first + daysInMonth }, (_, i) => i < first ? null : i - first + 1);

  const highlighted = new Set(highlightDates.map(d => {
    const dt = new Date(d);
    return dt.getMonth()===month && dt.getFullYear()===year ? dt.getDate() : null;
  }).filter(Boolean));

  const isToday = d => d===today.getDate() && month===today.getMonth() && year===today.getFullYear();

  return (
    <div style={{ userSelect:'none' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--text-primary)' }}>{MONTHS[month]} {year}</span>
        <div style={{ display:'flex', gap:4 }}>
          {['‹','›'].map((ch, i) => (
            <button key={ch} onClick={() => setCur(new Date(year, month + (i===0?-1:1), 1))}
              style={{ width:24, height:24, borderRadius:6, border:'1px solid var(--border-subtle)', background:'#fff', fontSize:'0.875rem', color:'var(--text-muted)', display:'grid', placeItems:'center', cursor:'pointer' }}>
              {ch}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:'0.65rem', fontWeight:600, color:'var(--text-muted)', padding:'2px 0' }}>{d}</div>)}
        {cells.map((day, i) => (
          <div key={i} style={{ height:28, display:'grid', placeItems:'center', borderRadius:6, fontSize:'0.8125rem', fontWeight: isToday(day) ? 700 : 400,
            background: isToday(day) ? 'var(--sage-900)' : highlighted.has(day) ? 'var(--sage-100)' : 'transparent',
            color: isToday(day) ? '#fff' : highlighted.has(day) ? 'var(--sage-800)' : day ? 'var(--text-secondary)' : 'transparent',
            cursor: day ? 'default' : 'default',
            outline: highlighted.has(day) && !isToday(day) ? '1.5px solid var(--sage-300)' : 'none',
          }}>
            {day || ''}
          </div>
        ))}
      </div>
    </div>
  );
}
