import { useState } from 'react';
import { Card, Button, Badge, Avatar, AnimatedList, AnimatedItem, PageHeader, KpiCard } from '../../components/common/ui';
import { HorizontalBar, MiniDonut } from '../../components/common/charts';
import { Plus, Search, Filter, X, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const EMPLOYEES = [
  { id:1, name:'Aarav Sharma',    role:'SDE-II',              dept:'Platform Engineering', hub:'Bengaluru', progress:72, status:'On Track',     tone:'sage'    },
  { id:2, name:'Sneha Kulkarni',  role:'Sr. Product Designer', dept:'Product & UX',         hub:'Pune',      progress:45, status:'Needs Review', tone:'warning' },
  { id:3, name:'Arjun Rao',       role:'Cloud Infra Specialist',dept:'Cloud & Infra',       hub:'Hyderabad', progress:88, status:'On Track',     tone:'sage'    },
  { id:4, name:'Ananya Iyer',     role:'Lead Frontend Arch',   dept:'Platform Engineering', hub:'Bengaluru', progress:60, status:'On Track',     tone:'sage'    },
  { id:5, name:'Kabir Mehta',     role:'SDE-II',              dept:'Platform Engineering', hub:'Gurugram',  progress:35, status:'Just Started', tone:'info'    },
  { id:6, name:'Tanvi Reddy',     role:'Talent Partner',       dept:'People Ops',           hub:'Hyderabad', progress:55, status:'On Track',     tone:'sage'    },
  { id:7, name:'Pooja Desai',     role:'Product Operations Lead',dept:'Product & UX',       hub:'Mumbai',    progress:20, status:'Just Started', tone:'info'    },
];

const DEPT_BARS = [
  { label:'Platform Engineering', value:3, displayValue:'3 employees' },
  { label:'Product & UX',         value:2, displayValue:'2 employees' },
  { label:'Cloud & Infra',        value:1, displayValue:'1 employee'  },
  { label:'People Ops',           value:1, displayValue:'1 employee'  },
];

export default function EmployeeDirectory() {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');

  const filtered = EMPLOYEES.filter(e => {
    const q = search.toLowerCase();
    if (q && !e.name.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q)) return false;
    if (filterDept!=='ALL' && e.dept!==filterDept) return false;
    return true;
  });

  const onTrack = EMPLOYEES.filter(e=>e.status==='On Track').length;

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Employee Directory" subtitle={`${filtered.length} of ${EMPLOYEES.length} employees`}
        action={<Button size="sm" icon={Plus}>Add Employee</Button>} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:12 }}>Onboarding Status</div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <MiniDonut value={onTrack} total={EMPLOYEES.length} label={`${onTrack}`} sublabel="on track" size={72} color="var(--chart-1)" />
            <div style={{ fontSize:'0.8125rem', display:'grid', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}><span style={{ color:'var(--text-muted)' }}>On Track</span><span style={{ fontWeight:700, color:'var(--sage-700)' }}>{onTrack}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}><span style={{ color:'var(--text-muted)' }}>Needs Review</span><span style={{ fontWeight:700, color:'var(--warning-text)' }}>{EMPLOYEES.filter(e=>e.status==='Needs Review').length}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}><span style={{ color:'var(--text-muted)' }}>Just Started</span><span style={{ fontWeight:700 }}>{EMPLOYEES.filter(e=>e.status==='Just Started').length}</span></div>
            </div>
          </div>
        </Card>
        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:10 }}>By Department</div>
          <HorizontalBar items={DEPT_BARS} colorVar="--chart-1" />
        </Card>
      </div>

      {/* Search + Filter */}
      <Card $p="var(--sp-3) var(--sp-4)" style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px' }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or role…"
            style={{ width:'100%', padding:'7px 10px 7px 30px', fontSize:'0.8125rem', borderRadius:'var(--r-full)', border:'1.5px solid var(--border-default)', background:'var(--sage-50)', color:'var(--text-primary)', outline:'none', transition:'border-color var(--t-fast)' }}
            onFocus={e=>e.target.style.borderColor='var(--sage-500)'}
            onBlur={e=>e.target.style.borderColor='var(--border-default)'} />
        </div>
        <Button variant="ghost" size="sm" icon={Filter} onClick={() => setShowFilters(v=>!v)}>Filter {filterDept!=='ALL'&&'●'}</Button>
        {showFilters && (
          <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}
            style={{ padding:'5px 10px', fontSize:'0.8125rem', borderRadius:'var(--r-md)', border:'1px solid var(--border-default)', background:'var(--bg-surface)', color:'var(--text-primary)' }}>
            <option value="ALL">All Departments</option>
            <option>Platform Engineering</option><option>Product & UX</option>
            <option>Cloud & Infra</option><option>People Ops</option>
          </select>
        )}
        {filterDept!=='ALL' && (
          <button onClick={()=>setFilterDept('ALL')} style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.8125rem', color:'var(--danger)', background:'none', border:'none', cursor:'pointer' }}>
            <X size={12}/> Clear
          </button>
        )}
      </Card>

      <AnimatedList style={{ display:'grid', gap:6 }}>
        {filtered.map(emp => (
          <AnimatedItem key={emp.id}>
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)', transition:'all var(--t-fast)' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-50)';e.currentTarget.style.borderColor='var(--sage-200)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-surface)';e.currentTarget.style.borderColor='var(--border-subtle)'}}>
              <Avatar name={emp.name} size={38} />
              <div style={{ flex:'1 1 200px', minWidth:0 }}>
                <div style={{ fontWeight:500, fontSize:'0.875rem', color:'var(--text-primary)' }}>{emp.name}</div>
                <div className="meta">{emp.role} · {emp.dept}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                <MapPin size={11}/>{emp.hub}
              </div>
              <div style={{ width:90 }}>
                <div style={{ height:4, borderRadius:'var(--r-full)', background:'var(--sage-100)', overflow:'hidden' }}>
                  <motion.div initial={{ width:0 }} animate={{ width:`${emp.progress}%` }} transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
                    style={{ height:'100%', borderRadius:'inherit', background:'var(--sage-600)' }} />
                </div>
                <div className="meta" style={{ marginTop:2, textAlign:'right', fontWeight:600, color:'var(--sage-700)', fontFeatureSettings:'"tnum" 1' }}>{emp.progress}%</div>
              </div>
              <Badge tone={emp.tone}>{emp.status}</Badge>
            </div>
          </AnimatedItem>
        ))}
      </AnimatedList>
    </div>
  );
}
