import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, KpiCard, DarkPanel, DarkTaskItem, Badge, Button, Avatar, AnimatedList, AnimatedItem, CircularArc } from '../../../components/common/ui';
import { VerticalBarChart, HorizontalBar } from '../../../components/common/charts';
import { Users, TrendingUp, ChevronRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const TEAM = [
  { name:'Aarav Sharma',   role:'SDE-II',              progress:72, status:'On Track',     tone:'sage'    },
  { name:'Sneha Kulkarni', role:'Sr. Product Designer', progress:45, status:'Needs Review', tone:'warning' },
  { name:'Kabir Mehta',    role:'SDE-II',              progress:35, status:'Just Started',  tone:'info'    },
  { name:'Ananya Iyer',    role:'Lead Frontend Arch',   progress:60, status:'On Track',     tone:'sage'    },
];

const WEEKLY = [
  { day:'Mon', value:12 }, { day:'Tue', value:18 }, { day:'Wed', value:9 },
  { day:'Thu', value:22 }, { day:'Fri', value:16 }, { day:'Sat', value:3 }, { day:'Sun', value:5 },
];

const TASKS_TODAY = [
  { title:'30d check-in — Aarav Sharma',    subtitle:'Schedule today', done:false },
  { title:"Review Sneha's POSH module",     subtitle:'Compliance review', done:false },
  { title:'Onboard brief — Kabir Mehta',    subtitle:'Week 1 intro',   done:true  },
  { title:'Sign-off: Ananya project ownership', subtitle:'60-day milestone', done:false },
];

export default function ManagerDashboard() {
  const [tasks, setTasks] = useState(TASKS_TODAY);
  const navigate = useNavigate();
  const avgProgress = Math.round(TEAM.reduce((s,t)=>s+t.progress,0)/TEAM.length);
  const onTrack = TEAM.filter(t=>t.status==='On Track').length;

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>Your Team 👥</h1>
          <p className="caption" style={{ marginTop:4 }}>{TEAM.length} direct reports · Platform Engineering · Bengaluru & Gurugram</p>
        </div>
        <Button onClick={() => navigate('/onboarding')}>Assign Onboarding Plan</Button>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'var(--sp-4)' }}>
        <KpiCard icon={Users}     label="Team Members"     value={TEAM.length} hint="Active onboarding" />
        <KpiCard icon={TrendingUp} label="Avg Progress"    value={avgProgress} suffix="%" hint="Target: 75%" />
        <KpiCard icon={Clock}     label="On Track"         value={onTrack}     hint="Of 4 members" />
        <KpiCard icon={Users}     label="Needs Attention"  value={TEAM.length-onTrack} hint="Needs review" />
      </div>

      {/* 3-col layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.1fr 1fr', gap:'var(--sp-4)' }}>

        {/* Team circular arc */}
        <Card $p="var(--sp-5)" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
          <h2 className="section-title" style={{ alignSelf:'flex-start', width:'100%' }}>Team Progress</h2>
          <CircularArc value={avgProgress} max={100} size={140} strokeWidth={12} color="var(--sage-600)"
            centerContent={
              <div style={{ textAlign:'center' }}>
                <div className="kpi-md">{avgProgress}%</div>
                <div className="meta">avg</div>
              </div>
            } label="Team average onboarding completion" />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, width:'100%' }}>
            {TEAM.map(m=>(
              <div key={m.name} style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'6px 10px' }}>
                <div className="meta" style={{ marginBottom:2 }}>{m.name.split(' ')[0]}</div>
                <div style={{ fontWeight:700, color:'var(--sage-800)', fontFeatureSettings:'"tnum" 1' }}>{m.progress}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly activity */}
        <Card $p="var(--sp-5)">
          <div style={{ marginBottom:4 }}>
            <h2 className="section-title">Team Activity</h2>
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
              <span className="kpi-md">85</span>
              <span className="caption">tasks completed this week</span>
            </div>
          </div>
          <VerticalBarChart data={WEEKLY} xKey="day" dataKey="value" height={150} activeIndex={3} />
        </Card>

        {/* Dark actions panel */}
        <DarkPanel title="Manager Actions" counter={`${tasks.filter(t=>!t.done).length} pending`} subtitle="Today's priorities">
          {tasks.map((t,i)=>(
            <DarkTaskItem key={i} title={t.title} subtitle={t.subtitle} done={t.done}
              onClick={() => setTasks(ts => ts.map((tt,ii) => ii===i ? { ...tt, done:!tt.done } : tt))} />
          ))}
        </DarkPanel>
      </div>

      {/* Team member list */}
      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h2 className="section-title">My Team</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>View all <ChevronRight size={13}/></Button>
        </div>
        <AnimatedList style={{ display:'grid', gap:6 }}>
          {TEAM.map(m => (
            <AnimatedItem key={m.name}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)' }}>
                <Avatar name={m.name} size={38} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:'0.875rem', color:'var(--text-primary)' }}>{m.name}</div>
                  <div className="meta">{m.role}</div>
                </div>
                {/* Progress bar */}
                <div style={{ width:120 }}>
                  <div style={{ height:4, borderRadius:'var(--r-full)', background:'var(--sage-100)', overflow:'hidden', marginBottom:2 }}>
                    <motion.div initial={{ width:0 }} animate={{ width:`${m.progress}%` }} transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
                      style={{ height:'100%', borderRadius:'inherit', background:'var(--sage-600)' }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--text-muted)' }}>
                    <span>Progress</span><span style={{ fontWeight:600, color:'var(--sage-700)', fontFeatureSettings:'"tnum" 1' }}>{m.progress}%</span>
                  </div>
                </div>
                <Badge tone={m.tone}>{m.status}</Badge>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </Card>
    </div>
  );
}
