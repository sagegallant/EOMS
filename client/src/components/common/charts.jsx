/**
 * charts.jsx — EOMS Recharts Component Library v2.1
 * Green palette matching HR_Dashboard.webp (Crextio)
 * Components: MiniDonut, Sparkline, TrendChart, StackedBarChart,
 *             HorizontalBar, RadialProgress, ActivityTimeline, HeatmapGrid
 */
import {
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useScrollReveal } from '../../utils/animations';

/* ── Shared tooltip ── */
const MinimalTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-dark)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', boxShadow: 'var(--shadow-dark)' }}>
      {label && <div style={{ fontSize: '0.7rem', color: 'var(--text-on-dark-2)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '0.8125rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color || p.fill }} />
          {p.name && <span style={{ color: 'rgba(255,255,255,0.6)', marginRight: 2 }}>{p.name}:</span>}
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   MiniDonut — compact ring for single metrics
───────────────────────────────────────── */
export function MiniDonut({ value = 0, total = 100, label, sublabel, size = 80, color = 'var(--chart-green)', style }) {
  const pct = Math.min(100, Math.round((value / total) * 100));
  const data = [{ value: pct }, { value: 100 - pct }];
  const COLORS = [color, 'var(--bg-sunken)'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size / 2 - 1} cy={size / 2 - 1} innerRadius={size * 0.33} outerRadius={size * 0.46} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0} animationBegin={0} animationDuration={900}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
        </Pie>
      </PieChart>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.15 }}>
        {label && <span style={{ fontSize: size * 0.21, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>}
        {sublabel && <span style={{ fontSize: size * 0.14, color: 'var(--text-muted)' }}>{sublabel}</span>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Sparkline — inline trend area
───────────────────────────────────────── */
export function Sparkline({ data = [], dataKey = 'v', color = 'var(--chart-green)', height = 48 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#sg)" dot={false} animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────
   TrendChart — full area chart with legend
───────────────────────────────────────── */
export function TrendChart({ data = [], xKey = 'date', series = [], height = 200, showLegend = true }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.01} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <Tooltip content={<MinimalTooltip />} />
        {series.map((s, i) => (
          <Area key={i} type="monotone" dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} fill={`url(#grad-${i})`} dot={false} animationDuration={900} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────
   StackedBarChart — green-palette bars
───────────────────────────────────────── */
export function StackedBarChart({ data = [], xKey = 'name', categories = [], height = 160 }) {
  const defaultColors = ['var(--chart-green)', 'var(--chart-sage)', 'var(--chart-amber)', 'var(--chart-blue)'];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={18} barCategoryGap="30%">
        <CartesianGrid vertical={false} stroke="#E5E7EB" strokeOpacity={0.5} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<MinimalTooltip />} cursor={{ fill: 'rgba(22,163,74,0.05)' }} />
        {categories.map((cat, i) => (
          <Bar key={i} dataKey={cat.dataKey} name={cat.name} fill={cat.color || defaultColors[i % defaultColors.length]} radius={[4, 4, 0, 0]} animationDuration={900} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────
   HorizontalBar — pure CSS ranking bars
───────────────────────────────────────── */
export function HorizontalBar({ items = [], maxValue, colorVar = '--chart-green' }) {
  const max = maxValue ?? Math.max(...items.map(i => i.value), 1);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map((item, i) => {
        const pct = Math.min(100, (item.value / max) * 100);
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: 'var(--text-muted)' }}>{item.displayValue ?? item.value}</span>
            </div>
            <div style={{ height: 5, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: item.color || `var(${colorVar})`, borderRadius: 'inherit', transition: 'width 0.8s var(--ease-out)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   RadialProgress — SVG arc ring
───────────────────────────────────────── */
export function RadialProgress({ value = 0, size = 80, strokeWidth = 7, color = 'var(--chart-green)', label, sublabel }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(100, value) / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-sunken)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.9s var(--ease-out)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {label && <span style={{ fontSize: size * 0.2, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{label}</span>}
        {sublabel && <span style={{ fontSize: size * 0.14, color: 'var(--text-muted)', marginTop: 2 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ActivityTimeline — vertical colored-dot timeline
───────────────────────────────────────── */
const TYPE_COLORS = { success: 'var(--chart-green)', warning: 'var(--chart-amber)', danger: '#EF4444', info: 'var(--chart-blue)', neutral: 'var(--border-default)' };
export function ActivityTimeline({ events = [], maxVisible = 10 }) {
  const visible = events.slice(0, maxVisible);
  return (
    <div style={{ position: 'relative' }}>
      {visible.map((ev, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < visible.length - 1 ? 16 : 0, position: 'relative' }}>
          {i < visible.length - 1 && (
            <div style={{ position: 'absolute', left: 6, top: 14, bottom: 0, width: 1, background: 'var(--border-subtle)' }} />
          )}
          <div style={{ width: 13, height: 13, borderRadius: '50%', background: TYPE_COLORS[ev.type] || TYPE_COLORS.neutral, flexShrink: 0, marginTop: 3, border: '2px solid var(--bg-surface)', boxShadow: `0 0 0 2px ${TYPE_COLORS[ev.type] || TYPE_COLORS.neutral}22` }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{ev.title}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>{ev.time}</span>
            </div>
            {ev.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{ev.description}</p>}
            {ev.meta && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 500, marginTop: 2, display: 'block' }}>{ev.meta}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   HeatmapGrid — activity density grid
───────────────────────────────────────── */
export function HeatmapGrid({ rows = 7, cols = 12, label }) {
  const cells = Array.from({ length: rows * cols }, () => Math.random());
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 }}>
        {cells.map((v, i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 3, background: v < 0.2 ? 'var(--bg-sunken)' : `rgba(22,163,74,${(v * 0.85).toFixed(2)})`, transition: 'background 0.2s' }} />
        ))}
      </div>
      {label && <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 8 }}>{label}</p>}
    </div>
  );
}
