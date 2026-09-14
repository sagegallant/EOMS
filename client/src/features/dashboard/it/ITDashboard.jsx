import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, KpiCard, DarkPanel, DarkTaskItem, Badge, Button, Avatar, AnimatedList, AnimatedItem } from '../../../components/common/ui';
import { VerticalBarChart, HorizontalBar, MiniDonut } from '../../../components/common/charts';
import { Laptop, Plus, CheckCircle2, ChevronRight, Users } from 'lucide-react';

const WEEKLY_PROVISIONED = [
  { day:'Mon', value:3 }, { day:'Tue', value:5 }, { day:'Wed', value:2 },
  { day:'Thu', value:7 }, { day:'Fri', value:4 }, { day:'Sat', value:0 }, { day:'Sun', value:1 },
];

const HUB_ASSETS = [
  { label:'Bengaluru', value:12, displayValue:'12 assets' },
  { label:'Hyderabad', value:7,  displayValue:'7 assets' },
  { label:'Pune',      value:5,  displayValue:'5 assets' },
  { label:'Gurugram',  value:4,  displayValue:'4 assets' },
  { label:'Remote',    value:2,  displayValue:'2 assets' },
];

const QUEUE = [
  { employee:'Sneha Kulkarni',  asset:'MacBook Pro 14" M3 Pro', hub:'Pune',       status:'In Transit',   tone:'warning' },
  { employee:'Kabir Mehta',     asset:'Dell Latitude 5540',     hub:'Gurugram',    status:'Pending',      tone:'info'    },
  { employee:'Pooja Desai',     asset:'MacBook Pro 16" M3 Max', hub:'Remote',      status:'Ready',        tone:'sage'    },
  { employee:'Aditya Sengupta', asset:'LG UltraFine 5K 27"',   hub:'Bengaluru',   status:'Dispatched',   tone:'info'    },
];

const URGENT_TASKS = [
  { title:'Provision laptop — Sneha Kulkarni', subtitle:'Pune Hinjawadi · Urgent', done:false },
  { title:'YubiKey setup — Kabir Mehta',        subtitle:'Gurugram · Security',    done:false },
  { title:'VPN config — Pooja Desai',           subtitle:'Remote · Today',         done:true  },
  { title:'Access revoke — ex-employee',        subtitle:'Compliance task',        done:false },
];

export default function ITDashboard() {
  const [queue, setQueue] = useState(QUEUE);
  const [tasks, setTasks] = useState(URGENT_TASKS);
  const navigate = useNavigate();
  const allocated = queue.filter(q=>q.tone==='success').length;

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>IT Provisioning 💻</h1>
          <p className="caption" style={{ marginTop:4 }}>Hardware queue and access management for India tech hubs</p>
        </div>
        <Button icon={Plus}>Register Asset</Button>
      </div>

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'var(--sp-4)' }}>
        <KpiCard icon={Laptop} label="Total Assets" value={30} hint="Across all hubs" />
        <KpiCard icon={CheckCircle2} label="Allocated" value={22} hint="Acknowledged" />
        <KpiCard icon={Users} label="Pending Queue" value={queue.length} hint="Needs action" />
        <KpiCard icon={Laptop} label="This Week" value={22} hint="Provisioned" />
      </div>

      {/* Charts + Dark panel */}
      <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-5)">
          <div style={{ marginBottom:4 }}>
            <h2 className="section-title">Weekly Provisioned</h2>
            <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
              <span className="kpi-md">22</span>
              <span className="caption">assets this week</span>
            </div>
          </div>
          <VerticalBarChart data={WEEKLY_PROVISIONED} xKey="day" dataKey="value" height={150} activeIndex={3} />
        </Card>

        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:14 }}>Assets by Hub</h2>
          <HorizontalBar items={HUB_ASSETS} colorVar="--chart-1" />
        </Card>

        <DarkPanel title="Urgent Actions" counter={`${tasks.filter(t=>!t.done).length} open`} subtitle="Today's provisioning">
          {tasks.map((t,i)=>(
            <DarkTaskItem key={i} title={t.title} subtitle={t.subtitle} done={t.done}
              onClick={() => setTasks(ts => ts.map((tt,ii) => ii===i ? { ...tt, done:!tt.done } : tt))} />
          ))}
        </DarkPanel>
      </div>

      {/* Queue */}
      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <h2 className="section-title">Provisioning Queue</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>All assets <ChevronRight size={13}/></Button>
        </div>
        <AnimatedList style={{ display:'grid', gap:6 }}>
          {queue.map((item,i) => (
            <AnimatedItem key={i}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)', flexWrap:'wrap' }}>
                <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:'var(--sage-100)', display:'grid', placeItems:'center', flexShrink:0 }}>
                  <Laptop size={15} style={{ color:'var(--sage-700)' }} />
                </div>
                <div style={{ flex:'1 1 200px', minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:'0.875rem', color:'var(--text-primary)' }}>{item.employee}</div>
                  <div className="meta">{item.asset} · {item.hub}</div>
                </div>
                <Badge tone={item.tone}>{item.status}</Badge>
                {item.tone !== 'success' && (
                  <Button variant="soft" size="xs" icon={CheckCircle2} onClick={() => setQueue(q => q.map((it,idx) => idx===i ? { ...it, status:'Acknowledged', tone:'success' } : it))}>
                    Allocate
                  </Button>
                )}
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </Card>
    </div>
  );
}
