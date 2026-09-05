import { useState } from 'react';
import { Card, Button, Badge, Progress, Avatar, Modal } from '../../../components/common/ui';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, Calendar, ArrowRight, ShieldCheck, Laptop, GraduationCap, FileText, Sparkles } from 'lucide-react';

const INITIAL_STEPS = [
  { id: 1, title: 'Complete POSH Sensitization & Certification Quiz', category: 'Statutory Compliance', due: 'Due tomorrow', time: '45 mins', cta: 'Continue', done: false, route: '/training' },
  { id: 2, title: '1:1 Milestone Check-in with Vikram Malhotra (Director)', category: 'Manager 1:1', due: 'Due Mar 25', time: '30 mins', cta: 'Schedule', done: false, route: '/tasks' },
  { id: 3, title: 'Verify MacBook Pro 16" & YubiKey Asset Allocation', category: 'IT Hardware', due: 'Due this week', time: '15 mins', cta: 'Acknowledge', done: true, route: '/assets' },
];

export default function EmployeeDashboard() {
  const [steps, setSteps] = useState(INITIAL_STEPS);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleStepClick = step => {
    if (step.cta === 'Schedule') {
      setScheduleModalOpen(true);
    } else {
      navigate(step.route);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      {/* ── Greeting Header with Progress Identity ── */}
      <Card style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Avatar name="Aarav Sharma" size={64} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 className="display" style={{ fontSize: '1.6rem' }}>Namaste, Aarav 👋</h1>
                <Badge tone="success" icon={Sparkles}>Week 3 Active</Badge>
              </div>
              <p className="body" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                Senior Software Engineer (SDE-II) · Platform Engineering · Bengaluru Hub (Bellandur)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ProgressRing value={72} />
            <div style={{ maxWidth: 220 }}>
              <div className="h2" style={{ color: 'var(--text-primary)' }}>72% Complete</div>
              <p className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                On track for full 90-day milestone sign-off by <strong>April 12, 2026</strong>.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Next Steps Action Card ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 className="h2">Your Immediate Next Steps</h2>
            <p className="meta">High-priority items requiring action this week</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
            View All Tasks →
          </Button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {steps.map(s => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                background: s.done ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xs)',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: s.done ? 'var(--success-bg)' : 'var(--primary-light)',
                  color: s.done ? 'var(--success)' : 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {s.done ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              </div>

              <div style={{ flex: '1 1 240px' }}>
                <div style={{ fontWeight: 600, color: s.done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {s.title}
                </div>
                <div className="meta" style={{ marginTop: 2 }}>
                  {s.category} · {s.due} · ~{s.time}
                </div>
              </div>

              <Badge tone={s.done ? 'success' : 'warning'}>
                {s.done ? 'Completed' : 'Pending'}
              </Badge>

              <Button
                size="sm"
                variant={s.done ? 'secondary' : 'primary'}
                onClick={() => handleStepClick(s)}
              >
                {s.cta}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 30/60/90 Journey Timeline ── */}
      <Card>
        <h2 className="h2" style={{ marginBottom: 4 }}>Your Onboarding Roadmap</h2>
        <p className="meta" style={{ marginBottom: 20 }}>Day 1 through 90 Days to Full Contributor Independence</p>
        <Timeline
          current={3}
          stages={[
            { label: 'Day 1', date: 'Jan 12', desc: 'Orientation & Laptop Setup', done: true },
            { label: 'Week 1', date: 'Jan 19', desc: 'Team & Security Setup', done: true },
            { label: '30 Days', date: 'Feb 11', desc: 'First Pull Request & POSH', done: true },
            { label: '60 Days', date: 'Mar 15', desc: 'Project Ownership Sign-off', current: true, done: false },
            { label: '90 Days', date: 'Apr 12', desc: 'Full Performance Evaluation', done: false },
          ]}
        />
      </Card>

      {/* ── 2 Summary Widgets: Documents & Training ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-5)' }}>
        <Card style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="h2">My Statutory Documents</h2>
              <p className="meta">4 of 5 Indian compliance records approved</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/documents')}>
              Open →
            </Button>
          </div>
          <Progress value={80} label="Document compliance" />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge tone="success" icon={CheckCircle2}>4 Verified</Badge>
            <Badge tone="warning" icon={Clock}>1 POSH Sign-off in Queue</Badge>
          </div>
        </Card>

        <Card style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="h2">My Training Courses</h2>
              <p className="meta">3 mandatory modules completed</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/training')}>
              Catalog →
            </Button>
          </div>
          <div style={{ display: 'grid', gap: 10, fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <strong>POSH Act 2013 Sensitization</strong>
                <div className="meta">64% completed · Due tomorrow</div>
              </div>
              <Button size="xs" variant="soft" onClick={() => navigate('/training')}>Continue</Button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
              <div>
                <strong>InfoSec &amp; DPDP Act Compliance</strong>
                <div className="meta">100% completed · Score 92%</div>
              </div>
              <Badge tone="success">Passed</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Schedule 1:1 Modal ── */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule 1:1 Milestone Check-in"
        description="Connect with Engineering Director Vikram Malhotra for your 60-day review."
        footer={
          <>
            <Button variant="secondary" onClick={() => setScheduleModalOpen(false)}>Cancel</Button>
            <Button onClick={() => { alert('Check-in invite dispatched to Vikram Malhotra via Google Calendar!'); setScheduleModalOpen(false); }}>
              Send Calendar Invite
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', fontSize: '0.84rem' }}>
            <div><strong>Host:</strong> Vikram Malhotra (Director of Engineering)</div>
            <div><strong>Location:</strong> Google Meet / Bellandur HQ Meeting Room 3B</div>
            <div><strong>Agenda:</strong> 60-day feature sprint ownership &amp; architectural feedback</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProgressRing({ value }) {
  const r = 36, c = 2 * Math.PI * r;
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" role="img" aria-label={`Onboarding ${value}% complete`}>
      <circle cx="45" cy="45" r={r} fill="none" stroke="var(--bg-sunken)" strokeWidth="8" />
      <circle
        cx="45"
        cy="45"
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(c * value) / 100} ${c}`}
        transform="rotate(-90 45 45)"
      />
      <text x="45" y="52" textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text-primary)">
        {value}%
      </text>
    </svg>
  );
}

function Timeline({ stages, current }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', padding: '10px 0' }}>
      {stages.map((s, i) => {
        const isCurrent = i === current;
        return (
          <div key={s.label} style={{ flex: 1, minWidth: 120, textAlign: 'center', position: 'relative' }}>
            {i > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: '-50%',
                  width: '100%',
                  height: 3,
                  background: s.done || isCurrent ? 'var(--primary)' : 'var(--bg-sunken)',
                  zIndex: 0,
                }}
              />
            )}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: 30,
                height: 30,
                borderRadius: '50%',
                margin: '0 auto',
                background: s.done ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--bg-surface)',
                color: s.done || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                border: `2px solid ${s.done ? 'var(--success)' : isCurrent ? 'var(--primary)' : 'var(--border-default)'}`,
                display: 'grid',
                placeItems: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {s.done ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 8, color: isCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>
              {s.label}
            </div>
            <div className="meta">{s.date}</div>
            <div className="meta" style={{ marginTop: 2, fontSize: '0.7rem' }}>{s.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
