import styled from 'styled-components';
import { forwardRef } from 'react';
import { X, Loader2 } from 'lucide-react';

/* ── Card: Modern Crisp SaaS Card ─────────────────────────── */
export const Card = styled.section`
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  padding: ${({ $p }) => $p || 'var(--sp-5)'};
  transition: box-shadow var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease);

  &:hover {
    box-shadow: ${({ $hoverable }) => ($hoverable ? 'var(--shadow-md)' : 'var(--shadow-sm)')};
    border-color: ${({ $hoverable }) => ($hoverable ? 'var(--border-default)' : 'var(--border-subtle)')};
  }
`;

/* ── Button: Executive Multi-Variant Button ───────────────── */
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
    {isLoading ? <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : IconComponent ? <IconComponent size={16} /> : null}
    {children}
  </StyledButton>
));

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  white-space: nowrap;
  border-radius: var(--r-sm);
  transition: all var(--t-fast) var(--ease);
  user-select: none;

  ${({ $size }) => ({
    xs: 'padding: 4px 10px; font-size: 0.75rem; border-radius: var(--r-xs);',
    sm: 'padding: 6px 12px; font-size: 0.8125rem;',
    md: 'padding: 9px 16px; font-size: 0.875rem;',
    lg: 'padding: 12px 22px; font-size: 0.9375rem;',
  }[$size])}

  ${({ $variant }) => ({
    primary: `
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 1px 2px rgba(79, 70, 229, 0.2);
      &:hover:not(:disabled) {
        background: var(--primary-hover);
        box-shadow: 0 2px 4px rgba(79, 70, 229, 0.3);
        transform: translateY(-1px);
      }
      &:active:not(:disabled) {
        background: var(--primary-active);
        transform: translateY(0);
      }
    `,
    secondary: `
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-default);
      box-shadow: var(--shadow-xs);
      &:hover:not(:disabled) {
        background: var(--bg-subtle);
        border-color: var(--border-strong);
      }
      &:active:not(:disabled) {
        background: var(--bg-sunken);
      }
    `,
    soft: `
      background: var(--primary-light);
      color: var(--primary);
      &:hover:not(:disabled) {
        background: rgba(79, 70, 229, 0.15);
      }
      &:active:not(:disabled) {
        background: rgba(79, 70, 229, 0.22);
      }
    `,
    ghost: `
      background: transparent;
      color: var(--text-secondary);
      &:hover:not(:disabled) {
        background: var(--bg-subtle);
        color: var(--text-primary);
      }
    `,
    danger: `
      background: var(--danger);
      color: #ffffff;
      &:hover:not(:disabled) {
        background: var(--danger-hover);
      }
    `,
    dangerSoft: `
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid var(--danger-border);
      &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.15);
      }
    `,
  }[$variant])}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
  }
`;

/* ── Input & Form Elements ────────────────────────────────── */
export const Input = styled.input`
  width: 100%;
  padding: 9px 14px;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease);

  &::placeholder {
    color: var(--text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-ring);
  }

  &[aria-invalid='true'] {
    border-color: var(--danger);
    box-shadow: 0 0 0 3px var(--danger-border);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 9px 14px;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--r-sm);
  box-shadow: var(--shadow-xs);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-ring);
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

/* ── Badge: Crisp Status Pills ────────────────────────────── */
const BADGE_STYLES = {
  success: { bg: 'var(--success-bg)', border: 'var(--success-border)', text: 'var(--success-text)', dot: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning-border)', text: 'var(--warning-text)', dot: 'var(--warning)' },
  danger:  { bg: 'var(--danger-bg)',  border: 'var(--danger-border)',  text: 'var(--danger-text)',  dot: 'var(--danger)' },
  info:    { bg: 'var(--info-bg)',    border: 'var(--info-border)',    text: 'var(--info-text)',    dot: 'var(--info)' },
  neutral: { bg: 'var(--neutral-bg)', border: 'var(--neutral-border)', text: 'var(--neutral-text)', dot: 'var(--neutral)' },
};

