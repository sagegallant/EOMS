import {
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';

/* ── Shared minimal tooltip ──────────────────────────────── */
function MinimalTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border-subtle)', borderRadius:'var(--r-md)', padding:'8px 12px', boxShadow:'var(--shadow-md)', fontSize:'0.8125rem' }}>
      {label && <div style={{ color:'var(--text-primary)', fontWeight:600, marginBottom:4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-secondary)' }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, flexShrink:0, display:'inline-block' }} />
          {p.name && <span style={{ color:'var(--text-muted)' }}>{p.name}:</span>}
          <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── MiniDonut ───────────────────────────────────────────── */
export function MiniDonut({ value=0, total=100, label, sublabel, color='var(--chart-1)', size=80, strokeWidth=10 }) {
  const pct = Math.min(100, Math.max(0, Math.round((value/(total||1))*100)));
  const data = [{ v:pct },{ v:100-pct }];
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size/2-1} cy={size/2-1} innerRadius={(size/2)-strokeWidth-2} outerRadius={(size/2)-2}
          startAngle={90} endAngle={-270} dataKey="v" strokeWidth={0}
          isAnimationActive animationBegin={0} animationDuration={900} animationEasing="ease-out">
          <Cell fill={color} /><Cell fill="var(--bg-sunken)" />
        </Pie>
      </PieChart>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
        {label!==undefined && <span style={{ fontSize:size*0.2, fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>{label}</span>}
        {sublabel && <span style={{ fontSize:size*0.13, color:'var(--text-muted)', lineHeight:1.2, marginTop:1 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

/* ── Sparkline ───────────────────────────────────────────── */
export function Sparkline({ data=[], dataKey='value', color='var(--chart-1)', height=40, showDot=true, strokeWidth=1.5 }) {
  if (!data.length) return null;
  const id = `sg-${Math.random().toString(36).slice(2,7)}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top:2, right:2, left:2, bottom:2 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={strokeWidth} fill={`url(#${id})`}
          dot={false} activeDot={showDot?{r:3,fill:color,strokeWidth:0}:false}
          isAnimationActive animationBegin={0} animationDuration={800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── TrendChart (full-width area) ────────────────────────── */
export function TrendChart({ data=[], series=[], xKey='date', height=200, showGrid=true, showLegend=false }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top:8, right:8, left:-20, bottom:0 }}>
        <defs>
          {series.map((s,i) => (
            <linearGradient key={i} id={`tg${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />}
        <XAxis dataKey={xKey} tick={{ fontSize:11, fill:'var(--text-muted)', fontFamily:'Inter' }} axisLine={false} tickLine={false} dy={6} />
        <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<MinimalTooltip />} />
        {series.map((s,i) => (
          <Area key={i} type="monotone" dataKey={s.dataKey} name={s.name||s.dataKey} stroke={s.color} strokeWidth={2}
            fill={`url(#tg${i})`} dot={false} activeDot={{ r:4, fill:s.color, strokeWidth:0 }}
            isAnimationActive animationBegin={i*100} animationDuration={900} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── VerticalBarChart — Crextio-style bar chart ──────────── */
// Slim bars, today/active highlighted in sage, others in sage-200
export function VerticalBarChart({ data=[], xKey='day', dataKey='value', height=160, activeIndex, highlightColor='var(--chart-1)', baseColor='var(--sage-200)' }) {
  const CustomBar = (props) => {
    const { x, y, width, height: h, index } = props;
    const isActive = index === (activeIndex ?? data.length - 1);
    const fill = isActive ? highlightColor : baseColor;
    const r = 5;
    return (
      <g>
        <rect x={x} y={y} width={width} height={h} rx={r} ry={r} fill={fill} />
        <circle cx={x + width / 2} cy={y + h + 6} r={3} fill={isActive ? highlightColor : 'var(--border-default)'} />
        {isActive && (
          <text x={x+width/2} y={y-8} textAnchor="middle" fontSize={10} fontWeight={700} fill={highlightColor}>
            {props.value}
          </text>
        )}
      </g>
    );
  };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top:18, right:4, left:-30, bottom:8 }} barCategoryGap="30%">
        <XAxis dataKey={xKey} tick={{ fontSize:11, fill:'var(--text-muted)', fontFamily:'Inter' }} axisLine={false} tickLine={false} />
        <Tooltip content={<MinimalTooltip />} cursor={false} />
        <Bar dataKey={dataKey} shape={<CustomBar />} isAnimationActive animationBegin={0} animationDuration={700} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── StackedBarChart ─────────────────────────────────────── */
export function StackedBarChart({ data=[], categories=[], xKey='name', height=180, layout='vertical', stacked=false, showGrid=true }) {
  const isH = layout==='horizontal';
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={isH?'vertical':'horizontal'} margin={{ top:4, right:8, left:isH?80:-20, bottom:0 }} barCategoryGap="35%" barGap={2}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={!isH} vertical={isH} />}
        {isH
          ? <><YAxis dataKey={xKey} type="category" tick={{ fontSize:11, fill:'var(--text-muted)', fontFamily:'Inter' }} axisLine={false} tickLine={false} width={80} /><XAxis type="number" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} /></>
          : <><XAxis dataKey={xKey} tick={{ fontSize:11, fill:'var(--text-muted)', fontFamily:'Inter' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false} /></>
        }
        <Tooltip content={<MinimalTooltip />} />
        {categories.map((cat,i) => (
          <Bar key={i} dataKey={cat.dataKey} name={cat.name||cat.dataKey} fill={cat.color||'var(--chart-1)'}
            stackId={stacked?'s':undefined} radius={[4,4,0,0]}
            isAnimationActive animationBegin={i*100} animationDuration={700} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── HorizontalBar (CSS, no Recharts) ───────────────────── */
export function HorizontalBar({ items=[], maxValue, colorVar='--chart-1' }) {
  const max = maxValue || Math.max(...items.map(i=>i.value),1);
  return (
    <div style={{ display:'grid', gap:10 }}>
      {items.map((item,i) => (
        <div key={i}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem', marginBottom:4 }}>
            <span style={{ color:'var(--text-secondary)' }}>{item.label}</span>
            <span style={{ fontWeight:600, color:'var(--text-primary)', fontFeatureSettings:'"tnum" 1' }}>{item.displayValue??item.value}</span>
          </div>
          <div style={{ height:5, borderRadius:'var(--r-full)', background:'var(--bg-sunken)', overflow:'hidden' }}>
            <motion.div
              initial={{ width:0 }}
              animate={{ width:`${(item.value/max)*100}%` }}
              transition={{ duration:0.7, delay:i*0.08, ease:[0.16,1,0.3,1] }}
              style={{ height:'100%', borderRadius:'inherit', background: item.color||`var(${colorVar})` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── RadialProgress (SVG arc) ───────────────────────────── */
export function RadialProgress({ value=0, size=120, strokeWidth=8, color='var(--chart-1)', label, sublabel, trackColor='var(--bg-sunken)' }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const r = (size/2)-(strokeWidth/2)-2;
  const c = 2*Math.PI*r;
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (pct/100)*c }}
          transition={{ duration:0.9, ease:[0.16,1,0.3,1] }} />
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
        {label!==undefined && <span style={{ fontSize:size*0.18, fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>{label}</span>}
        {sublabel && <span style={{ fontSize:size*0.12, color:'var(--text-muted)', marginTop:3, textAlign:'center', lineHeight:1.3, maxWidth:size*0.6 }}>{sublabel}</span>}
      </div>
    </div>
  );
}

/* ── ActivityTimeline ────────────────────────────────────── */
const TC = { success:{dot:'var(--success)',bg:'var(--success-bg)'}, warning:{dot:'var(--warning)',bg:'var(--warning-bg)'}, danger:{dot:'var(--danger)',bg:'var(--danger-bg)'}, info:{dot:'var(--chart-4)',bg:'var(--info-bg)'}, neutral:{dot:'var(--text-muted)',bg:'var(--bg-subtle)'} };
export function ActivityTimeline({ events=[], maxVisible=8 }) {
  return (
    <div style={{ display:'flex', flexDirection:'column' }}>
      {events.slice(0,maxVisible).map((ev,i,arr) => {
        const c = TC[ev.type]||TC.neutral;
        const isLast = i===arr.length-1;
        return (
          <div key={i} style={{ display:'flex', gap:12 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0, width:16 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:c.dot, flexShrink:0, marginTop:14, zIndex:1 }} />
              {!isLast && <div style={{ width:1, flex:1, background:'var(--border-subtle)', margin:'2px 0' }} />}
            </div>
            <div style={{ paddingBottom:isLast?0:12, paddingTop:10, flex:1, minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
                <span style={{ fontSize:'0.8125rem', fontWeight:500, color:'var(--text-primary)' }}>{ev.title||ev.description}</span>
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', flexShrink:0 }}>{ev.time||ev.timestamp}</span>
              </div>
              {ev.description&&ev.title && <p style={{ fontSize:'0.8125rem', color:'var(--text-muted)', marginTop:2 }}>{ev.description}</p>}
              {ev.meta && <span style={{ display:'inline-block', marginTop:4, padding:'2px 7px', borderRadius:'var(--r-full)', background:c.bg, color:c.dot, fontSize:'0.7rem', fontWeight:600 }}>{ev.meta}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── HeatmapGrid ─────────────────────────────────────────── */
export function HeatmapGrid({ data=[], rows=7, cols=12, label='' }) {
  if (!data.length) data = Array.from({length:rows*cols},()=>({ value: Math.random()>0.6 ? Math.floor(Math.random()*10) : 0 }));
  const maxVal = Math.max(...data.map(d=>d.value),1);
  const cs = 14, gap = 3;
  return (
    <div>
      {label && <div className="meta" style={{ marginBottom:6 }}>{label}</div>}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},${cs}px)`, gap }}>
        {data.slice(0,rows*cols).map((d,i) => {
          const intensity = d.value/maxVal;
          return <div key={i} title={`${d.label||''}:${d.value}`} style={{ width:cs, height:cs, borderRadius:3, background: intensity>0 ? `rgba(43,122,75,${0.1+intensity*0.8})` : 'var(--bg-sunken)', transition:'background 200ms', cursor:'default' }} />;
        })}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:'0.7rem', color:'var(--text-muted)' }}>
        <span>Less</span>
        {[0.1,0.3,0.55,0.75,0.95].map((o,i) => <div key={i} style={{ width:10, height:10, borderRadius:2, background:`rgba(43,122,75,${o})` }} />)}
        <span>More</span>
      </div>
    </div>
  );
}
