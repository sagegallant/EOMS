import { useState } from 'react';
import { Card, Button, Badge, Progress, StatCard, Avatar, Modal } from '../../../components/common/ui';
import { Users, CheckSquare, Calendar, Plus, Eye, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_MEMBERS = [
  { name: 'Aarav Sharma', role: 'Senior Software Engineer (SDE-II)', progress: 72, nextAction: '60-Day Milestone Review & On-call Shadow', due: 'Due Mar 25', tone: 'info', hub: 'Bengaluru' },
  { name: 'Ananya Iyer', role: 'Lead Frontend Architect', progress: 60, nextAction: 'First Core UI PR Code Review', due: 'Due Mar 28', tone: 'success', hub: 'Bengaluru' },
  { name: 'Kabir Mehta', role: 'Senior Software Engineer (SDE-II)', progress: 35, nextAction: 'Local Docker Setup & DPDP Training', due: 'In 3 days', tone: 'neutral', hub: 'Gurugram' },
];

export default function ManagerDashboard() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState('Aarav Sharma');
  const [reviewModalMember, setReviewModalMember] = useState(null);
  const navigate = useNavigate();

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Engineering Team Onboarding &amp; Mentorship</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Supervise Platform Engineering new hires, conduct 1:1 check-ins, and sign off 30/60/90 milestones.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsScheduleOpen(true)}>
          Schedule 1:1 Check-in
        </Button>
      </header>

      {/* ── 3 Executive KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <StatCard
          icon={Users}
          label="Direct Reports Onboarding"
          value="3"
          hint="Aarav Sharma, Ananya Iyer, Kabir Mehta"
          tone="primary"
        />
        <StatCard
          icon={CheckSquare}
          label="Pending Manager Sign-offs"
          value="2"
          hint="Sprint PR review &amp; milestone approval"
          tone="warning"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Milestone Review"
          value="Mar 25"
          hint="Aarav Sharma 60-day review"
          tone="info"
        />
      </div>

      {/* ── Team Members List Card ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="h2">Team Members in Progress</h2>
            <p className="meta">Keep your new hires supported through their first 90 days of contribution</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {members.map(m => (
            <div
              key={m.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xs)',
                flexWrap: 'wrap',
              }}
            >
              <Avatar name={m.name} size={42} />
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                <div className="meta">{m.role} · {m.hub}</div>
              </div>

              <div style={{ width: 140 }}>
                <Progress value={m.progress} size="sm" showValue={false} />
                <div className="meta" style={{ marginTop: 2, textAlign: 'right' }}>
                  {m.progress}% complete
                </div>
              </div>

              <div style={{ flex: '1 1 220px' }}>
                <div className="caption" style={{ fontWeight: 600 }}>{m.nextAction}</div>
                <div className="meta">{m.due}</div>
              </div>

              <Button size="xs" variant="soft" onClick={() => setReviewModalMember(m)}>
                Review Checklist
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Schedule 1:1 Modal ── */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule 1:1 Check-in"
        description="Select a direct report to conduct a progress and milestone review."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
            <Button onClick={() => { alert(`1:1 invitation dispatched to ${selectedReport} via Google Calendar!`); setIsScheduleOpen(false); }}>
              Confirm Meeting
            </Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>Select Team Member</label>
            <select
              value={selectedReport}
              onChange={e => setSelectedReport(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                fontSize: '0.875rem',
              }}
            >
              {members.map(m => (
                <option key={m.name} value={m.name}>{m.name} ({m.progress}% - {m.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.8125rem', fontWeight: 600 }}>Meeting Type</label>
            <select
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                fontSize: '0.875rem',
              }}
            >
              <option>30-Day Check-in &amp; Retrospective</option>
              <option>60-Day Milestone Sign-off</option>
              <option>90-Day Full Performance Evaluation</option>
              <option>Weekly Onboarding Sync</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* ── Review Checklist Modal ── */}
      {reviewModalMember && (
        <Modal
          isOpen={true}
          onClose={() => setReviewModalMember(null)}
          title={`Onboarding Review: ${reviewModalMember.name}`}
          description={`${reviewModalMember.role} · Current Progress: ${reviewModalMember.progress}%`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setReviewModalMember(null)}>Close</Button>
              <Button onClick={() => { alert(`Milestone signed off for ${reviewModalMember.name}!`); setReviewModalMember(null); }}>
                Approve Milestone Sign-off
              </Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', fontSize: '0.84rem' }}>
              <div><strong>Upcoming Item:</strong> {reviewModalMember.nextAction}</div>
              <div style={{ marginTop: 4 }}><strong>Timeline:</strong> {reviewModalMember.due}</div>
            </div>
            <Progress value={reviewModalMember.progress} label="Onboarding Milestone" />
          </div>
        </Modal>
      )}
    </div>
  );
}
