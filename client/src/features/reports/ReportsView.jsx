import { useState, useEffect } from 'react';
import { Card, Button, KpiCard, PageHeader } from '../../components/common/ui';
import { TrendChart, StackedBarChart, HeatmapGrid, MiniDonut, HorizontalBar } from '../../components/common/charts';
import { Download, BarChart3, TrendingUp, Users, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { reportApi } from '../../api/reports';

export default function ReportsView() {
  const [summary, setSummary] = useState(null);
  const [deptStats, setDeptStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumRes, deptRes] = await Promise.all([
        reportApi.getSummary(),
        reportApi.getDepartmentStats().catch(() => ({ data: [] })),
      ]);
      setSummary(sumRes.data);
      setDeptStats(deptRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch executive reporting metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const totalEmployees = summary?.employees?.total ?? 0;
  const activeEmployees = summary?.employees?.active ?? 0;
  const onboardingCount = summary?.employees?.onboarding ?? summary?.onboarding?.totalPlans ?? 0;
  const avgProgress = summary?.onboarding?.averageProgressPercent ?? 0;
  const complianceRate = summary?.compliance?.complianceRatePercent ?? 0;
  const assetUtilization = summary?.assets?.utilizationPercent ?? 0;
  const trainingCompletion = summary?.training?.completionPercent ?? 0;

  const slaMetrics = [
    { label: 'Avg Progress', value: avgProgress, color: 'var(--chart-1)' },
    { label: 'Doc Compliance', value: complianceRate, color: 'var(--chart-2)' },
    { label: 'Asset Utilization', value: assetUtilization, color: 'var(--chart-3)' },
    { label: 'Training Complete', value: trainingCompletion, color: 'var(--chart-4)' },
  ];

  const deptChartData = deptStats.map(d => ({
    dept: d.deptName.length > 14 ? d.deptName.slice(0, 14) + '…' : d.deptName,
    count: d.totalHeadcount || 0,
    onboarding: d.onboardingCount || 0,
  }));

  const exportCSV = () => {
    if (!summary) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Employees', totalEmployees],
      ['Active Employees', activeEmployees],
      ['Onboarding Enrolled', onboardingCount],
      ['Average Onboarding Progress (%)', avgProgress],
      ['Document Compliance Rate (%)', complianceRate],
      ['Hardware Asset Utilization (%)', assetUtilization],
      ['Training Completion Rate (%)', trainingCompletion],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `EOMS_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`,
    });
    a.click();
  };

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Cross-functional onboarding metrics, compliance audits, and asset insights from live MySQL database."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadReports} isLoading={loading}>
              Refresh
            </Button>
            <Button variant="secondary" icon={Download} size="sm" onClick={exportCSV}>
              Export CSV
            </Button>
          </div>
        }
      />

      {error && (
        <Card $p="var(--sp-4)" style={{ background:'var(--danger-bg)', borderColor:'var(--danger-border)', color:'var(--danger)', display:'flex', alignItems:'center', gap:10 }}>
          <AlertCircle size={18} />
          <span style={{ fontSize:'0.875rem' }}>{error}</span>
          <Button size="xs" variant="secondary" onClick={loadReports} style={{ marginLeft:'auto' }}>Retry</Button>
        </Card>
      )}

      {/* Real KPI cards derived from backend database */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'var(--sp-4)' }}>
        <KpiCard icon={Users}       label="Total Employees"  value={totalEmployees} hint={`${activeEmployees} active workforce`} />
        <KpiCard icon={TrendingUp}  label="Avg Progress"    value={avgProgress}    suffix="%" hint="Across all plans" />
        <KpiCard icon={ShieldCheck} label="Doc Verification" value={complianceRate} suffix="%" hint="Statutory rate" />
        <KpiCard icon={BarChart3}   label="Asset Utilization" value={assetUtilization} suffix="%" hint="Hardware in circulation" />
      </div>

      {/* SLA / Metric Donut row with live calculations */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'var(--sp-4)' }}>
        {slaMetrics.map(m => (
          <Card key={m.label} $p="var(--sp-4)" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <MiniDonut value={m.value} total={100} label={`${m.value}%`} size={80} color={m.color} />
            <p className="caption" style={{ textAlign:'center', color:'var(--text-muted)' }}>{m.label}</p>
          </Card>
        ))}
      </div>

      {/* Department breakdown + Hub overview */}
      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:14 }}>Headcount by Department</h2>
          {deptChartData.length > 0 ? (
            <StackedBarChart
              data={deptChartData}
              xKey="dept"
              categories={[
                { dataKey: 'count', name: 'Total Employees', color: 'var(--chart-1)' },
                { dataKey: 'onboarding', name: 'In Onboarding', color: 'var(--chart-3)' },
              ]}
              height={220}
            />
          ) : (
            <p className="caption" style={{ color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>
              Loading department breakdown…
            </p>
          )}
        </Card>

        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:6 }}>Statutory Compliance Health</h2>
          <p className="meta" style={{ marginBottom:16 }}>EPFO, PAN, POSH and IT Handover metrics</p>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'var(--sage-50)', borderRadius:'var(--r-md)' }}>
              <span style={{ fontSize:'0.8125rem', color:'var(--text-secondary)' }}>Statutory Documents</span>
              <span style={{ fontWeight:700, color:'var(--sage-800)' }}>{summary?.compliance?.totalDocuments || 0}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'var(--warning-bg)', borderRadius:'var(--r-md)' }}>
              <span style={{ fontSize:'0.8125rem', color:'var(--warning-text)' }}>Pending Verifications</span>
              <span style={{ fontWeight:700, color:'var(--warning-text)' }}>{summary?.compliance?.pendingVerifications || 0}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'var(--sage-50)', borderRadius:'var(--r-md)' }}>
              <span style={{ fontSize:'0.8125rem', color:'var(--text-secondary)' }}>Allocated Laptops</span>
              <span style={{ fontWeight:700, color:'var(--sage-800)' }}>{summary?.assets?.allocatedAssets || 0}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'var(--sage-50)', borderRadius:'var(--r-md)' }}>
              <span style={{ fontSize:'0.8125rem', color:'var(--text-secondary)' }}>Training Records</span>
              <span style={{ fontWeight:700, color:'var(--sage-800)' }}>{summary?.training?.totalRecords || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
