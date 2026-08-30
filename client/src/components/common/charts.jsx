import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadialBarChart, RadialBar,
  LineChart, Line,
  Legend,
} from 'recharts';

/* ── Shared Tooltip ──────────────────────────────────────── */
function MinimalTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-md)',
      padding: '8px 12px',
      boxShadow: 'var(--shadow-md)',
      fontSize: '0.8125rem',
    }}>
      {label && <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color, flexShrink: 0, display: 'inline-block' }} />
          {p.name && <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>}
          <span style={{ fontWeight: 500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── MiniDonut: Compact ring for single-metric display ────── */
export function MiniDonut({
  value = 0,
  total = 100,
  label,
  sublabel,
  color = 'var(--chart-blue)',
  size = 80,
  strokeWidth = 10,
}) {
  const pct = Math.min(100, Math.max(0, Math.round((value / (total || 1)) * 100)));
  const data = [
    { name: 'value', value: pct },
    { name: 'rest', value: 100 - pct },
  ];
  const COLORS = [color, 'var(--bg-sunken)'];

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <PieChart width={size} height={size}>
        <defs>
          <filter id={`glow-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <Pie
          data={data}
          cx={size / 2 - 1}
          cy={size / 2 - 1}
          innerRadius={(size / 2) - strokeWidth - 2}
          outerRadius={(size / 2) - 2}
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          strokeWidth={0}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} style={i === 0 ? { filter: `url(#glow-${color.replace(/[^a-zA-Z0-9]/g, '')})` } : {}} />
          ))}
        </Pie>
      </PieChart>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {label !== undefined && (
          <span style={{ fontSize: size * 0.2, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
            {label ?? `${pct}%`}
          </span>
        )}
        {sublabel && (
          <span style={{ fontSize: size * 0.14, color: 'var(--text-muted)', lineHeight: 1.2, marginTop: 1 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Sparkline: Tiny inline trend area ───────────────────── */
export function Sparkline({
  data = [],
  dataKey = 'value',
  color = 'var(--chart-blue)',
  height = 40,
  showDot = true,
  strokeWidth = 1.5,
}) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={strokeWidth}
          fill={`url(#spark-grad-${color.replace(/[^a-zA-Z0-9]/g, '')})`}
          dot={false}
          activeDot={showDot ? { r: 4, fill: color, strokeWidth: 2, stroke: 'var(--bg-surface)' } : false}
          isAnimationActive={true}
          animationBegin={0}
          animationDuration={1000}
          style={{ filter: `drop-shadow(0px 4px 6px ${color}50)` }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── TrendChart: Full-width area/line chart ──────────────── */
export function TrendChart({
  data = [],
  series = [], // [{ dataKey, color, name }]
  xKey = 'date',
  height = 200,
  showGrid = true,
  showLegend = false,
  gradientFill = true,
}) {
  const gradIds = series.map((s, i) => `trend-grad-${i}`);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={gradIds[i]} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.12} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<MinimalTooltip />} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />}
        {series.map((s, i) => (
          <Area
            key={i}
            type="monotone"
            dataKey={s.dataKey}
            name={s.name || s.dataKey}
            stroke={s.color}
            strokeWidth={2}
            fill={gradientFill ? `url(#${gradIds[i]})` : 'transparent'}
            dot={false}
            activeDot={{ r: 5, fill: s.color, strokeWidth: 2, stroke: 'var(--bg-surface)' }}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1200}
            style={{ filter: `drop-shadow(0px 6px 12px ${s.color}40)` }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── StackedBar: Grouped/stacked bar chart ───────────────── */
export function StackedBarChart({
  data = [],
  categories = [], // [{ dataKey, color, name }]
  xKey = 'name',
  height = 180,
  layout = 'vertical',
  stacked = false,
  showGrid = true,
}) {
  const isHoriz = layout === 'horizontal';
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={isHoriz ? 'vertical' : 'horizontal'}
        margin={{ top: 4, right: 8, left: isHoriz ? 80 : -20, bottom: 0 }}
        barCategoryGap="35%"
        barGap={2}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-subtle)"
            horizontal={!isHoriz}
            vertical={isHoriz}
          />
        )}
        {isHoriz ? (
          <>
            <YAxis dataKey={xKey} type="category" tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} width={80} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip content={<MinimalTooltip />} />
        {categories.map((cat, i) => (
          <Bar
            key={i}
            dataKey={cat.dataKey}
            name={cat.name || cat.dataKey}
            fill={cat.color}
            stackId={stacked ? 'stack' : undefined}
            radius={i === categories.length - 1 || !stacked ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            isAnimationActive={true}
            animationBegin={i * 100}
            animationDuration={700}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── HorizontalBar: Simple ranking bars (pure CSS) ─────── */
export function HorizontalBar({ items = [], maxValue, colorVar = '--chart-blue' }) {
  const max = maxValue || Math.max(...items.map(i => i.value), 1);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gap: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{item.label}</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.displayValue ?? item.value}</span>
          </div>
          <div style={{ height: 4, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(item.value / max) * 100}%`,
                borderRadius: 'inherit',
                background: item.color || `var(${colorVar})`,
                transition: 'width 600ms var(--ease)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── RadialProgress: Large progress ring (SVG) ───────────── */
export function RadialProgress({
  value = 0,
  size = 120,
  strokeWidth = 8,
  color = 'var(--chart-blue)',
  label,
  sublabel,
  trackColor = 'var(--bg-sunken)',
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const r = (size / 2) - (strokeWidth / 2) - 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0px 4px 8px ${color}40)` }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1200ms cubic-bezier(0.19, 1, 0.22, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {label !== undefined && (
          <span style={{ fontSize: size * 0.18, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
            {label ?? `${pct}%`}
          </span>
        )}
        {sublabel && (
          <span style={{ fontSize: size * 0.12, color: 'var(--text-muted)', marginTop: 3, textAlign: 'center', lineHeight: 1.3, maxWidth: size * 0.6 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── ActivityTimeline: Vertical timeline ─────────────────── */
const TIMELINE_COLORS = {
  success: { dot: 'var(--success)', bg: 'var(--success-bg)' },
  warning: { dot: 'var(--warning)', bg: 'var(--warning-bg)' },
  danger:  { dot: 'var(--danger)',  bg: 'var(--danger-bg)' },
  info:    { dot: 'var(--chart-blue)', bg: 'var(--primary-light)' },
  neutral: { dot: 'var(--text-muted)', bg: 'var(--bg-subtle)' },
};

export function ActivityTimeline({ events = [], maxVisible = 8 }) {
  const visible = events.slice(0, maxVisible);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {visible.map((ev, i) => {
        const c = TIMELINE_COLORS[ev.type] || TIMELINE_COLORS.neutral;
        const isLast = i === visible.length - 1;
        return (
          <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
            {/* Connector line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: c.dot,
                flexShrink: 0,
                marginTop: 14,
                zIndex: 1,
              }} />
              {!isLast && (
                <div style={{ width: 1, flex: 1, background: 'var(--border-subtle)', marginTop: 2, marginBottom: 2 }} />
              )}
            </div>
            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 12, paddingTop: 10, minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {ev.title || ev.description}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {ev.time || ev.timestamp}
                </span>
              </div>
              {ev.description && ev.title && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                  {ev.description}
                </p>
              )}
              {ev.meta && (
                <span style={{
                  display: 'inline-block',
                  marginTop: 4,
                  padding: '2px 7px',
                  borderRadius: 'var(--r-full)',
                  background: c.bg,
                  color: c.dot,
                  fontSize: '0.7rem',
                  fontWeight: 500,
                }}>
                  {ev.meta}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── HeatmapGrid: Activity density grid ──────────────────── */
export function HeatmapGrid({ data = [], rows = 7, cols = 12, label = '' }) {
  if (!data.length) {
    data = Array.from({ length: rows * cols }, (_, i) => ({
      value: Math.random() > 0.6 ? Math.floor(Math.random() * 10) : 0,
    }));
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const cellSize = 14;
  const gap = 3;

  return (
    <div>
      {label && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gap,
      }}>
        {data.slice(0, rows * cols).map((d, i) => {
          const intensity = d.value / maxVal;
          return (
            <div
              key={i}
              title={`${d.label || ''}: ${d.value}`}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 3,
                background: intensity > 0
                  ? `rgba(37, 99, 235, ${0.1 + intensity * 0.8})`
                  : 'var(--bg-sunken)',
                transition: 'background 200ms',
                cursor: 'default',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>Less</span>
        {[0.1, 0.3, 0.55, 0.75, 0.95].map((o, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(37, 99, 235, ${o})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
