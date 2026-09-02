import { useState } from 'react';
import { Card, Button, Badge, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../components/common/charts';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const INITIAL_TASKS = [
  { id: 1, title: 'Complete POSH Act 2013 Sensitization & Certification', category: 'Statutory Compliance', priority: 'HIGH', due: 'Tomorrow', done: false, tone: 'danger' },
  { id: 2, title: 'Sign IP & Confidentiality Agreement', category: 'Legal & Compliance', priority: 'HIGH', due: 'This week', done: false, tone: 'danger' },
  { id: 3, title: '1:1 Check-in with Engineering Director', category: 'Manager Meeting', priority: 'MEDIUM', due: 'Mar 25', done: false, tone: 'warning' },
  { id: 4, title: 'Complete Data Protection & DPDP Training Module', category: 'Training', priority: 'MEDIUM', due: 'Mar 28', done: false, tone: 'warning' },
  { id: 5, title: 'Acknowledge MacBook Pro 16" Asset Allocation', category: 'IT Setup', priority: 'LOW', due: 'Done', done: true, tone: 'neutral' },
  { id: 6, title: 'Set up Google Workspace 2FA & YubiKey', category: 'IT Setup', priority: 'LOW', due: 'Done', done: true, tone: 'neutral' },
  { id: 7, title: 'Submit PAN Card & Aadhaar for TDS Verification', category: 'Documents', priority: 'HIGH', due: 'Done', done: true, tone: 'neutral' },
];

const CAT_DATA = [
  { label: 'IT Setup',       value: 2, displayValue: '2 tasks' },
  { label: 'Compliance',     value: 3, displayValue: '3 tasks' },
  { label: 'Training',       value: 1, displayValue: '1 task' },
  { label: 'Manager 1:1',    value: 1, displayValue: '1 task' },
];

const PRIO_COLORS = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'neutral' };

export default function TasksView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [showDone, setShowDone]   = useState(false);
  const [filter, setFilter]       = useState('ALL');

  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);
  const all       = filter === 'ALL' ? (showDone ? tasks : pending) : tasks.filter(t => t.category === filter && (showDone || !t.done));

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="Tasks" subtitle={`${pending.length} pending · ${completed.length} completed`} />

      {/* ── Summary Row (Bento Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        <Card $hoverable style={{ gridColumn: 'span 5', padding: 'var(--sp-5)' }}>
          <p className="meta" style={{ fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-4)' }}>Completion Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <MiniDonut value={completed.length} total={tasks.length} label={`${completed.length}`} sublabel={`/ ${tasks.length}`} size={88} color="var(--chart-emerald)" />
            <div style={{ fontSize: '0.9375rem', display: 'grid', gap: 8, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Completed</span><span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{completed.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pending</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pending.length}</span>
              </div>
            </div>
          </div>
        </Card>
        <Card $hoverable style={{ gridColumn: 'span 7', padding: 'var(--sp-5)' }}>
          <p className="meta" style={{ fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-4)' }}>By Category</p>
          <HorizontalBar items={CAT_DATA} colorVar="--chart-blue" />
        </Card>
      </div>

      {/* ── Task List ── */}
      <Card $hoverable style={{ padding: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['ALL', 'Statutory Compliance', 'Training', 'IT Setup'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 12px', borderRadius: 'var(--r-full)', fontSize: '0.8125rem', fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all var(--t-fast)',
                  borderColor: filter === f ? 'var(--primary)' : 'var(--border-default)',
                  background: filter === f ? 'var(--primary-light)' : 'transparent',
                  color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                {f === 'ALL' ? 'All' : f.split(' ')[0]}
              </button>
            ))}
          </div>
          <button onClick={() => setShowDone(v => !v)} className="meta" style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 500 }}>
            {showDone ? 'Hide done' : `${completed.length} done`}
          </button>
        </div>
        <AnimatedList style={{ display: 'grid', gap: 8 }}>
          {all.map(task => (
            <AnimatedItem key={task.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', opacity: task.done ? 0.55 : 1, cursor: 'pointer', transition: 'all var(--t-fast)' }}
                onClick={() => toggle(task.id)}
                onMouseEnter={e => { if (!task.done) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                <div style={{ width: 20, height: 20, borderRadius: 'var(--r-xs)', border: `2px solid ${task.done ? 'var(--success)' : 'var(--border-default)'}`, background: task.done ? 'var(--success)' : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all var(--t-fast)' }}>
                  {task.done && <CheckCircle2 size={14} color="#fff" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: task.done ? 400 : 600, color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>
                    {task.title}
                  </div>
                  <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{task.category}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Badge tone={PRIO_COLORS[task.priority]}>{task.priority}</Badge>
                  <span className="meta" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                    <Clock size={13} />{task.due}
                  </span>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </Card>
    </div>
  );
}
