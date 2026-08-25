import { Card, Button, Badge, Progress, Avatar } from '../../../components/common/ui';

const NEXT_STEPS = [
  { icon:'●', status:'In progress', tone:'info',    title:'Complete security training',
    priority:'High', due:'Due tomorrow', time:'45 min', cta:'Continue' },
  { icon:'○', status:'Not started', tone:'neutral', title:'Meet your manager — 1:1 intro',
    priority:'Medium', due:'Due Mar 14', time:'30 min', cta:'Schedule' },
  { icon:'○', status:'Not started', tone:'neutral', title:'Collect laptop from IT',
    priority:'Medium', due:'Due Mar 15', time:'15 min', cta:'View details' },
];

export default function EmployeeDashboard() {
  return (
    <div style={{ display:'grid', gap:'var(--sp-6)' }}>

      {/* ── Greeting + progress identity ── */}
      <header style={{ display:'flex', gap:'var(--sp-6)', alignItems:'center',
        flexWrap:'wrap' }}>
        <Avatar name="Alex Johnson" size={56} />
        <div style={{ flex:'1 1 260px' }}>
          <h1 className="display" style={{ fontSize:'1.6rem' }}>Good morning, Alex 👋</h1>
          <p className="body" style={{ color:'var(--text-3)' }}>
            Wednesday, March 12 · Software Engineer · Engineering</p>
        </div>
        <ProgressRing value={72} />
        <div style={{ maxWidth:220 }}>
          <div className="h2">72% Onboarding Complete</div>
          <p className="caption" style={{ color:'var(--text-3)', marginTop:4 }}>
            You're on track to complete onboarding by <strong>March 28</strong>.</p>
        </div>
      </header>

      {/* ── Next steps: max 3, one primary action each ── */}
      <Card>
        <CardHeader title="Next Steps" hint="3 items need your attention"
                    action={<Button variant="ghost" size="sm">View all tasks →</Button>} />
        <div style={{ display:'grid', gap:'var(--sp-3)' }}>
          {NEXT_STEPS.map(t => (
            <div key={t.title} style={{ display:'flex', alignItems:'center', gap:'var(--sp-4)',
              padding:'var(--sp-3) var(--sp-4)', borderRadius:'var(--r-md)',
              background:'var(--surface-white)', boxShadow:'var(--neo-sm)',
              flexWrap:'wrap' }}>
              <span aria-hidden="true" style={{ fontSize:18 }}>{t.icon}</span>
              <div style={{ flex:'1 1 220px' }}>
                <div style={{ fontWeight:600, color:'var(--text-1)' }}>{t.title}</div>
                <div className="meta" style={{ marginTop:2 }}>
                  {t.priority} priority · {t.due} · ~{t.time}</div>
              </div>
              <Badge tone={t.tone} icon={t.icon}>{t.status}</Badge>
              <Button size="sm">{t.cta}</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 30/60/90 journey ── */}
      <Card>
        <CardHeader title="Your Onboarding Journey" hint="Day 1 → 90 Days" />
        <Timeline current={2} stages={[
          { label:'Day 1',    date:'Jan 12', done:true },
          { label:'Week 1',   date:'Jan 19', done:true },
          { label:'30 Days',  date:'Feb 11', done:true },
          { label:'60 Days',  date:'Mar 13', done:false, current:true },
          { label:'90 Days',  date:'Apr 12', done:false },
        ]} />
      </Card>

      {/* ── Documents + Training: two calm summaries ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',
        gap:'var(--sp-5)' }}>
        <Card>
          <CardHeader title="My Documents" hint="4 of 6 approved"
            action={<Button variant="ghost" size="sm">Open →</Button>} />
          <Progress value={67} label="Document completion" showValue={false} />
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:'var(--sp-3)' }}>
            <Badge tone="success" icon="✓">4 Approved</Badge>
            <Badge tone="info" icon="◐">1 Under Review</Badge>
            <Badge tone="warning" icon="!" >1 Required</Badge>
          </div>
        </Card>
        <Card>
          <CardHeader title="My Training" hint="1 course due soon"
            action={<Button variant="ghost" size="sm">Open →</Button>} />
          <TrainingRow title="Security Awareness" progress={64} due="Tomorrow"
                       tag="Mandatory" />
          <TrainingRow title="Code of Conduct" progress={100} due="Completed"
                       tag="Mandatory" done />
        </Card>
      </div>
    </div>
  );
}

/* ── helpers ── */
function CardHeader({ title, hint, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      marginBottom:'var(--sp-4)', gap:'var(--sp-3)' }}>
      <div><h2 className="h2">{title}</h2>
        <p className="meta">{hint}</p></div>
      {action}
    </div>
  );
}

function ProgressRing({ value }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" role="img"
      aria-label={`Onboarding ${value}% complete`}
      style={{ filter:'drop-shadow(3px 3px 6px rgba(163,177,198,.5))' }}>
      <circle cx="44" cy="44" r={r} fill="var(--surface)" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="var(--surface-sunken)" strokeWidth="8"/>
      <circle cx="44" cy="44" r={r} fill="none" stroke="var(--primary)" strokeWidth="8"
        strokeLinecap="round" strokeDasharray={`${c*value/100} ${c}`}
        transform="rotate(-90 44 44)" />
      <text x="44" y="50" textAnchor="middle" fontSize="17" fontWeight="700"
        fill="var(--text-1)">{value}%</text>
    </svg>
  );
}

function Timeline({ stages, current }) {
  return (
    <ol style={{ display:'flex', gap:0, listStyle:'none', padding:0, margin:0 }}>
      {stages.map((s, i) => {
        const state = s.done ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={s.label} style={{ flex:1, position:'relative', textAlign:'center' }}>
            {i > 0 && <span aria-hidden="true" style={{
              position:'absolute', top:14, left:'-50%', width:'100%', height:3,
              background: state === 'todo' ? 'var(--surface-sunken)' : 'var(--primary)',
              borderRadius:2 }} />}
            <span aria-hidden="true" style={{
              position:'relative', zIndex:1, display:'inline-grid', placeItems:'center',
              width:30, height:30, borderRadius:'50%', fontSize:13, fontWeight:700,
              background: state === 'current' ? 'var(--primary)' : 'var(--surface)',
              color: state === 'current' ? '#fff' : state === 'done' ? 'var(--success)' : 'var(--text-3)',
              boxShadow:'var(--neo-sm)' }}>{s.done ? '✓' : i + 1}</span>
            <div style={{ fontWeight:600, fontSize:'.8125rem', marginTop:8,
              color: state === 'current' ? 'var(--primary)' : 'var(--text-1)' }}>
              {s.label}{state === 'current' && ' · now'}</div>
            <div className="meta">{s.date}</div>
          </li>
        );
      })}
    </ol>
  );
}

function TrainingRow({ title, progress, due, tag, done }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'var(--sp-3)',
      padding:'var(--sp-3) 0', borderTop:'1px solid var(--surface-sunken)' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:600, color:'var(--text-1)', fontSize:'.875rem' }}>{title}</div>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
          <div style={{ flex:1, maxWidth:140 }}><Progress value={progress} size="sm"
            showValue={false} label={title} /></div>
          <span className="meta">{due}</span>
        </div>
      </div>
      <Badge tone={done ? 'success' : 'warning'} icon={done ? '✓' : '!'}>{tag}</Badge>
      {!done && <Button size="sm" variant="soft">Continue</Button>}
    </div>
  );
}
