/**
 * ReportsView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Heatmap + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { TrendChart, StackedBarChart, HeatmapGrid, MiniDonut } from '../../components/common/charts';
import { Download, TrendingUp, BarChart3, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const VELOCITY_DATA = [
  { date: 'Apr', started: 15, completions: 12 },
  { date: 'May', started: 22, completions: 18 },
  { date: 'Jun', started: 28, completions: 24 },
  { date: 'Jul', started: 25, completions: 20 },
  { date: 'Aug', started: 34, completions: 30 },
  { date: 'Sep', started: 29, completions: 26 },
];

const DEPT_DATA = [
  { dept: 'Platform Eng', count: 8 },
  { dept: 'Cloud Infra', count: 4 },
  { dept: 'Product & UX', count: 3 },
  { dept: 'People Ops', count: 2 },
  { dept: 'Finance/Admin', count: 1 },
];

const SLA_METRICS = [
  { label: 'Overall SLA Compliance', value: 94 },
  { label: 'POSH Act 2013 Rate', value: 98 },
  { label: 'Statutory Verification', value: 87 },
  { label: 'IT Zero-Touch Provisioning', value: 91 },
];

const QUARTERLY_TARGETS = [
  { title: 'Q3 Onboarding Velocity: 85% On-Time', date: 'Target: 80%', done: true },
  { title: 'POSH Act 100% Annual Sensitization', date: 'Target: 100%', done: true },
  { title: 'Reduce Day-1 IT Delivery to <24h', date: 'In Progress (91%)', done: false },
  { title: 'Form 11 EPFO ECR Auto-Sync', date: 'Target: Oct 01', done: false },
];

const exportCSV = (data, name) => {
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: `${name}_${new Date().toISOString().slice(0, 10)}.csv`
  });
  a.click();
};

export default function ReportsView() {
  const rowRef = useScrollReveal({ delay: 0.05 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Analytics & Compliance Reports"
        subtitle="Cross-functional onboarding velocity, statutory audit metrics, and SLA performance across India hubs."
        action={
          <Button variant="secondary" size="sm" icon={Download} onClick={() => exportCSV(VELOCITY_DATA, 'EOMS_Analytics_Report')}>
            Export CSV
          </Button>
        }
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Overall SLA Delivery" value={94} delay={0.0} />
        <MetricPillBar label="POSH Compliance"      value={98} delay={0.1} />
        <MetricPillBar label="Doc Audit Accuracy"   value={87} delay={0.2} />
        <MetricPillBar label="Hardware Dispatch"    value={91} delay={0.3} color="amber" />
      </div>

      {/* ── Visual Section: TrendChart + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 className="h3">Cohort Velocity (Last 6 Months)</h3>
              <p className="caption" style={{ color: 'var(--text-muted)' }}>Candidates onboarded vs successfully graduated</p>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 2, background: 'var(--chart-sage)', borderRadius: 2 }} />
                Started
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 2, background: 'var(--chart-green)', borderRadius: 2 }} />
                Completed
              </div>
            </div>
          </div>
          <TrendChart
            data={VELOCITY_DATA}
            xKey="date"
            series={[
              { dataKey: 'started', name: 'Started', color: 'var(--chart-sage)' },
              { dataKey: 'completions', name: 'Completed', color: 'var(--chart-green)' },
            ]}
            height={200}
            showLegend={false}
          />
        </Card>
        <DarkTaskCard title="Quarterly OKR Targets" tasks={QUARTERLY_TARGETS} />
      </div>

      {/* ── Dept Breakdown + Heatmap Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <h3 className="h3" style={{ marginBottom: 14 }}>Cohort by Department</h3>
          <StackedBarChart
            data={DEPT_DATA}
            xKey="dept"
            categories={[{ dataKey: 'count', name: 'Engineers', color: 'var(--chart-green)' }]}
            height={160}
          />
        </Card>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <h3 className="h3" style={{ marginBottom: 4 }}>Activity Density Heatmap</h3>
          <p className="caption" style={{ color: 'var(--text-muted)', marginBottom: 12 }}>Task completions across 12-week cohorts</p>
          <HeatmapGrid rows={7} cols={12} label="Days × Weeks (Pan-India)" />
        </Card>
      </div>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Statutory Audit & Annual Return Documentation" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { doc: 'Annual POSH Return (District Officer)', period: 'Calendar Year 2026', status: 'Compliant', desc: 'Zero pending grievances filed before Internal Complaints Committee (ICC).' },
              { doc: 'EPFO Monthly Electronic Challan (ECR)', period: 'August 2026', status: 'Reconciled', desc: '100% PF contribution remitted to Employee Provident Fund Organisation.' },
              { doc: 'Professional Tax (PT) State Remittance', period: 'Karnataka, Maharashtra, Telangana', status: 'Filed', desc: 'Quarterly state tax withheld and remitted per state schedules.' },
            ].map((a, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{a.doc}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary)' }}>{a.status}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{a.period}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Time-to-Productivity & Ramp-up Benchmarks" icon={TrendingUp}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { role: 'Senior Software Engineer (SDE-II)', avgDays: '14 Days to First PR', target: '10 Days Target' },
              { role: 'Cloud Infrastructure Specialist', avgDays: '18 Days to Terraform PR', target: '14 Days Target' },
              { role: 'Product Designer', avgDays: '9 Days to First Figma Component', target: '7 Days Target' },
            ].map((b, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{b.role}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', marginTop: 2 }}>{b.avgDays}</div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>Benchmark: {b.target}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>
    </div>
  );
}
