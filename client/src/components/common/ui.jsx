/**
 * ui.jsx — EOMS Common UI Components v2.1
 * Inspired by HR_Dashboard.webp (Crextio) design system
 * Components: Card, Button, Badge, Avatar, Input, Select, Label,
 *             MetricPillBar, KPIStat, WelcomeHero, DarkTaskCard,
 *             AvatarHeroCard, CollapsibleRow, AnimatedList, AnimatedItem,
 *             PageHeader, Modal, Progress, EmptyState
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, X } from 'lucide-react';
import { useMetricPillFill, useCountUp, useScrollReveal, useStaggerReveal } from '../../utils/animations';

/* ─────────────────────────────────────────
   Card
───────────────────────────────────────── */
export function Card({ children, style, className = '', $hoverable, onClick }) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--sp-5)',
        border: '1px solid var(--border-subtle)',
        transition: 'box-shadow var(--t-normal), transform var(--t-normal)',
        cursor: $hoverable ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={$hoverable ? e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
      onMouseLeave={$hoverable ? e => { e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.transform = 'translateY(0)'; } : undefined}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Button
───────────────────────────────────────── */
const BTN_STYLES = {
  primary:     { background: 'var(--primary)', color: '#fff', border: 'none' },
  secondary:   { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
  soft:        { background: 'var(--primary-light)', color: 'var(--primary-text)', border: 'none' },
  ghost:       { background: 'transparent', color: 'var(--text-muted)', border: 'none' },
  danger:      { background: 'var(--danger)', color: '#fff', border: 'none' },
  dangerSoft:  { background: 'var(--danger-bg)', color: 'var(--danger)', border: 'none' },
  dark:        { background: 'var(--bg-dark)', color: '#fff', border: 'none' },
};
const BTN_SIZES = {
  xs: { padding: '3px 8px', fontSize: '0.75rem', borderRadius: 'var(--r-sm)', gap: 3 },
  sm: { padding: '6px 14px', fontSize: '0.8125rem', borderRadius: 'var(--r-md)', gap: 5 },
  md: { padding: '9px 18px', fontSize: '0.875rem', borderRadius: 'var(--r-md)', gap: 6 },
  lg: { padding: '12px 24px', fontSize: '0.9375rem', borderRadius: 'var(--r-lg)', gap: 8 },
};
export function Button({ children, variant = 'primary', size = 'md', icon: Icon, onClick, type = 'button', disabled, style }) {
  const bStyle = BTN_STYLES[variant] || BTN_STYLES.primary;
  const bSize  = BTN_SIZES[size] || BTN_SIZES.md;
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all var(--t-fast)', whiteSpace: 'nowrap', ...bStyle, ...bSize, ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(0.92)'; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
    >
      {Icon && <Icon size={size === 'xs' ? 12 : size === 'sm' ? 13 : 15} />}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
   Badge
───────────────────────────────────────── */
const BADGE_STYLES = {
  success: { background: 'var(--success-bg)', color: 'var(--success-text)' },
  warning: { background: 'var(--warning-bg)', color: 'var(--warning-text)' },
  danger:  { background: 'var(--danger-bg)',  color: 'var(--danger-text)' },
  info:    { background: 'var(--info-bg)',     color: 'var(--info-text)' },
  neutral: { background: '#F3F4F6',            color: '#374151' },
  amber:   { background: 'var(--amber-bg)',    color: '#92400E' },
  dark:    { background: 'var(--bg-dark)',     color: '#fff' },
};
export function Badge({ children, tone = 'neutral', style }) {
  const b = BADGE_STYLES[tone] || BADGE_STYLES.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.01em', whiteSpace: 'nowrap', ...b, ...style }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────
   Avatar
───────────────────────────────────────── */
const AVATAR_COLORS = [
  ['#DCFCE7','#16A34A'], ['#DBEAFE','#1D4ED8'], ['#FEF3C7','#D97706'],
  ['#FCE7F3','#BE185D'], ['#EDE9FE','#7C3AED'], ['#FFEDD5','#C2410C'],
  ['#F0FDF4','#15803D'], ['#E0F2FE','#0369A1'],
];
function getAvatarColor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h += name.charCodeAt(i);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
export function Avatar({ name = '', size = 36, style }) {
  const [bg, fg] = getAvatarColor(name);
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color: fg, fontWeight: 700, fontSize: size * 0.38, display: 'grid', placeItems: 'center', flexShrink: 0, fontFamily: 'var(--font)', ...style }}>
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────
   Input / Select / Label
───────────────────────────────────────── */
const inputBase = { width: '100%', padding: '8px 12px', fontSize: '0.875rem', fontFamily: 'var(--font)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', background: 'var(--bg-sunken)', color: 'var(--text-primary)', outline: 'none', transition: 'border-color var(--t-fast)' };
export function Input({ style, onFocus, onBlur, ...props }) {
  return <input style={{ ...inputBase, ...style }} onFocus={e => { e.target.style.borderColor = 'var(--primary)'; onFocus?.(e); }} onBlur={e => { e.target.style.borderColor = 'var(--border-default)'; onBlur?.(e); }} {...props} />;
}
export function Select({ children, style, ...props }) {
  return <select style={{ ...inputBase, ...style }} {...props}>{children}</select>;
}
export function Label({ children, style }) {
  return <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4, display: 'block', ...style }}>{children}</label>;
}

/* ─────────────────────────────────────────
   MetricPillBar  ← Crextio signature component
   Label top + dashed pill track + animated fill + value chip
───────────────────────────────────────── */
export function MetricPillBar({ label, value, max = 100, color = 'green', delay = 0 }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const fillRef = useMetricPillFill(pct, delay);
  const fillColor = color === 'amber' ? 'var(--amber)' : color === 'info' ? 'var(--info)' : 'var(--primary-fill)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 140 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--bg-surface)', borderRadius: 'var(--r-full)', padding: '1px 7px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
          {typeof value === 'string' ? value : `${value}${max === 100 ? '%' : ''}`}
        </span>
      </div>
      <div className="metric-pill-track">
        <div ref={fillRef} className="metric-pill-fill" style={{ background: fillColor, transformOrigin: 'left center' }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   KPIStat  ← Crextio "78 Employee" giant number
───────────────────────────────────────── */
export function KPIStat({ icon: Icon, value, label, suffix = '', prefix = '', color = 'var(--primary)', style }) {
  const numRef = useCountUp(typeof value === 'number' ? value : 0, { suffix, prefix, duration: 1.1 });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      {Icon && <div style={{ color: 'var(--text-muted)' }}><Icon size={20} /></div>}
      <div>
        <div className="kpi-number" ref={numRef} style={{ color: 'var(--text-primary)' }}>
          {prefix}{typeof value === 'number' ? value : value}{suffix}
        </div>
        <div className="caption" style={{ marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   WelcomeHero  ← Crextio "Welcome in," heading
───────────────────────────────────────── */
export function WelcomeHero({ name, role, date, children }) {
  const today = date || new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div style={{ marginBottom: 'var(--sp-6)' }} className="animate-slide-up">
      <div className="greeting">Welcome in,</div>
      <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 400 }}>
        {role} · {today}
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   AvatarHeroCard  ← Crextio photo/profile card
───────────────────────────────────────── */
export function AvatarHeroCard({ name, role, sub, children, style }) {
  return (
    <div className="avatar-hero-card" style={style}>
      <div className="avatar-hero-overlay" />
      <div style={{ padding: 'var(--sp-5)', position: 'relative', display: 'flex', justifyContent: 'center', paddingTop: 32 }}>
        <Avatar name={name} size={88} style={{ border: '3px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
      </div>
      <div className="avatar-hero-content">
        <div style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#fff' }}>{name}</div>
        <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{role}</div>
        {sub && (
          <div style={{ marginTop: 8, display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.75rem', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>
            {sub}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DarkTaskCard  ← Crextio right-panel #1C2128 card
───────────────────────────────────────── */
export function DarkTaskCard({ title, tasks = [], done = 0 }) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const toggle = (idx) => setLocalTasks(prev => prev.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  const doneCount = localTasks.filter(t => t.done).length;

  return (
    <div className="dark-card" style={{ padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="h3" style={{ color: 'var(--text-on-dark)' }}>{title}</span>
        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-on-dark)' }}>{doneCount}/{localTasks.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {localTasks.map((task, i) => (
          <div key={i} onClick={() => toggle(i)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--border-dark)', userSelect: 'none' }}>
            <div className={`task-radio ${task.done ? 'done' : ''}`}>
              {task.done && <CheckCircle2 size={11} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8125rem', color: task.done ? 'var(--text-on-dark-2)' : 'var(--text-on-dark)', textDecoration: task.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.title}
              </div>
              {task.date && <div style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-3)', marginTop: 1 }}>{task.date}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CollapsibleRow  ← Crextio "Pension contributions ↕"
───────────────────────────────────────── */
export function CollapsibleRow({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="collapsible-header" onClick={() => setOpen(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon size={14} /></div>}
          <span className="h3">{title}</span>
        </div>
        <ChevronDown size={16} className={`collapsible-chevron ${open ? 'open' : ''}`} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }} className="collapsible-body">
            <div style={{ padding: 'var(--sp-5)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   AnimatedList / AnimatedItem  — stagger entrance
───────────────────────────────────────── */
export function AnimatedList({ children, style }) {
  const ref = useStaggerReveal({ stagger: 0.06 });
  return <div ref={ref} style={style}>{children}</div>;
}
export function AnimatedItem({ children }) {
  return <div>{children}</div>;
}

/* ─────────────────────────────────────────
   PageHeader  — title + subtitle + optional action
───────────────────────────────────────── */
export function PageHeader({ title, subtitle, action, style }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-5)', ...style }} className="animate-slide-up">
      <div>
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="caption" style={{ marginTop: 4, color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────
   Modal  — Framer Motion
───────────────────────────────────────── */
export function Modal({ isOpen, onClose, title, description, children, footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(12,16,16,0.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
        >
          <motion.div initial={{ scale: 0.94, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 12 }} transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            style={{ background: 'var(--bg-surface)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-modal)', width: '100%', maxWidth: 480, overflow: 'hidden' }}
          >
            <div style={{ padding: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: description ? 4 : 20 }}>
                <h2 className="h2">{title}</h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}><X size={18} /></button>
              </div>
              {description && <p className="caption" style={{ marginBottom: 20, color: 'var(--text-muted)' }}>{description}</p>}
              {children}
            </div>
            {footer && (
              <div style={{ padding: 'var(--sp-4) var(--sp-6)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', background: 'var(--bg-subtle)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   Progress  — thin animated horizontal bar
───────────────────────────────────────── */
export function Progress({ value, max = 100, color = 'var(--primary-fill)', height = 4, style, delay = 0 }) {
  const fillRef = useProgressBarFill ? undefined : undefined; // JS fill handled inline
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ height, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden', ...style }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 'inherit', transition: `width 0.8s ${delay}s var(--ease-out)` }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   EmptyState
───────────────────────────────────────── */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--sp-12) var(--sp-8)', gap: 'var(--sp-4)', textAlign: 'center' }}>
      {Icon && <div style={{ width: 48, height: 48, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon size={22} /></div>}
      <div>
        <div className="h3" style={{ marginBottom: 4 }}>{title}</div>
        {description && <p className="caption">{description}</p>}
      </div>
      {action}
    </div>
  );
}
