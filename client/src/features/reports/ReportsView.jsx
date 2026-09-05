import { useState } from 'react';
import { Card, Button, Badge, StatCard } from '../../components/common/ui';
import { BarChart3, Download, Users, Clock, ShieldCheck, TrendingUp, CheckCircle } from 'lucide-react';

const DEPARTMENT_STATS = [
  { dept: 'Platform Engineering', count: 8, avgDays: 36, compliance: 96, progress: 74 },
  { dept: 'Cloud & Infrastructure', count: 3, avgDays: 34, compliance: 100, progress: 88 },
  { dept: 'Product & UI/UX Design', count: 2, avgDays: 42, compliance: 90, progress: 55 },
  { dept: 'People Operations (HR)', count: 3, avgDays: 30, compliance: 100, progress: 100 },
  { dept: 'Finance & Payroll', count: 2, avgDays: 28, compliance: 100, progress: 100 },
];

export default function ReportsView() {
  const [downloading, setDownloading] = useState(false);

  const handleExportCSV = () => {
    setDownloading(true);
    const headers = ['Department', 'Active Onboardees', 'Avg Days to 100%', 'Compliance Rate', 'Progress Rate'];
    const rows = DEPARTMENT_STATS.map(d => [d.dept, d.count, `${d.avgDays} Days`, `${d.compliance}%`, `${d.progress}%`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EOMS_Onboarding_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 500);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Executive Reports &amp; Analytics</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            SLA compliance velocity, statutory document turnaround, and Indian hub performance.
          </p>
        </div>
        <Button icon={Download} onClick={handleExportCSV} isLoading={downloading}>
          Export Executive Report (CSV)
        </Button>
      </header>

      {/* ── 4 Executive KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <StatCard
          icon={Users}
          label="Total Active Onboardees"
          value="18"
          hint="Across 5 India Tech Hubs"
          trend="+4 this month"
          tone="primary"
        />
        <StatCard
          icon={Clock}
          label="Avg. Time-to-100%"
          value="38 Days"
          hint="Company SLA target is ≤ 45 Days"
          trend="-7 days faster"
          tone="success"
        />
        <StatCard
          icon={ShieldCheck}
          label="Statutory POSH &amp; PAN Rate"
          value="98.2%"
          hint="Aadhaar, PAN &amp; EPFO verified"
          trend="+2.1% YoY"
          tone="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Day 1 Equipment Readiness"
          value="100%"
          hint="0 delayed hardware handovers"
          trend="Perfect SLA"
          tone="info"
        />
      </div>

      {/* ── Department Breakdown Table ── */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="h2">Cohort Velocity by Department</h2>
          <p className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
            Real-time telemetry showing average days to full contributor ramp-up
          </p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 20px' }}>Department</th>
                <th style={{ padding: '12px 16px' }}>Onboardees</th>
                <th style={{ padding: '12px 16px' }}>Avg. Days to 100%</th>
                <th style={{ padding: '12px 16px' }}>Compliance Rate</th>
                <th style={{ padding: '12px 16px' }}>Overall Progress</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>SLA Status</th>
              </tr>
            </thead>
            <tbody>
              {DEPARTMENT_STATS.map(d => (
                <tr key={d.dept} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {d.dept}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {d.count} Members
                  </td>
                  <td style={{ padding: '14px 16px', color: d.avgDays <= 40 ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {d.avgDays} Days
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                    {d.compliance}%
                  </td>
                  <td style={{ padding: '14px 16px', minWidth: 140 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--bg-sunken)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${d.progress}%`, height: '100%', background: 'var(--primary)' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{d.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <Badge tone="success">Compliant</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
