import { useState } from 'react';
import { Card, Button, Badge, PageHeader } from '../../components/common/ui';
import { TrendChart, StackedBarChart, HeatmapGrid, MiniDonut } from '../../components/common/charts';
import { Download } from 'lucide-react';

const VELOCITY_DATA = [
  { date: 'Jul', completions: 12, started: 15 },
  { date: 'Aug', completions: 18, started: 22 },
  { date: 'Sep', completions: 24, started: 28 },
  { date: 'Oct', completions: 20, started: 25 },
  { date: 'Nov', completions: 30, started: 34 },
  { date: 'Dec', completions: 26, started: 29 },
];

const DEPT_DATA = [
  { dept: 'Platform Eng', employees: 8 },
  { dept: 'Product & UX', employees: 3 },
  { dept: 'Cloud & Infra', employees: 4 },
  { dept: 'People Ops',    employees: 2 },
  { dept: 'Finance',       employees: 1 },
];

const SLA_METRICS = [
  { label: 'Overall SLA Compliance', value: 94, color: 'var(--chart-emerald)' },
  { label: 'POSH Completion Rate',   value: 98, color: 'var(--chart-blue)' },
  { label: 'Document Verification',  value: 87, color: 'var(--chart-amber)' },
  { label: 'Asset Provisioning',     value: 91, color: 'var(--chart-violet)' },
];

const exportCSV = (data, name) => {
  const keys = Object.keys(data[0]);
  const csv  = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `${name}_${new Date().toISOString().slice(0,10)}.csv` });
  a.click();
};

export default function ReportsView() {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Cross-functional onboarding metrics and compliance insights."
        action={<Button variant="secondary" size="sm" icon={Download} onClick={() => exportCSV(VELOCITY_DATA, 'EOMS_Report')}>Export</Button>}
      />

      {/* ── SLA Compliance Donuts (Bento Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        {SLA_METRICS.map(m => (
          <Card $hoverable key={m.label} style={{ gridColumn: 'span 3', padding: 'var(--sp-5)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <MiniDonut value={m.value} total={100} label={`${m.value}%`} size={88} color={m.color} />
            <p className="meta" style={{ color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.4, fontWeight: 500 }}>{m.label}</p>
          </Card>
        ))}
      </div>

      {/* ── Onboarding Velocity ── */}
      <Card $hoverable style={{ padding: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-5)' }}>
          <div>
            <h2 className="h3">Onboarding Velocity</h2>
            <p className="meta" style={{ color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>Monthly started vs completed over the last 6 months</p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 3, background: 'var(--chart-blue)', borderRadius: 2 }} />Started</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 12, height: 3, background: 'var(--chart-emerald)', borderRadius: 2 }} />Completed</div>
          </div>
        </div>
        <TrendChart
          data={VELOCITY_DATA}
          xKey="date"
          series={[
            { dataKey: 'started',     name: 'Started',    color: 'var(--chart-blue)' },
            { dataKey: 'completions', name: 'Completed',  color: 'var(--chart-emerald)' },
          ]}
          height={280}
          showLegend={false}
        />
      </Card>

      {/* ── Dept Breakdown + Heatmap (Bento Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        <Card $hoverable style={{ gridColumn: 'span 5', padding: 'var(--sp-5)' }}>
          <h2 className="h3" style={{ marginBottom: 'var(--sp-5)' }}>By Department</h2>
          <StackedBarChart
            data={DEPT_DATA}
            xKey="dept"
            categories={[{ dataKey: 'employees', name: 'Employees', color: 'var(--chart-blue)' }]}
            height={220}
          />
        </Card>
        <Card $hoverable style={{ gridColumn: 'span 7', padding: 'var(--sp-5)' }}>
          <h2 className="h3" style={{ marginBottom: 4 }}>Weekly Activity Density</h2>
          <p className="meta" style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-5)', fontWeight: 500 }}>Task completions across the last 12 weeks</p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}>
            <HeatmapGrid rows={7} cols={12} label="Days × Weeks" />
          </div>
        </Card>
      </div>
    </div>
  );
}