export function Badge({ tone = 'neutral', icon: IconComponent, showDot = true, children }) {
  const s = BADGE_STYLES[tone] || BADGE_STYLES.neutral;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 'var(--r-full)',
      padding: '3px 10px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: s.text,
      lineHeight: 1.3,
      whiteSpace: 'nowrap',
    }}>
      {IconComponent && <IconComponent size={12} />}
      {showDot && (
        <span
          aria-hidden="true"
          style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: s.dot, flexShrink: 0 }}
        />
      )}
      {children}
    </span>
  );
}

/* ── Progress: Clean Metric Bar ───────────────────────────── */
export function Progress({ value = 0, label, size = 'md', showValue = true }) {
  const h = { sm: 6, md: 8, lg: 12 }[size];
  const pct = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} style={{ width: '100%' }}>
      {label && showValue && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
          <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{pct}%</span>
        </div>
      )}
      <div style={{
        height: h,
        borderRadius: 'var(--r-full)',
        background: 'var(--bg-sunken)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: 'inherit',
          background: pct >= 100
            ? 'var(--success)'
            : 'linear-gradient(90deg, #6366F1, #4F46E5)',
          transition: 'width 400ms var(--ease)',
        }} />
      </div>
    </div>
  );
}

/* ── Avatar: Initials Disk with Border ────────────────────── */
const AVATAR_COLORS = [
  { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
  { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
];

export function Avatar({ name = 'User', size = 38 }) {
  const parts = (name || 'U').trim().split(' ');
  const initials = parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();

  const colorIndex = Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const c = AVATAR_COLORS[colorIndex];

  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        background: c.bg,
        color: c.text,
        border: `1.5px solid ${c.border}`,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {initials}
    </span>
  );
}

/* ── StatCard: Modern Executive KPI Widget ────────────────── */
export function StatCard({ icon: IconComponent, label, value, hint, trend, tone = 'primary' }) {
  const TONE_MAP = {
    primary: { bg: 'var(--primary-light)', color: 'var(--primary)' },
    success: { bg: 'var(--success-bg)', color: 'var(--success)' },
    warning: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
    info:    { bg: 'var(--info-bg)', color: 'var(--info)' },
  };
  const t = TONE_MAP[tone] || TONE_MAP.primary;

  return (
    <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span className="caption" style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
        {IconComponent && (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--r-md)',
            background: t.bg,
            color: t.color,
            display: 'grid',
            placeItems: 'center',
          }}>
            <IconComponent size={18} />
          </div>
        )}
      </div>
      <div className="h1" style={{ fontSize: '1.65rem', marginBottom: 4 }}>{value}</div>
      {(hint || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {trend && <span style={{ color: 'var(--success)', fontWeight: 600 }}>{trend}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </Card>
  );
}

/* ── Modal: High-Grade Dialog with Backdrop Blur ──────────── */
export function Modal({ isOpen, onClose, title, description, children, footer, maxWidth = 520 }) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--sp-4)',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 180ms ease forwards',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
          display: 'grid',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h3 className="h2">{title}</h3>
            {description && <p className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--r-sm)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--text-muted)',
              transition: 'all var(--t-fast) var(--ease)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', maxHeight: '75vh', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────── */
export function EmptyState({ icon: IconComponent, title, hint, action }) {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--sp-7) var(--sp-4)' }} role="status">
      {IconComponent && (
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--r-lg)',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 16px auto',
        }}>
          <IconComponent size={26} />
        </div>
      )}
      <h3 className="h2">{title}</h3>
      {hint && <p className="body" style={{ color: 'var(--text-muted)', marginTop: 6, maxWidth: 440, margin: '6px auto 0 auto' }}>{hint}</p>}
      {action && <div style={{ marginTop: 'var(--sp-4)' }}>{action}</div>}
    </div>
  );
}
