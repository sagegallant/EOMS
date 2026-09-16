/**
 * TasksView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Filtered Task List + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, Badge, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../components/common/charts';
import { CheckCircle2, Clock, ListChecks, ShieldCheck, Plus, CheckSquare } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const INITIAL_TASKS = [
  { id: 1, title: 'Complete POSH Act 2013 Sensitization & Mandatory Certification', category: 'Statutory Compliance', priority: 'HIGH', due: 'Tomorrow', done: false, tone: 'danger' },
  { id: 2, title: 'Sign IP, Confidentiality & Non-Disclosure Agreement (NDA)', category: 'Legal & Compliance', priority: 'HIGH', due: 'This week', done: false, tone: 'danger' },
  { id: 3, title: '1:1 Check-in with Engineering Director (Vikram Malhotra)', category: 'Manager Meeting', priority: 'MEDIUM', due: 'Sep 18', done: false, tone: 'warning' },
  { id: 4, title: 'Complete Digital Personal Data Protection (DPDP) Module', category: 'Training', priority: 'MEDIUM', due: 'Sep 20', done: false, tone: 'warning' },
  { id: 5, title: 'Acknowledge MacBook Pro 16" M3 Hardware Delivery', category: 'IT Setup', priority: 'LOW', due: 'Done', done: true, tone: 'neutral' },
  { id: 6, title: 'Set up Enterprise Okta MFA & YubiKey 5C Token', category: 'IT Setup', priority: 'LOW', due: 'Done', done: true, tone: 'neutral' },
  { id: 7, title: 'Submit PAN Card & Aadhaar for TDS Compliance Verification', category: 'Documents', priority: 'HIGH', due: 'Done', done: true, tone: 'neutral' },
  { id: 8, title: 'Fill EPFO Form 11 & Universal Account Number (UAN) Declaration', category: 'Statutory Compliance', priority: 'HIGH', due: 'Done', done: true, tone: 'neutral' },
];

const CAT_DATA = [
  { label: 'Statutory Compliance', value: 3, displayValue: '3 tasks' },
  { label: 'IT & Hardware Setup',  value: 2, displayValue: '2 tasks' },
  { label: 'Legal & Documentation',value: 2, displayValue: '2 tasks' },
  { label: 'Training & Meetings',  value: 2, displayValue: '2 tasks' },
];

const URGENT_TASKS = [
  { title: 'POSH Act 2013 Certification', date: 'Due Tomorrow', done: false },
  { title: 'Sign IP & Confidentiality Agreement', date: 'Due Sep 17', done: false },
  { title: 'Manager 1:1 Check-in', date: 'Due Sep 18', done: false },
  { title: 'Aadhaar e-Sign Verification', date: 'Completed', done: true },
];

const PRIO_COLORS = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'neutral' };

export default function TasksView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [showDone, setShowDone] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const rowRef = useScrollReveal({ delay: 0.05 });

  const toggle = id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const pending = tasks.filter(t => !t.done);
  const completed = tasks.filter(t => t.done);
  const completionRate = Math.round((completed.length / tasks.length) * 100);

  const filteredTasks = tasks.filter(t => {
    if (filter !== 'ALL' && t.category !== filter) return false;
    if (!showDone && t.done) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Tasks & Action Items"
        subtitle="Track personal and cohort deliverables across statutory compliance, legal, and IT setup."
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Task Completion"   value={completionRate} delay={0.0} />
        <MetricPillBar label="Statutory Compliance" value={100} delay={0.1} />
        <MetricPillBar label="IT Setup Deliveries" value={85} delay={0.2} />
        <MetricPillBar label="Pending Deadlines" value={35} delay={0.3} color="amber" />
      </div>

      {/* ── Visual Section: Donut + Categories + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 12 }}>Completion Ratio</p>
            <MiniDonut
              value={completed.length}
              total={tasks.length}
              label={`${completionRate}%`}
              sublabel="completed"
              size={84}
              color="var(--chart-green)"
            />
          </Card>
          <Card style={{ padding: 'var(--sp-4)' }}>
            <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 10 }}>By Category</p>
            <HorizontalBar items={CAT_DATA} colorVar="--chart-green" />
          </Card>
        </div>
        <DarkTaskCard title="Urgent Action Items" tasks={URGENT_TASKS} />
      </div>

      {/* ── Task List Card ── */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ALL', 'Statutory Compliance', 'Legal & Compliance', 'IT Setup', 'Training'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: filter === f ? 'var(--bg-dark)' : 'var(--border-subtle)',
                  background: filter === f ? 'var(--bg-dark)' : 'var(--bg-subtle)',
                  color: filter === f ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s var(--ease)',
                }}
              >
                {f === 'ALL' ? 'All Tasks' : f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowDone(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {showDone ? 'Hide Completed' : `Show All (${completed.length} done)`}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredTasks.map(task => (
            <div
              key={task.id}
              onClick={() => toggle(task.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
                background: task.done ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                opacity: task.done ? 0.65 : 1,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  border: `2px solid ${task.done ? 'var(--primary)' : 'var(--border-default)'}`,
                  background: task.done ? 'var(--primary)' : 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {task.done && <CheckCircle2 size={13} color="#fff" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: task.done ? 400 : 600,
                    color: task.done ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: task.done ? 'line-through' : 'none',
                  }}
                >
                  {task.title}
                </div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{task.category}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge tone={PRIO_COLORS[task.priority]}>{task.priority}</Badge>
                <span className="caption" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={12} /> {task.due}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Statutory Checklist Guidelines (Indian Labor Law)" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { rule: 'POSH Act 2013 Sensitization', timeline: 'Within 7 days of joining', details: 'Mandatory annual training module under the Sexual Harassment of Women at Workplace Act.' },
              { rule: 'EPFO Form 11 & UAN Linking', timeline: 'Before 1st payroll cycle', details: 'Declaration of prior Provident Fund membership under the EPF & MP Act 1952.' },
              { rule: 'Form 12BB (Investment Declaration)', timeline: 'Within 30 days', details: 'New Tax Regime vs Old Tax Regime selection for TDS withholding under Income Tax Act.' },
            ].map((g, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{g.rule}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{g.timeline}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{g.details}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Escalation & SLA Resolution Matrix" icon={ListChecks}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { level: 'Level 1: Auto-Reminder', window: 'T-24 Hours', action: 'Slack + Email alert triggered to candidate and HR buddy.' },
              { level: 'Level 2: Manager Escalation', window: 'T+24 Hours overdue', action: 'Direct manager notified for blocker removal assistance.' },
              { level: 'Level 3: Compliance Block', window: 'T+72 Hours overdue', action: 'Payroll flag raised pending statutory documentation.' },
            ].map((m, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{m.level}</div>
                <div className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>{m.window}</div>
                <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{m.action}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>
    </div>
  );
}
