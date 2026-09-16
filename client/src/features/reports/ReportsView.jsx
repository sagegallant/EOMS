import { Card, Button, KpiCard, PageHeader } from '../../components/common/ui';
import { TrendChart, StackedBarChart, HeatmapGrid, MiniDonut, HorizontalBar } from '../../components/common/charts';
import { Download, BarChart3, TrendingUp, Users, ShieldCheck } from 'lucide-react';

const VELOCITY = [
  { month:'Apr', started:10, completed:8 }, { month:'May', started:14, completed:11 },
  { month:'Jun', started:18, completed:15 }, { month:'Jul', started:16, completed:14 },
  { month:'Aug', started:22, completed:19 }, { month:'Sep', started:18, completed:16 },
];

const DEPT_DATA = [
  { dept:'Platform Eng', count:8 }, { dept:'Product & UX', count:3 },
  { dept:'Cloud & Infra', count:4 }, { dept:'People Ops', count:2 }, { dept:'Finance', count:1 },
];

const SLA_METRICS = [
  { label:'Overall SLA',        value:94, color:'var(--chart-1)' },
  { label:'POSH Completion',    value:98, color:'var(--chart-2)' },
  { label:'Document Verify',    value:87, color:'var(--chart-3)' },
  { label:'Asset Provisioning', value:91, color:'var(--chart-4)' },
];

const HUB_COMPLIANCE = [
  { label:'Bengaluru', value:96, displayValue:'96%' },
  { label:'Hyderabad', value:94, displayValue:'94%' },
  { label:'Pune',      value:90, displayValue:'90%' },
  { label:'Gurugram',  value:88, displayValue:'88%' },
  { label:'Remote',    value:82, displayValue:'82%' },
];

const exportCSV = (data, name) => {
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(r => keys.map(k=>r[k]).join(','))].join('\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type:'text/csv' })), download:`EOMS_${name}_${new Date().toISOString().slice(0,10)}.csv` });
  a.click();
};

export default function ReportsView() {
  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Reports & Analytics" subtitle="Cross-functional onboarding metrics and compliance insights for EOMS India."
        action={<Button variant="secondary" icon={Download} size="sm" onClick={() => exportCSV(VELOCITY,'Velocity')}>Export CSV</Button>} />

      {/* KPI cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'var(--sp-4)' }}>
        <KpiCard icon={Users}       label="Total Onboarded" value={18}  hint="Active plans" />
        <KpiCard icon={TrendingUp}  label="Avg Completion"  value={38}  unit="days" />
        <KpiCard icon={ShieldCheck} label="SLA Rate"        value={94}  suffix="%" />
        <KpiCard icon={BarChart3}   label="POSH Compliance" value={98}  suffix="%" />
      </div>

      {/* SLA donut row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'var(--sp-4)' }}>
        {SLA_METRICS.map(m => (
          <Card key={m.label} $p="var(--sp-4)" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <MiniDonut value={m.value} total={100} label={`${m.value}%`} size={80} color={m.color} />
            <p className="caption" style={{ textAlign:'center', color:'var(--text-muted)' }}>{m.label}</p>
          </Card>
        ))}
      </div>

      {/* Velocity chart */}
      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <h2 className="section-title">Onboarding Velocity</h2>
            <p className="meta" style={{ marginTop:2 }}>Started vs completed over 6 months</p>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            {[['Started','var(--sage-300)'],['Completed','var(--sage-700)']].map(([l,c])=>(
              <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                <div style={{ width:10, height:2, background:c, borderRadius:2 }} />{l}
              </div>
            ))}
          </div>
        </div>
        <TrendChart data={VELOCITY} xKey="month"
          series={[
            { dataKey:'started', name:'Started', color:'var(--sage-300)' },
            { dataKey:'completed', name:'Completed', color:'var(--sage-700)' },
          ]} height={220} showLegend={false} />
      </Card>

      {/* Dept breakdown + hub compliance + heatmap */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:14 }}>By Department</h2>
          <StackedBarChart data={DEPT_DATA} xKey="dept" categories={[{ dataKey:'count', name:'Employees', color:'var(--chart-1)' }]} height={200} />
        </Card>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:14 }}>SLA Compliance by Hub</h2>
          <HorizontalBar items={HUB_COMPLIANCE} maxValue={100} colorVar="--chart-1" />
        </Card>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:6 }}>Activity Density</h2>
          <p className="meta" style={{ marginBottom:14 }}>Task completions — last 12 weeks</p>
          <HeatmapGrid rows={7} cols={12} />
        </Card>
      </div>
    </div>
  );
}
