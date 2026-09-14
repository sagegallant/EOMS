import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CircularArc, DarkPanel, DarkTaskItem, Badge, Button, Avatar, useCountUp, MiniCalendar } from '../../../components/common/ui';
import { VerticalBarChart } from '../../../components/common/charts';
import { CheckCircle2, Clock, Laptop, BookOpen, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const WEEKLY = [
  { day:'Mon', value:2 }, { day:'Tue', value:4 }, { day:'Wed', value:1 },
  { day:'Thu', value:3 }, { day:'Fri', value:5 }, { day:'Sat', value:0 }, { day:'Sun', value:2 },
];

const TASKS = [
  { title:'POSH Act 2013 Certification Quiz', subtitle:'Due tomorrow · 45 min', done:false, icon:BookOpen },
  { title:'1:1 with Vikram Malhotra (Director)', subtitle:'Due Sep 25 · 30 min', done:false, icon:Clock },
  { title:'Submit Aadhaar for TDS verification', subtitle:'Compliance · Urgent', done:false, icon:FileText },
  { title:'MacBook Pro 16" asset acknowledgement', subtitle:'IT Setup · Completed', done:true, icon:Laptop },
];

const MILESTONES = ['2026-09-25','2026-10-12','2026-11-01'];

const MODULES = [
  { label:'POSH Act 2013', pct:68, color:'var(--sage-700)' },
  { label:'DPDP Training', pct:40, color:'var(--sage-500)' },
  { label:'Engineering Best Practices', pct:90, color:'var(--sage-300)' },
];

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState(TASKS);
  const navigate = useNavigate();
  const dayVal = useCountUp(21, 600);
  const done = tasks.filter(t=>t.done).length;

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      {/* ── Greeting header ── */}
      <div>
        <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Welcome back, Aarav 👋</h1>
        <p className="caption" style={{ marginTop:4 }}>Thursday, 18 September 2026 · Platform Engineering, Bengaluru Hub</p>
      </div>

      {/* ── Main 3-col: Hero + Chart + Dark panel ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr', gap:'var(--sp-4)' }}>

        {/* Employee hero card */}
        <Card $p="0" style={{ overflow:'hidden', borderRadius:'var(--r-xl)' }}>
          <div style={{ background:'linear-gradient(150deg, var(--sage-700) 0%, var(--sage-400) 100%)', padding:'var(--sp-5)', display:'flex', flexDirection:'column', gap:12 }}>
            <Avatar name="Aarav Sharma" size={56} />
            <div>
              <div style={{ fontSize:'1.125rem', fontWeight:700, color:'#fff' }}>Aarav Sharma</div>
              <div style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.75)', marginTop:2 }}>Senior Software Engineer (SDE-II)</div>
              <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.55)', marginTop:1 }}>Platform Engineering · Bengaluru</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.18)', borderRadius:'var(--r-full)', padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:8, backdropFilter:'blur(4px)', width:'fit-content' }}>
              <span style={{ color:'#fff', fontSize:'0.875rem', fontWeight:700 }}>{dayVal}</span>
              <span style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.8125rem' }}>of 90 days</span>
            </div>
          </div>
          <div style={{ padding:'var(--sp-4)', display:'flex', justifyContent:'center' }}>
            <CircularArc value={72} max={100} size={130} strokeWidth={10} color="var(--sage-600)"
              centerContent={
                <div style={{ textAlign:'center' }}>
                  <div className="kpi-md">72%</div>
                  <div className="meta">journey</div>
                </div>
              } />
          </div>
        </Card>

        {/* Weekly activity chart */}
        <Card $p="var(--sp-5)">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <h2 className="section-title">Weekly Activity</h2>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
                <span className="kpi-lg">17</span>
                <span className="caption">tasks done this week</span>
              </div>
            </div>
            <Badge tone="sage">Active learner</Badge>
          </div>
          <VerticalBarChart data={WEEKLY} xKey="day" dataKey="value" height={150} activeIndex={4} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            {[['Meetings','2/3','66%'],['Completed','3/10','32%']].map(([l,v,p])=>(
              <div key={l} style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="meta">{l}</span>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-primary)' }}>{v}</div>
                  <div className="meta">{p}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dark task panel */}
        <DarkPanel title="My Tasks" counter={`${done}/${tasks.length}`} subtitle="Onboarding checklist">
          {tasks.map((t,i)=>(
            <DarkTaskItem key={i} title={t.title} subtitle={t.subtitle} done={t.done} icon={t.icon}
              onClick={() => setTasks(ts => ts.map((tt,ii) => ii===i ? { ...tt, done:!tt.done } : tt))} />
          ))}
          <button onClick={() => navigate('/tasks')}
            style={{ marginTop:14, width:'100%', padding:'8px', borderRadius:'var(--r-md)', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:'0.8125rem', cursor:'pointer', transition:'all var(--t-fast)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(255,255,255,0.7)'}}>
            All tasks ↗
          </button>
        </DarkPanel>
      </div>

      {/* ── Training + Calendar row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-5)">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 className="section-title">Training Modules</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/training')}>View all <ChevronRight size={13}/></Button>
          </div>
          <div style={{ display:'grid', gap:14 }}>
            {MODULES.map(m => (
              <div key={m.label}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8125rem', marginBottom:5 }}>
                  <span style={{ color:'var(--text-secondary)' }}>{m.label}</span>
                  <span style={{ fontWeight:700, color:'var(--sage-800)', fontFeatureSettings:'"tnum" 1' }}>{m.pct}%</span>
                </div>
                <div style={{ height:6, borderRadius:'var(--r-full)', background:'var(--sage-100)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${m.pct}%` }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
                    style={{ height:'100%', borderRadius:'inherit', background:m.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:14 }}>Milestone Calendar</h2>
          <MiniCalendar highlightDates={MILESTONES} />
        </Card>
      </div>
    </div>
  );
}
