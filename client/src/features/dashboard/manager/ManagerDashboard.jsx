import { Card, Button, Badge, Progress, Kpi, Avatar } from '../../../components/common/ui';

export default function ManagerDashboard() {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display" style={{ fontSize: '1.6rem' }}>Engineering Team Onboarding</h1>
          <p className="body" style={{ color: 'var(--text-3)' }}>
            Supervise team integration, approve milestone checklists, and conduct 1:1 check-ins.
          </p>
        </div>
        <Button size="md">Schedule 1:1 Check-in</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <Kpi icon="👥" label="Direct Reports Onboarding" value="2" hint="Alex Johnson & Kenji Sato" />
        <Kpi icon="✓" label="Pending Manager Sign-offs" value="3" hint="Tasks awaiting confirmation" tone="warning" />
        <Kpi icon="📅" label="Upcoming Milestone" value="Mar 14" hint="Alex 60-day review" />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="h2">Team Members in Progress</h2>
            <p className="meta">Keep your new hires supported through their first 90 days</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          {[
            { name: 'Alex Johnson', role: 'Software Engineer', progress: 72, nextAction: '60-Day Technical Review', due: 'Tomorrow', tone: 'info' },
            { name: 'Kenji Sato', role: 'Frontend Engineer', progress: 30, nextAction: 'Local Dev Environment Setup', due: 'In 3 days', tone: 'neutral' },
          ].map(member => (
            <div
              key={member.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-4)',
                padding: 'var(--sp-3) var(--sp-4)',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-white)',
                boxShadow: 'var(--neo-sm)',
                flexWrap: 'wrap',
              }}
            >
              <Avatar name={member.name} size={42} />
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{member.name}</div>
                <div className="meta">{member.role}</div>
              </div>
              <div style={{ width: 140 }}>
                <Progress value={member.progress} size="sm" showValue={false} label="Progress" />
                <div className="meta" style={{ marginTop: 2 }}>{member.progress}% complete</div>
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <div className="caption" style={{ fontWeight: 600 }}>{member.nextAction}</div>
                <div className="meta">{member.due}</div>
              </div>
              <Button size="sm">Review Checklist</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
