import { useState } from 'react';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader, SegmentedProgress } from '../../components/common/ui';
import { StackedBarChart, RadialProgress } from '../../components/common/charts';
import { Plus, Filter, Calendar, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

const COHORTS = [
  { id:1, name:'Aarav Sharma',   role:'SDE-II',                dept:'Platform Engineering', hub:'Bengaluru', startDate:'Jan 12, 2026', progress:72, phase:'60 Days', status:'On Track',     tone:'sage'    },
  { id:2, name:'Sneha Kulkarni', role:'Sr. Product Designer',   dept:'Product & UX',         hub:'Pune',      startDate:'Jan 20, 2026', progress:45, phase:'30 Days', status:'Needs Review', tone:'warning' },
  { id:3, name:'Arjun Rao',      role:'Cloud Infra Specialist', dept:'Cloud & Infra',         hub:'Hyderabad', startDate:'Feb 02, 2026', progress:88, phase:'90 Days', status:'Ahead',        tone:'sage'    },
  { id:4, name:'Ananya Iyer',    role:'Lead Frontend Arch',     dept:'Platform Engineering', hub:'Bengaluru', startDate:'Feb 10, 2026', progress:60, phase:'30 Days', status:'On Track',     tone:'sage'    },
  { id:5, name:'Kabir Mehta',    role:'SDE-II',                dept:'Platform Engineering', hub:'Gurugram',  startDate:'Feb 20, 2026', progress:35, phase:'Week 1',  status:'On Track',     tone:'info'    },
];

const PHASE_DATA = [
  { phase:'Pre-board', count:1 }, { phase:'Week 1', count:2 }, { phase:'30 Days', count:2 }, { phase:'60 Days', count:1 }, { phase:'90 Days', count:1 },
];

const COHORT_SEGMENTS = [
  { label:'Pre-boarding', value:10, color:'var(--sage-200)' },
  { label:'Week 1',       value:20, color:'var(--sage-400)' },
  { label:'30 Days',      value:30, color:'var(--sage-600)' },
  { label:'60 Days',      value:20, color:'var(--sage-700)' },
  { label:'90 Days',      value:10, color:'var(--sage-900)' },
];

export default function OnboardingView() {
  const [cohorts, setCohorts] = useState(COHORTS);
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');
  const [isModalOpen, setModal] = useState(false);
  const [newPlan, setNew] = useState({ name:'', role:'SDE-II', dept:'Platform Engineering', hub:'Bengaluru (Hybrid)', startDate:new Date().toISOString().slice(0,10) });

  const filtered = cohorts.filter(c => filterDept==='ALL' || c.dept===filterDept);
  const avg = Math.round(filtered.reduce((s,c)=>s+c.progress,0)/(filtered.length||1));

  const handleCreate = e => {
    e.preventDefault();
    if (!newPlan.name.trim()) return;
    setCohorts([{ id:Date.now(), ...newPlan, progress:0, phase:'Pre-boarding', status:'Just Started', tone:'info' }, ...cohorts]);
    setModal(false);
    setNew({ name:'', role:'SDE-II', dept:'Platform Engineering', hub:'Bengaluru (Hybrid)', startDate:new Date().toISOString().slice(0,10) });
  };

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Onboarding" subtitle={`${filtered.length} employees · ${avg}% avg progress`}
        action={
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="secondary" size="sm" icon={Filter} onClick={() => setShowFilters(v=>!v)}>Filter {filterDept!=='ALL'&&'●'}</Button>
            <Button size="sm" icon={Plus} onClick={() => setModal(true)}>Assign Plan</Button>
          </div>
        } />

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Cohort by Onboarding Phase</h2>
        <SegmentedProgress segments={COHORT_SEGMENTS} />
      </Card>

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Phase Distribution</h2>
        <StackedBarChart data={PHASE_DATA} xKey="phase" categories={[{ dataKey:'count', name:'Employees', color:'var(--chart-1)' }]} height={130} />
      </Card>

      {showFilters && (
        <Card $p="var(--sp-3) var(--sp-4)" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}
            style={{ padding:'5px 10px', fontSize:'0.8125rem', borderRadius:'var(--r-md)', border:'1px solid var(--border-default)', background:'var(--bg-surface)', color:'var(--text-primary)' }}>
            <option value="ALL">All Departments</option>
            <option>Platform Engineering</option><option>Product & UX</option>
            <option>Cloud & Infra</option>
          </select>
          {filterDept!=='ALL' && <button onClick={()=>setFilterDept('ALL')} style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.8125rem', color:'var(--danger)', background:'none', border:'none', cursor:'pointer' }}><X size={12}/> Clear</button>}
        </Card>
      )}

      <AnimatedList style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'var(--sp-4)' }}>
        {filtered.map(c => (
          <AnimatedItem key={c.id}>
            <Card $hoverable style={{ display:'grid', gap:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <Avatar name={c.name} size={38} />
                  <div>
                    <div className="h3">{c.name}</div>
                    <div className="meta">{c.role}</div>
                  </div>
                </div>
                <Badge tone={c.tone}>{c.status}</Badge>
              </div>
              <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                <RadialProgress value={c.progress} size={72} strokeWidth={6}
                  color={c.tone==='warning'?'var(--warning)':c.tone==='info'?'var(--chart-4)':'var(--chart-1)'} label={`${c.progress}%`} />
                <div style={{ fontSize:'0.8125rem', display:'grid', gap:5, flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-muted)' }}>Hub</span><span style={{ fontWeight:500 }}>{c.hub}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'var(--text-muted)' }}>Phase</span><span style={{ fontWeight:500, color:'var(--sage-700)' }}>{c.phase}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}><Calendar size={11}/> {c.startDate}</span>
                    <Button size="xs" variant="ghost">View <ChevronRight size={11}/></Button>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedItem>
        ))}
      </AnimatedList>

      <Modal isOpen={isModalOpen} onClose={() => setModal(false)} title="Assign Onboarding Plan"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleCreate}>Create & Assign</Button></>}>
        <form onSubmit={handleCreate} style={{ display:'grid', gap:14 }}>
          <div><Label>Employee Full Name</Label><Input required placeholder="e.g. Rohan Sen" value={newPlan.name} onChange={e=>setNew({...newPlan,name:e.target.value})} /></div>
          <div><Label>Department</Label><Select value={newPlan.dept} onChange={e=>setNew({...newPlan,dept:e.target.value})}><option>Platform Engineering</option><option>Product & UX</option><option>Cloud & Infra</option><option>People Operations</option></Select></div>
          <div><Label>Job Role</Label><Input required value={newPlan.role} onChange={e=>setNew({...newPlan,role:e.target.value})} /></div>
          <div><Label>Tech Hub</Label><Select value={newPlan.hub} onChange={e=>setNew({...newPlan,hub:e.target.value})}><option>Bengaluru (Hybrid)</option><option>Hyderabad (On-site)</option><option>Pune (Hybrid)</option><option>Gurugram (Hybrid)</option><option>Remote (Pan-India)</option></Select></div>
          <div><Label>Start Date</Label><Input type="date" value={newPlan.startDate} onChange={e=>setNew({...newPlan,startDate:e.target.value})} /></div>
        </form>
      </Modal>
    </div>
  );
}
