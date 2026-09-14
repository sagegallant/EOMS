import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, KpiCard, SegmentedProgress, CircularArc, DarkPanel, DarkTaskItem, MiniCalendar, PageHeader, Avatar, Badge, Button, useCountUp } from '../../../components/common/ui';
import { VerticalBarChart, TrendChart, HorizontalBar } from '../../../components/common/charts';
import { Users, Calendar, ShieldCheck, TrendingUp, Clock, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Seed data (Indian references) ──────────────────────── */
const WEEKLY_COMPLETIONS = [
  { day:'Mon', value:5 }, { day:'Tue', value:8 }, { day:'Wed', value:6 },
  { day:'Thu', value:11 }, { day:'Fri', value:9 }, { day:'Sat', value:2 }, { day:'Sun', value:7 },
];

const COHORT_SEGMENTS = [
  { label:'Pre-boarding', value:15, color:'var(--sage-200)' },
  { label:'Week 1',       value:25, color:'var(--sage-300)' },
  { label:'30 Days',      value:30, color:'var(--sage-500)' },
  { label:'60 Days',      value:20, color:'var(--sage-700)' },
  { label:'90 Days',      value:10, color:'var(--sage-900)' },
];

const ONBOARDING_TASKS = [
  { title:'Onboard Aarav Sharma',   subtitle:'Platform Eng · Day 21',  done:true,  icon:Users },
  { title:'Review Sneha Kulkarni docs', subtitle:'Product & UX · Pending',done:false, icon:ShieldCheck },
  { title:'Schedule 30-day 1:1 — Kabir Mehta', subtitle:'Due today',   done:false, icon:Clock },
  { title:'Assign MacBook — Pooja Desai', subtitle:'IT Provisioning',   done:false, icon:ShieldCheck },
  { title:'POSH sign-off — Arjun Rao',   subtitle:'Compliance',        done:false, icon:ShieldCheck },
];

const HUB_DIST = [
  { label:'Bengaluru', value:8,  displayValue:'8 employees' },
  { label:'Hyderabad', value:4,  displayValue:'4 employees' },
  { label:'Pune',      value:3,  displayValue:'3 employees' },
  { label:'Gurugram',  value:2,  displayValue:'2 employees' },
  { label:'Remote',    value:1,  displayValue:'1 employee' },
];

const MILESTONE_DATES = [
  '2026-09-18','2026-09-22','2026-09-25','2026-09-29',
];

const VELOCITY = [
  { month:'Apr', started:10, completed:8 }, { month:'May', started:14, completed:11 },
  { month:'Jun', started:18, completed:15 }, { month:'Jul', started:16, completed:14 },
  { month:'Aug', started:22, completed:19 }, { month:'Sep', started:18, completed:16 },
];

export default function HRDashboard() {
  const [tasks, setTasks] = useState(ONBOARDING_TASKS);
  const navigate = useNavigate();
  const doneCount = tasks.filter(t=>t.done).length;
  const slaVal = useCountUp(98, 900, 0);

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      {/* ── Greeting ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
            Good morning, Priya 👋
          </h1>
          <p className="caption" style={{ marginTop:4 }}>Thursday, 18 September 2026 · EOMS India Operations</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/onboarding')}>New Onboarding Plan</Button>
      </div>

      {/* ── KPI Strip — Crextio giant number style ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'var(--sp-4)' }}>
        <KpiCard icon={Users}    label="Active Onboarding" value={18}  hint="↑ 3 from last week" />
        <KpiCard icon={Calendar} label="Joining This Week"  value={4}   hint="Expected start dates" />
        <KpiCard icon={ShieldCheck} label="SLA Compliance"  value={slaVal} suffix="%" hint="Target: 95%" />
        <KpiCard icon={TrendingUp}  label="Avg Completion"  value={38}  unit="days" hint="90-day programme" />
      </div>

      {/* ── Progress Strip (Crextio cohort phase bar) ── */}
      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 className="section-title">Cohort by Onboarding Phase</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding')}>View all <ChevronRight size={13}/></Button>
        </div>
        <SegmentedProgress segments={COHORT_SEGMENTS} />
      </Card>

      {/* ── Main 3-column grid (Crextio layout) ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr 1fr', gap:'var(--sp-4)' }}>

        {/* Col 1: Employee of the week / latest joinee */}
        <Card $p="0" style={{ overflow:'hidden', borderRadius:'var(--r-xl)', border:'1px solid var(--border-subtle)' }}>
          <div style={{ background:'linear-gradient(135deg, var(--sage-800) 0%, var(--sage-600) 100%)', padding:'var(--sp-5)', minHeight:180, display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <Avatar name="Aarav Sharma" size={48} />
              <div>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff' }}>Aarav Sharma</div>
                <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.7)', marginTop:2 }}>SDE-II · Platform Engineering</div>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'var(--r-full)', padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:8, backdropFilter:'blur(4px)', width:'fit-content' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#86EFAC', flexShrink:0 }} />
              <span style={{ color:'#fff', fontSize:'0.8125rem', fontWeight:600 }}>Day 21 of 90 · Bengaluru Hub</span>
            </div>
          </div>
          <div style={{ padding:'var(--sp-4)' }}>
            <div className="label-caps" style={{ marginBottom:10 }}>Programme Progress</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:'0.8125rem' }}>
              <span style={{ color:'var(--text-muted)' }}>Overall</span>
              <span style={{ fontWeight:700, color:'var(--sage-700)' }}>72%</span>
            </div>
            <div style={{ height:6, borderRadius:'var(--r-full)', background:'var(--sage-100)', overflow:'hidden' }}>
              <motion.div initial={{ width:0 }} animate={{ width:'72%' }} transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
                style={{ height:'100%', borderRadius:'inherit', background:'var(--sage-700)' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14 }}>
              {[['POSH Quiz','68%'],['DPDP Training','40%']].map(([k,v])=>(
                <div key={k} style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px' }}>
                  <div className="meta" style={{ marginBottom:2 }}>{k}</div>
                  <div style={{ fontWeight:700, color:'var(--sage-800)', fontSize:'0.9375rem' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Col 2: Weekly bar chart (Crextio Progress widget) */}
        <Card $p="var(--sp-5)">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <h2 className="section-title">Task Completions</h2>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
                <span className="kpi-md">48</span>
                <span className="caption">tasks this week</span>
              </div>
            </div>
            <Badge tone="sage">↑ 12% vs last week</Badge>
          </div>
          <VerticalBarChart data={WEEKLY_COMPLETIONS} xKey="day" dataKey="value" height={150} activeIndex={4} />
        </Card>

        {/* Col 3: Circular arc — overall SLA compliance */}
        <Card $p="var(--sp-5)" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
          <h2 className="section-title" style={{ alignSelf:'flex-start', width:'100%' }}>SLA Compliance</h2>
          <CircularArc value={94} max={100} size={150} strokeWidth={12} color="var(--sage-600)"
            centerContent={
              <div style={{ textAlign:'center' }}>
                <div className="kpi-md">94%</div>
                <div className="meta">of 18</div>
              </div>
            }
            label="On-time onboarding rate"
          />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, width:'100%' }}>
            {[['On Track','14','success'],['Needs Review','3','warning'],['Ahead','1','sage'],['Blocked','0','neutral']].map(([l,v,t])=>(
              <div key={l} style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span className="meta">{l}</span>
                <span style={{ fontWeight:700, fontSize:'0.9375rem', color:'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Bottom row: Hub distribution + Calendar + Dark task panel ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr 1fr', gap:'var(--sp-4)' }}>

        {/* Velocity trend */}
        <Card $p="var(--sp-5)">
          <div style={{ marginBottom:14 }}>
            <h2 className="section-title">Onboarding Velocity</h2>
            <p className="meta" style={{ marginTop:2 }}>Started vs completed (6 months)</p>
          </div>
          <TrendChart data={VELOCITY} xKey="month"
            series={[
              { dataKey:'started',   name:'Started',   color:'var(--sage-300)' },
              { dataKey:'completed', name:'Completed', color:'var(--sage-700)' },
            ]} height={140} />
          <div style={{ display:'flex', gap:12, marginTop:6 }}>
            {[['Started','var(--sage-300)'],['Completed','var(--sage-700)']].map(([l,c])=>(
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                <div style={{ width:10, height:2, background:c, borderRadius:2 }}/>{l}
              </div>
            ))}
          </div>
        </Card>

        {/* Mini Calendar */}
        <Card $p="var(--sp-5)">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h2 className="section-title">Milestone Dates</h2>
            <Button variant="ghost" size="xs" onClick={() => navigate('/tasks')}><Calendar size={12}/> Schedule</Button>
          </div>
          <MiniCalendar highlightDates={MILESTONE_DATES} />
          <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:6 }}>
            <div className="label-caps" style={{ marginBottom:4 }}>Upcoming</div>
            {[{ date:'Sep 18', label:'Aarav — 30d check-in', tone:'sage' },{ date:'Sep 22', label:'Kabir — Week 1 review', tone:'info' }].map((ev,i)=>(
              <div key={i} style={{ display:'flex', gap:10, alignItems:'center', padding:'6px 8px', borderRadius:'var(--r-md)', background:'var(--sage-50)' }}>
                <div style={{ fontWeight:700, color:'var(--sage-700)', fontSize:'0.8rem', flexShrink:0, width:42 }}>{ev.date}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{ev.label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dark task panel — Crextio right panel */}
        <DarkPanel title="Onboarding Tasks" counter={`${doneCount}/${tasks.length}`} subtitle="Today's pending actions">
          {tasks.map((t,i) => (
            <DarkTaskItem key={i} title={t.title} subtitle={t.subtitle} done={t.done} icon={t.icon}
              onClick={() => setTasks(ts => ts.map((tt,ii) => ii===i ? { ...tt, done:!tt.done } : tt))} />
          ))}
          <button onClick={() => navigate('/onboarding')}
            style={{ marginTop:16, width:'100%', padding:'9px', borderRadius:'var(--r-md)', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:'0.8125rem', cursor:'pointer', transition:'all var(--t-fast)' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='rgba(255,255,255,0.7)'}}>
            View all onboarding tasks ↗
          </button>
        </DarkPanel>
      </div>

      {/* ── Hub distribution ── */}
      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <h2 className="section-title">Distribution by Tech Hub</h2>
            <p className="meta" style={{ marginTop:2 }}>Active onboarding employees across India</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>Directory <ChevronRight size={13}/></Button>
        </div>
        <HorizontalBar items={HUB_DIST} colorVar="--chart-1" />
      </Card>
    </div>
  );
}
