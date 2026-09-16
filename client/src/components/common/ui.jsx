import styled from 'styled-components';
import { forwardRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Card ─────────────────────────────────────────────────── */
export const Card = styled.section`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--r-lg);
  padding: ${({ $p }) => $p || 'var(--sp-5)'};
  transition: border-color var(--t-fast) var(--ease);

  &:hover {
    border-color: ${({ $hoverable }) => ($hoverable ? 'var(--border-default)' : 'var(--border-subtle)')};
  }
`;

/* ── Button ───────────────────────────────────────────────── */
export const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: IconComponent,
  children,
  ...props
}, ref) => (
  <StyledButton
    ref={ref}
    $variant={variant}
    $size={size}
    disabled={props.disabled || isLoading}
    {...props}
  >
    {isLoading
      ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
      : IconComponent ? <IconComponent size={14} /> : null}
    {children}
  </StyledButton>
));

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 500;
  white-space: nowrap;
  border-radius: var(--r-sm);
  transition: all var(--t-fast) var(--ease);
  user-select: none;

  ${({ $size }) => ({
    xs: 'padding: 3px 8px; font-size: 0.75rem;',
    sm: 'padding: 5px 10px; font-size: 0.8125rem;',
    md: 'padding: 7px 14px; font-size: 0.875rem;',
    lg: 'padding: 10px 18px; font-size: 0.9375rem;',
  }[$size])}

  ${({ $variant }) => ({
    primary: `
      background: var(--primary);
      color: #ffffff;
      &:hover:not(:disabled) { background: var(--primary-hover); opacity: 0.95; }
      &:active:not(:disabled) { background: var(--primary-active); }
    `,
    secondary: `
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-default);
      &:hover:not(:disabled) { background: var(--bg-subtle); border-color: var(--border-strong); }
      &:active:not(:disabled) { background: var(--bg-sunken); }
    `,
    soft: `
      background: var(--primary-light);
      color: var(--primary);
      &:hover:not(:disabled) { background: rgba(37, 99, 235, 0.12); }
      &:active:not(:disabled) { background: rgba(37, 99, 235, 0.18); }
    `,
    ghost: `
      background: transparent;
      color: var(--text-muted);
      &:hover:not(:disabled) { background: var(--bg-subtle); color: var(--text-primary); }
    `,
    danger: `
      background: var(--danger);
      color: #ffffff;
      &:hover:not(:disabled) { background: var(--danger-hover); }
    `,
    dangerSoft: `
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid var(--danger-border);
      &:hover:not(:disabled) { background: rgba(239, 68, 68, 0.12); }
    `,
  }[$variant])}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

/* ── Input ────────────────────────────────────────────────── */
export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-sm);
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);

  &::placeholder { color: var(--text-muted); }
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-ring);
  }
  &[aria-invalid='true'] {
    border-color: var(--danger);
    box-shadow: 0 0 0 3px rgba(239,68,68,0.15);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-sm);
  cursor: pointer;
  &:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-ring); }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 5px;
