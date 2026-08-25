import { Card, Button, Badge, Progress, Kpi, Avatar } from '../../../components/common/ui';

export default function HRDashboard() {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
      {/* ── Heading ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display" style={{ fontSize: '1.6rem' }}>HR Administration Overview</h1>
          <p className="body" style={{ color: 'var(--text-3)' }}>
            Real-time status of company-wide onboarding cohorts and compliance.
          </p>
        </div>
        <Button size="md">+ Onboard New Employee</Button>
      </header>

      {/* ── 4 KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <Kpi icon="👥" label="Active Onboardees" value="14" hint="3 starting this week" />
        <Kpi icon="⏱️" label="Avg. Time to 100%" value="38 Days" hint="Target is ≤ 45 days" />
        <Kpi icon="▤" label="Pending Verifications" value="7" hint="Requires HR review" tone="warning" />
        <Kpi icon="🎓" label="Training Compliance" value="94%" hint="+3% from last month" tone="success" />
      </div>

      {/* ── Recent Cohorts Table / Card ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="h2">Current Onboarding Cohort</h2>
            <p className="meta">Employees currently undergoing 30-60-90 day onboarding</p>
          </div>
          <Button variant="ghost" size="sm">Export Report</Button>
        </div>

        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          {[
            { name: 'Alex Johnson', role: 'Software Engineer', dept: 'Engineering', progress: 72, phase: '60 Days', status: 'On Track', tone: 'success' },
            { name: 'Maria Garcia', role: 'Product Designer', dept: 'Design', progress: 45, phase: '30 Days', status: 'Needs Review', tone: 'warning' },
            { name: 'Liam Smith', role: 'Financial Analyst', dept: 'Finance', progress: 88, phase: '90 Days', status: 'On Track', tone: 'success' },
            { name: 'Chloe Dubois', role: 'Talent Partner', dept: 'Human Resources', progress: 15, phase: 'Week 1', status: 'Just Started', tone: 'info' },
          ].map(emp => (
            <div
              key={emp.name}
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
              <Avatar name={emp.name} size={42} />
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</div>
                <div className="meta">{emp.role} · {emp.dept}</div>
              </div>
              <div style={{ width: 140 }}>
                <Progress value={emp.progress} size="sm" showValue={false} label="Progress" />
                <div className="meta" style={{ marginTop: 2, textAlign: 'right' }}>{emp.progress}% ({emp.phase})</div>
              </div>
              <Badge tone={emp.tone}>{emp.status}</Badge>
              <Button variant="soft" size="sm">Inspect</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
