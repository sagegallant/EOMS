import { useState } from 'react';
import { Card, Button, Badge, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../components/common/charts';
import { CheckCircle2, Clock, AlertCircle, Laptop, BookOpen, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const INITIAL_TASKS = [
  { id:1, title:'Complete POSH Act 2013 Certification',    category:'Statutory Compliance',  priority:'HIGH',   due:'Tomorrow',  done:false, icon:FileText   },
  { id:2, title:'Sign IP & Confidentiality Agreement',    category:'Legal & Compliance',     priority:'HIGH',   due:'This week', done:false, icon:FileText   },
  { id:3, title:'1:1 Check-in with Vikram Malhotra',      category:'Manager Meeting',        priority:'MEDIUM', due:'Sep 25',    done:false, icon:Clock      },
  { id:4, title:'Complete DPDP Training Module',          category:'Training',               priority:'MEDIUM', due:'Sep 28',    done:false, icon:BookOpen   },
  { id:5, title:'Acknowledge MacBook Pro 16" Asset',      category:'IT Setup',               priority:'LOW',    due:'Done',      done:true,  icon:Laptop     },
  { id:6, title:'Set up Google Workspace 2FA & YubiKey',  category:'IT Setup',               priority:'LOW',    due:'Done',      done:true,  icon:Laptop     },
  { id:7, title:'Submit PAN Card & Aadhaar (TDS verify)', category:'Documents',              priority:'HIGH',   due:'Done',      done:true,  icon:FileText   },
];

const PRIO = { HIGH:'danger', MEDIUM:'warning', LOW:'neutral' };

const CAT_BARS = [
  { label:'Compliance',  value:3, displayValue:'3 tasks' },
  { label:'IT Setup',    value:2, displayValue:'2 tasks' },
  { label:'Training',    value:1, displayValue:'1 task'  },
  { label:'Manager 1:1', value:1, displayValue:'1 task'  },
];

export default function TasksView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [showDone, setShowDone] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const toggle = id => setTasks(ts => ts.map(t => t.id===id ? { ...t, done:!t.done } : t));
  const pending   = tasks.filter(t=>!t.done);
  const completed = tasks.filter(t=>t.done);
  const all = (filter==='ALL' ? (showDone?tasks:pending) : tasks.filter(t=>t.category===filter&&(showDone||!t.done)));

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Tasks" subtitle={`${pending.length} pending · ${completed.length} completed`} />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:12 }}>Completion Status</div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <MiniDonut value={completed.length} total={tasks.length} label={`${completed.length}`} sublabel={`/ ${tasks.length}`} size={72} color="var(--chart-1)" />
            <div style={{ fontSize:'0.8125rem', display:'grid', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:16 }}><span style={{ color:'var(--text-muted)' }}>Done</span><span style={{ fontWeight:700, color:'var(--sage-700)', fontFeatureSettings:'"tnum" 1' }}>{completed.length}</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', gap:16 }}><span style={{ color:'var(--text-muted)' }}>Pending</span><span style={{ fontWeight:700, color:'var(--text-primary)' }}>{pending.length}</span></div>
            </div>
          </div>
        </Card>
        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:10 }}>By Category</div>
          <HorizontalBar items={CAT_BARS} colorVar="--chart-1" />
        </Card>
      </div>

      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['ALL','Statutory Compliance','Training','IT Setup'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:'4px 11px', borderRadius:'var(--r-full)', fontSize:'0.75rem', fontWeight:600, border:'1.5px solid', cursor:'pointer', transition:'all var(--t-fast)',
                  borderColor: filter===f?'var(--sage-600)':'var(--border-default)',
                  background:  filter===f?'var(--sage-100)':'transparent',
                  color:       filter===f?'var(--sage-800)':'var(--text-muted)',
                }}>
                {f==='ALL'?'All':f.split(' ')[0]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowDone(v=>!v)} className="meta" style={{ color:'var(--text-muted)', cursor:'pointer', background:'none', border:'none' }}>
            {showDone?'Hide done':`${completed.length} done`}
          </button>
        </div>
        <AnimatedList style={{ display:'grid', gap:6 }}>
          {all.map(task => {
            const Icon = task.icon;
            return (
              <AnimatedItem key={task.id}>
                <div onClick={() => toggle(task.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', opacity:task.done?0.5:1, cursor:'pointer', transition:'all var(--t-fast)', background:'var(--bg-surface)' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--sage-300)';e.currentTarget.style.background='var(--sage-50)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-subtle)';e.currentTarget.style.background='var(--bg-surface)'}}>
                  <div style={{ width:20, height:20, borderRadius:4, border:`2px solid ${task.done?'var(--sage-600)':'var(--border-default)'}`, background:task.done?'var(--sage-600)':'transparent', display:'grid', placeItems:'center', flexShrink:0, transition:'all var(--t-fast)' }}>
                    {task.done && <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 5.5L4.5 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:task.done?400:500, color:task.done?'var(--text-muted)':'var(--text-primary)', textDecoration:task.done?'line-through':'none' }}>{task.title}</div>
                    <div className="meta">{task.category}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <Badge tone={PRIO[task.priority]}>{task.priority}</Badge>
                    <span className="meta" style={{ display:'flex', alignItems:'center', gap:3 }}><Clock size={11}/>{task.due}</span>
                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      </Card>
    </div>
  );
}