`;

/* ── Badge ────────────────────────────────────────────────── */
const BADGE_STYLES = {
  success: { bg: 'var(--success-bg)', text: 'var(--success-text)', dot: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', text: 'var(--warning-text)', dot: 'var(--warning)' },
  danger:  { bg: 'var(--danger-bg)',  text: 'var(--danger-text)',  dot: 'var(--danger)' },
  info:    { bg: 'var(--info-bg)',    text: 'var(--info-text)',    dot: 'var(--chart-blue)' },
  neutral: { bg: 'var(--neutral-bg)', text: 'var(--neutral-text)', dot: 'var(--neutral)' },
};

export function Badge({ tone = 'neutral', showDot = true, children }) {
  const s = BADGE_STYLES[tone] || BADGE_STYLES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, borderRadius: 'var(--r-full)',
      padding: '2px 8px', fontSize: '0.75rem', fontWeight: 500,
      color: s.text, whiteSpace: 'nowrap',
    }}>
      {showDot && <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: s.dot, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

/* ── Progress ─────────────────────────────────────────────── */
export function Progress({ value = 0, label, size = 'md', showValue = true }) {
  const h = { sm: 3, md: 4, lg: 6 }[size];
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ width: '100%' }}>
      {label && showValue && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
      )}
      <div style={{ height: h, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 'inherit',
          background: pct >= 100 ? 'var(--success)' : 'var(--primary)',
          transition: 'width 500ms var(--ease)',
        }} />
      </div>
    </div>
  );
}

/* ── Avatar ───────────────────────────────────────────────── */
const AVATAR_PALETTE = [
  '#2563EB', '#7C3AED', '#0EA5E9', '#D97706', '#DC2626',
  '#059669', '#DB2777', '#65A30D', '#EA580C', '#0891B2',
];

export function Avatar({ name = 'User', size = 32 }) {
  const parts = (name || 'U').trim().split(' ');
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
  const colorIdx = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_PALETTE.length;
  const bg = AVATAR_PALETTE[colorIdx];
  return (
    <span aria-hidden="true" style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      display: 'grid', placeItems: 'center',
      fontSize: size * 0.36, fontWeight: 500,
      background: bg + '22', color: bg,
      border: `1px solid ${bg}33`,
    }}>
      {initials}
    </span>
  );
}

/* ── StatCard (with optional sparkline) ─────────────────── */
export function StatCard({ icon: IconComponent, label, value, hint, trend, tone = 'primary', sparkData, sparkColor }) {
  const TONE_MAP = {
    primary: { accent: 'var(--primary)', bg: 'var(--primary-light)' },
    success: { accent: 'var(--success)', bg: 'var(--success-bg)' },
    warning: { accent: 'var(--warning)', bg: 'var(--warning-bg)' },
    info:    { accent: 'var(--chart-blue)', bg: 'var(--info-bg)' },
  };
  const t = TONE_MAP[tone] || TONE_MAP.primary;

  return (
    <Card style={{ padding: 'var(--sp-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        {IconComponent && (
          <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: t.bg, color: t.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IconComponent size={14} />
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      {(hint || trend) && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
          {trend && <span style={{ color: 'var(--success)', fontWeight: 500 }}>{trend}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </Card>
  );
}

/* ── Modal (Framer Motion) ───────────────────────────────── */
export function Modal({ isOpen, onClose, title, description, children, footer, maxWidth = 500 }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            display: 'grid', placeItems: 'center',
            padding: 'var(--sp-4)',
            background: 'rgba(23, 23, 23, 0.4)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%', maxWidth,
              background: 'var(--bg-surface)',
              borderRadius: 'var(--r-xl)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="h2">{title}</h3>
                {description && <p className="meta" style={{ marginTop: 2 }}>{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Close" style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', transition: 'all var(--t-fast)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '18px 20px', maxHeight: '70vh', overflowY: 'auto' }}>{children}</div>
            {footer && (
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── EmptyState ───────────────────────────────────────────── */
export function EmptyState({ icon: IconComponent, title, hint, action }) {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--sp-7) var(--sp-4)' }} role="status">
      {IconComponent && (
        <div style={{ width: 40, height: 40, borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', color: 'var(--text-muted)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <IconComponent size={20} />
        </div>
      )}
      <h3 className="h3" style={{ marginBottom: 4 }}>{title}</h3>
      {hint && <p className="caption" style={{ color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>{hint}</p>}
      {action && <div style={{ marginTop: 'var(--sp-3)' }}>{action}</div>}
    </div>
  );
}

/* ── AnimatedList: Stagger wrapper ───────────────────────── */
const LIST_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const LIST_ITEM = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

export function AnimatedList({ children, style }) {
  return (
    <motion.div variants={LIST_CONTAINER} initial="hidden" animate="show" style={style}>
      {children}
    </motion.div>
  );
}
export function AnimatedItem({ children, style }) {
  return <motion.div variants={LIST_ITEM} style={style}>{children}</motion.div>;
}

/* ── Collapsible: Progressive disclosure ─────────────────── */
export function Collapsible({ title, children, defaultOpen = false, rightContent }) {
  const [open, setOpen] = import('react').then ? null : null; // see below
  return <CollapsibleInner title={title} children={children} defaultOpen={defaultOpen} rightContent={rightContent} />;
}

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

function CollapsibleInner({ title, children, defaultOpen = false, rightContent }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span className="h3">{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {rightContent}
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: 'var(--sp-4)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── PageHeader ───────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action, breadcrumb }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--sp-5)' }}>
      <div>
        {breadcrumb && <div className="meta" style={{ marginBottom: 4, color: 'var(--text-muted)' }}>{breadcrumb}</div>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="caption" style={{ marginTop: 3, maxWidth: 480 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  );
}
