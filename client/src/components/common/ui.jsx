import styled from 'styled-components';
import { forwardRef } from 'react';

/* ── Card: grows out of the canvas ───────────────────────── */
export const Card = styled.section`
  background: var(--surface);
  border-radius: var(--r-lg);
  box-shadow: var(--neo-md);
  padding: var(--sp-5);
  transition: box-shadow var(--t) var(--ease);
`;

/* ── Button: raised → pressed inset (signature interaction) ─ */
export const Button = forwardRef(({ variant = 'primary', size = 'md', ...p }, ref) => (
  <StyledButton ref={ref} $variant={variant} $size={size} {...p} />
));
const StyledButton = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border-radius: var(--r-sm); font-weight: 600; white-space: nowrap;
  transition: all var(--t) var(--ease);
  ${({ $size }) => ({ sm: 'padding:8px 14px;font-size:.8125rem',
                      md: 'padding:11px 20px;font-size:.9375rem' }[$size])}
  ${({ $variant }) => ({
    primary: `background:var(--primary);color:#fff;
              box-shadow:4px 4px 10px rgba(74,92,216,.32),-4px -4px 10px rgba(255,255,255,.7);
              &:hover{background:var(--primary-hover);}`,
    soft:    `background:var(--surface);color:var(--text-1);box-shadow:var(--neo-sm);
              &:hover{color:var(--primary);}`,
    ghost:   `background:transparent;color:var(--text-2);
              &:hover{color:var(--primary);}`,
    danger:  `background:var(--surface);color:var(--danger);box-shadow:var(--neo-sm);`,
  }[$variant])}
  &:active { box-shadow: var(--neo-in-sm) !important; transform: scale(.98); }
  &:disabled { opacity:.5; cursor:not-allowed; box-shadow:var(--neo-sm); }
`;

/* ── Input: inset well ────────────────────────────────────── */
export const Input = styled.input`
  width: 100%; padding: 12px 16px; font: inherit; color: var(--text-1);
  background: var(--surface-sunken); border-radius: var(--r-sm);
  box-shadow: var(--neo-in-sm); border: 2px solid transparent;
  transition: border-color var(--t) var(--ease);
  &::placeholder { color: var(--text-3); }
  &:focus { outline: none; border-color: var(--primary); }
  &[aria-invalid='true'] { border-color: var(--danger); }
`;

/* ── Status badge: dot + text + icon (never color alone) ──── */
const TONE = { success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)',
               info:'var(--info)', neutral:'var(--neutral)' };
export function Badge({ tone = 'neutral', icon, children }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:6,
      background:'var(--surface-white)', borderRadius:'var(--r-full)',
      padding:'4px 12px', fontSize:'.75rem', fontWeight:600,
      color:TONE[tone], boxShadow:'var(--neo-sm)',
    }}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span style={{ width:6, height:6, borderRadius:'50%',
        background:TONE[tone] }} aria-hidden="true" />
      {children}
    </span>
  );
}

/* ── Progress: THE EOMS identity element ──────────────────── */
export function Progress({ value, label, size = 'md', showValue = true }) {
  const h = { sm: 6, md: 10, lg: 14 }[size];
  return (
    <div role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}
         aria-label={label ?? 'Progress'} style={{ width:'100%' }}>
      <div style={{
        height: h, borderRadius:'var(--r-full)', background:'var(--surface-sunken)',
        boxShadow:'var(--neo-in-sm)', overflow:'hidden',
      }}>
        <div style={{
          width:`${value}%`, height:'100%', borderRadius:'inherit',
          background:'linear-gradient(90deg,#5A6BE0,#4354C9)',
          transition:'width 400ms var(--ease)',
        }} />
      </div>
      {showValue && (
        <div className="meta" style={{ marginTop:6, display:'flex', justifyContent:'space-between' }}>
          <span>{label}</span><span aria-hidden="true">{value}%</span>
        </div>
      )}
    </div>
  );
}

/* ── Avatar: initials on soft disc ────────────────────────── */
export function Avatar({ name = 'User', size = 40 }) {
  const initials = (name || 'User').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
  return (
    <span aria-hidden="true" style={{
      width:size, height:size, borderRadius:'50%', flexShrink:0,
      display:'grid', placeItems:'center',
      fontSize:size * .36, fontWeight:700, color:'var(--primary)',
      background:'var(--surface)', boxShadow:'var(--neo-sm)',
    }}>{initials}</span>
  );
}

/* ── KPI card ─────────────────────────────────────────────── */
export function Kpi({ icon, label, value, hint, tone }) {
  return (
    <Card as="div" style={{ padding:'var(--sp-4) var(--sp-5)', display:'grid', gap:6 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <span aria-hidden="true" style={{ fontSize:18 }}>{icon}</span>
        <span className="caption" style={{ color:'var(--text-3)', fontWeight:600 }}>{label}</span>
      </div>
      <div className="h1" style={{ fontSize:'1.6rem' }}>{value}</div>
      {hint && <div className="meta">{hint}</div>}
    </Card>
  );
}

/* ── Empty / Skeleton ────────────────────────────────────── */
export const Skeleton = styled.div`
  background: var(--surface-sunken); border-radius: var(--r-sm);
  box-shadow: var(--neo-in-sm);
  animation: pulse 1.4s ease-in-out infinite;
  @keyframes pulse { 50% { opacity:.55; } }
`;
export function EmptyState({ icon='🗂️', title, hint, action }) {
  return (
    <div style={{ textAlign:'center', padding:'var(--sp-7) var(--sp-4)' }} role="status">
      <div style={{ fontSize:36, marginBottom:12 }} aria-hidden="true">{icon}</div>
      <h3 className="h2">{title}</h3>
      {hint && <p className="caption" style={{ color:'var(--text-3)', marginTop:6 }}>{hint}</p>}
      {action && <div style={{ marginTop:'var(--sp-4)' }}>{action}</div>}
    </div>
  );
}
