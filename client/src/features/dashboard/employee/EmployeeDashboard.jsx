import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Avatar, AnimatedList, AnimatedItem, PageHeader } from '../../../components/common/ui';
import { RadialProgress, Sparkline } from '../../../components/common/charts';
import { CheckCircle2, Clock, ChevronRight, BookOpen, Laptop, FileCheck } from 'lucide-react';

const SPARK = [
  { d: 'M', v: 2 }, { d: 'T', v: 3 }, { d: 'W', v: 1 }, { d: 'T', v: 4 },
  { d: 'F', v: 2 }, { d: 'S', v: 0 }, { d: 'S', v: 1 },
];

const TASKS = [
  { id: 1, title: 'Complete POSH Sensitization Quiz', category: 'Statutory Compliance', due: 'Due tomorrow', icon: FileCheck, route: '/training', done: false },
  { id: 2, title: '1:1 Check-in with Vikram Malhotra', category: 'Manager Meeting', due: 'Due Mar 25', icon: Clock, route: '/tasks', done: false },
  { id: 3, title: 'Acknowledge MacBook Pro M3 Asset', category: 'IT Hardware', due: 'Completed', icon: Laptop, route: '/assets', done: true },
];

const MODULES = [
  { label: 'POSH Act 2013', pct: 68, color: 'var(--chart-blue)' },
  { label: 'Data Protection (DPDP)', pct: 40, color: 'var(--chart-violet)' },
  { label: 'Engineering Best Practices', pct: 90, color: 'var(--chart-emerald)' },
];

export default function EmployeeDashboard() {
  const [tasks, setTasks] = useState(TASKS);
  const [showCompleted, setShowCompleted] = useState(false);
  const navigate = useNavigate();

  const pending   = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);
  const visible   = showCompleted ? tasks : pending;

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="My Journey" subtitle="Track your onboarding progress and next steps." />

      {/* ── Hero Row (Bento Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        {/* Progress ring */}
        <Card $hoverable style={{ gridColumn: 'span 8', padding: 'var(--sp-5)', display: 'flex', alignItems: 'center', gap: 24 }}>
          <RadialProgress value={72} size={120} strokeWidth={10} color="var(--chart-blue)" label="72%" sublabel="Complete" />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Aarav Sharma</div>
            <div className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>SDE-II · Platform Engineering</div>
            <div className="body" style={{ color: 'var(--text-muted)', marginTop: 2 }}>Bengaluru Hub · Week 3 of 90</div>
            <div className="meta" style={{ marginTop: 12, color: 'var(--success-text)', fontWeight: 600 }}>On track for Apr 12 sign-off ✓</div>
          </div>
        </Card>

        {/* Activity sparkline */}
        <Card $hoverable style={{ gridColumn: 'span 4', padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p className="meta" style={{ fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Activity</p>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, letterSpacing: '-0.02em' }}>13 tasks</div>
              <div className="meta" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>done this week</div>
            </div>
            <Badge tone="success">On Track</Badge>
          </div>
          <Sparkline data={SPARK} dataKey="v" color="var(--chart-blue)" height={56} showDot={false} />
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        {/* ── Training Progress ── */}
        <Card $hoverable style={{ gridColumn: 'span 5', padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
            <h2 className="h3">Training Modules</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/training')}>View all <ChevronRight size={13} /></Button>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            {MODULES.map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.pct}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 'inherit', transition: 'width 700ms var(--ease)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Next Tasks ── */}
        <Card $hoverable style={{ gridColumn: 'span 7', padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
            <h2 className="h3">Next Actions</h2>
            <button onClick={() => setShowCompleted(v => !v)} className="meta" style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 500 }}>
              {showCompleted ? 'Hide completed' : `+ ${completed.length} completed`}
            </button>
          </div>
          <AnimatedList style={{ display: 'grid', gap: 8 }}>
            {visible.map(task => {
              const Icon = task.icon;
              return (
                <AnimatedItem key={task.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', opacity: task.done ? 0.5 : 1, transition: 'opacity var(--t-fast)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--r-sm)', background: task.done ? 'var(--success-bg)' : 'var(--primary-light)', color: task.done ? 'var(--success)' : 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {task.done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: task.done ? 400 : 600, color: task.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</div>
                      <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{task.category} · {task.due}</div>
                    </div>
                    {!task.done && (
                      <Button variant="soft" size="xs" onClick={() => navigate(task.route)}>Go <ChevronRight size={12} /></Button>
                    )}
                  </div>
                </AnimatedItem>
              );
            })}
          </AnimatedList>
        </Card>
      </div>
    </div>
  );
}
