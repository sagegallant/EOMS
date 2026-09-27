import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  KpiCard,
  DarkPanel,
  DarkTaskItem,
  Badge,
  Button,
  AnimatedList,
  AnimatedItem,
} from '../../../components/common/ui';
import { VerticalBarChart, HorizontalBar } from '../../../components/common/charts';
import { Laptop, Plus, CheckCircle2, ChevronRight, Users, Clock } from 'lucide-react';
import { assetApi } from '../../../api/assets';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ITDashboard() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [assetsRes, allocsRes] = await Promise.all([
        assetApi.list(),
        assetApi.listAllocations(),
      ]);
      setAssets(assetsRes.data || []);
      setAllocations(allocsRes.data || []);
    } catch (err) {
      console.error('Failed to load IT dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamic calculations
  const totalAssets = assets.length;
  const inStock = assets.filter((a) => a.status === 'in_stock').length;
  const allocated = assets.filter((a) => a.status === 'allocated').length;
  const pendingAcks = allocations.filter((al) => al.acknowledgementStatus === 'pending');

  // Hub breakdown
  const hubMap = {};
  allocations.forEach((al) => {
    const loc = al.Employee?.workLocation || 'Bengaluru';
    const hub = loc.split(' ')[0];
    hubMap[hub] = (hubMap[hub] || 0) + 1;
  });
  const hubAssets = Object.entries(hubMap).map(([label, value]) => ({
    label,
    value,
    displayValue: `${value} assets`,
  }));

  // Weekly allocation distribution
  const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  allocations.forEach((al) => {
    const d = new Date(al.allocatedAt);
    const dayName = WEEKDAYS[d.getDay()];
    if (dayCounts[dayName] !== undefined) {
      dayCounts[dayName] += 1;
    }
  });
  const weeklyData = [
    { day: 'Mon', value: dayCounts.Mon },
    { day: 'Tue', value: dayCounts.Tue },
    { day: 'Wed', value: dayCounts.Wed },
    { day: 'Thu', value: dayCounts.Thu },
    { day: 'Fri', value: dayCounts.Fri },
    { day: 'Sat', value: dayCounts.Sat },
    { day: 'Sun', value: dayCounts.Sun },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            IT Provisioning 💻
          </h1>
          <p className="caption" style={{ marginTop: 4 }}>
            Hardware queue and asset lifecycle management
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/assets')}>
          Manage Assets
        </Button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 'var(--sp-4)' }}>
        <KpiCard icon={Laptop} label="Total Assets" value={totalAssets} hint="Registered inventory" />
        <KpiCard icon={CheckCircle2} label="Allocated" value={allocated} hint="Active deployment" />
        <KpiCard icon={Clock} label="In Stock" value={inStock} hint="Ready to provision" />
        <KpiCard icon={Users} label="Pending Acks" value={pendingAcks.length} hint="Awaiting handover" />
      </div>

      {/* Charts + Actions panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
        <Card $p="var(--sp-5)">
          <div style={{ marginBottom: 4 }}>
            <h2 className="section-title">Weekly Provisioned</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span className="kpi-md">{allocated}</span>
              <span className="caption">total deployed</span>
            </div>
          </div>
          <VerticalBarChart data={weeklyData} xKey="day" dataKey="value" height={150} activeIndex={3} />
        </Card>

        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom: 14 }}>Assets by Tech Hub</h2>
          {hubAssets.length > 0 ? (
            <HorizontalBar items={hubAssets} colorVar="--chart-1" />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No hub allocations recorded.</div>
          )}
        </Card>

        <DarkPanel
          title="Pending Actions"
          counter={`${pendingAcks.length} pending`}
          subtitle="Awaiting employee receipt"
        >
          {pendingAcks.length === 0 ? (
            <div style={{ color: 'var(--text-on-dark)', opacity: 0.7, fontSize: '0.8125rem', padding: '12px 0' }}>
              All allocated assets are acknowledged!
            </div>
          ) : (
            pendingAcks.slice(0, 4).map((al) => (
              <DarkTaskItem
                key={al.allocationId}
                title={`${al.Employee?.firstName} ${al.Employee?.lastName}`}
                subtitle={`${al.Asset?.AssetModel?.modelName || 'Asset'} (${al.Asset?.assetTag})`}
                done={false}
                onClick={() => navigate('/assets')}
              />
            ))
          )}
        </DarkPanel>
      </div>

      {/* Queue */}
      <Card $p="var(--sp-5)">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="section-title">Recent Provisioning Queue</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>
            All assets <ChevronRight size={13} />
          </Button>
        </div>
        <AnimatedList style={{ display: 'grid', gap: 8 }}>
          {allocations.slice(0, 5).map((item) => {
            const empName = item.Employee
              ? `${item.Employee.firstName} ${item.Employee.lastName}`
              : `Emp #${item.employeeId}`;
            const modelName = item.Asset?.AssetModel?.modelName || 'Hardware Asset';

            return (
              <AnimatedItem key={item.allocationId}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--r-md)',
                      background: 'var(--sage-100)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Laptop size={15} style={{ color: 'var(--sage-700)' }} />
                  </div>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {empName}
                    </div>
                    <div className="meta">
                      {modelName} · Tag: {item.Asset?.assetTag} · {item.Employee?.workLocation || 'Bengaluru'}
                    </div>
                  </div>
                  <Badge tone={item.acknowledgementStatus === 'acknowledged' ? 'sage' : 'warning'}>
                    {item.acknowledgementStatus.toUpperCase()}
                  </Badge>
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      </Card>
    </div>
  );
}
