/**
 * AssetsView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Asset Registry + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, Badge, Modal, Input, Select, Label, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { StackedBarChart, HorizontalBar } from '../../components/common/charts';
import { Laptop, Plus, CheckCircle2, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const INITIAL_ASSETS = [
  { id: 1, employee: 'Aarav Sharma',   type: 'Laptop', asset: 'MacBook Pro 16" M3 Max (36GB)', serial: 'BLR-MBP-2026-108', hub: 'Bengaluru Hub', status: 'Acknowledged', tone: 'success' },
  { id: 2, employee: 'Sneha Kulkarni', type: 'Laptop', asset: 'MacBook Pro 14" M3 Pro (18GB)', serial: 'PUN-MBP-2026-109', hub: 'Pune Hub',      status: 'In Transit',   tone: 'warning' },
  { id: 3, employee: 'Arjun Rao',      type: 'Laptop', asset: 'ThinkPad T14s Gen 5 (32GB)',    serial: 'HYD-TP-2026-214',  hub: 'Hyderabad Hub', status: 'Acknowledged', tone: 'success' },
  { id: 4, employee: 'Kabir Mehta',    type: 'Laptop', asset: 'MacBook Air 15" M3 (16GB)',     serial: 'DEL-MBA-2026-042', hub: 'Gurugram Hub',  status: 'In Transit',   tone: 'warning' },
  { id: 5, employee: 'Ananya Iyer',    type: 'Monitor',asset: 'Dell UltraSharp 27" 4K Monitor',serial: 'BLR-MON-2026-045', hub: 'Bengaluru Hub', status: 'Acknowledged', tone: 'success' },
];

const BY_HUB = [
  { label: 'Bengaluru Bellandur', value: 14, displayValue: '14 units' },
  { label: 'Hyderabad HITEC City',value: 8,  displayValue: '8 units' },
  { label: 'Pune Hinjawadi',      value: 6,  displayValue: '6 units' },
  { label: 'Gurugram CyberHub',   value: 4,  displayValue: '4 units' },
  { label: 'Remote Courier',      value: 3,  displayValue: '3 units' },
];

const DISPATCH_TASKS = [
  { title: 'Courier BlueDart Express — Pune Hub', date: 'In Transit', done: false },
  { title: 'Delhivery Logistics — Gurugram Hub', date: 'Expected Tomorrow', done: false },
  { title: 'Local Handover — Bengaluru Hub', date: 'Signed Off', done: true },
  { title: 'Asset Tagging & QR Generation', date: 'Done', done: true },
];

export default function AssetsView() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [isModalOpen, setModal] = useState(false);
  const [newAsset, setNew] = useState({
    employee: '',
    type: 'Laptop',
    asset: 'MacBook Pro 16" M3 Max (36GB)',
    serial: `BLR-DEV-${Math.floor(100 + Math.random() * 900)}`,
    hub: 'Bengaluru Hub'
  });

  const rowRef = useScrollReveal({ delay: 0.05 });

  const handleAdd = e => {
    e.preventDefault();
    if (!newAsset.employee.trim()) return;
    setAssets([{ id: Date.now(), ...newAsset, status: 'In Transit', tone: 'warning' }, ...assets]);
    setModal(false);
    setNew({
      employee: '',
      type: 'Laptop',
      asset: 'MacBook Pro 16" M3 Max (36GB)',
      serial: `BLR-DEV-${Math.floor(100 + Math.random() * 900)}`,
      hub: 'Bengaluru Hub'
    });
  };

  const acknowledge = id => setAssets(as => as.map(a => a.id === id ? { ...a, status: 'Acknowledged', tone: 'success' } : a));

  const acknowledgedCount = assets.filter(a => a.status === 'Acknowledged').length;
  const ackRate = Math.round((acknowledgedCount / assets.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Hardware & IT Assets"
        subtitle="End-to-end device provisioning, logistics dispatch tracking, and employee acknowledgement."
        action={<Button size="sm" icon={Plus} onClick={() => setModal(true)}>Register Device</Button>}
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Acknowledged Ratio" value={ackRate} delay={0.0} />
        <MetricPillBar label="Logistics SLA"      value={96} delay={0.1} />
        <MetricPillBar label="MDM Zero-Touch"     value={100} delay={0.2} />
        <MetricPillBar label="In Transit"         value={40} delay={0.3} color="amber" />
      </div>

      {/* ── Visual Section: Hubs Bar + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="h3">Hardware Allocation by Regional Hub</h3>
            <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>35 Active Systems</span>
          </div>
          <HorizontalBar items={BY_HUB} colorVar="--chart-green" />
        </Card>
        <DarkTaskCard title="Logistics & Delivery Dispatch" tasks={DISPATCH_TASKS} />
      </div>

      {/* ── Asset Registry Card ── */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="h3">Asset Registry</h3>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>{assets.length} devices deployed</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {assets.map(asset => (
            <div
              key={asset.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--primary-light)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Laptop size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{asset.asset}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                  Assigned to: <strong style={{ color: 'var(--text-secondary)' }}>{asset.employee}</strong> · <span style={{ fontFamily: 'monospace' }}>{asset.serial}</span> · {asset.hub}
                </div>
              </div>
              <Badge tone={asset.tone}>{asset.status}</Badge>
              {asset.status !== 'Acknowledged' && (
                <Button variant="soft" size="xs" icon={CheckCircle2} onClick={() => acknowledge(asset.id)}>
                  Acknowledge Receipt
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Pan-India IT Courier & Logistics SLA Guidelines" icon={Truck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { zone: 'Tier 1 Metro Hubs (BLR, HYD, DEL/NCR, BOM)', sla: '24–48 Hours', partner: 'BlueDart Express Air Cargo', tamper: 'Tamper-evident security seals with Barcode OTP delivery.' },
              { zone: 'Tier 2 Engineering Centers (PUN, MAA, CCU)', sla: '48–72 Hours', partner: 'Delhivery Surface Premium', tamper: 'GPS transit telemetry and SMS signature verification.' },
              { zone: 'Remote Pan-India Work-From-Anywhere', sla: '3–5 Business Days', partner: 'India Post Speed Post / DTDC', tamper: 'Insurance coverage up to ₹2.5L per package.' },
            ].map((z, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{z.zone}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>SLA: {z.sla} ({z.partner})</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{z.tamper}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Hardware Depreciation, Refresh & Offboarding Standards" icon={RefreshCw}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { title: 'Standard Refresh Cycle', spec: '36 Months (Laptops)', desc: 'Eligible for complimentary tech refresh or employee purchase option (ESOP/EPP).' },
              { title: 'Accidental Damage Protection', spec: 'AppleCare+ / Lenovo ADP', desc: '100% covered across all pan-India official service centers with loaner devices provided.' },
              { title: 'Offboarding Remote Wipe', spec: 'Zero-Touch Jamf Erase', desc: 'Cryptographic remote erase triggered instantly upon resignation signoff.' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{p.title}</div>
                <div className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.spec}</div>
                <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>

      {/* ── Register Asset Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModal(false)}
        title="Register & Deploy Hardware"
      >
        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Recipient Employee Name</Label>
            <Input
              required
              placeholder="e.g. Tanvi Reddy"
              value={newAsset.employee}
              onChange={e => setNew({ ...newAsset, employee: e.target.value })}
            />
          </div>
          <div>
            <Label>Hardware Model</Label>
            <Select
              value={newAsset.asset}
              onChange={e => setNew({ ...newAsset, asset: e.target.value })}
              options={[
                { value: 'MacBook Pro 16" M3 Max (36GB)', label: 'MacBook Pro 16" M3 Max (36GB)' },
                { value: 'MacBook Pro 14" M3 Pro (18GB)', label: 'MacBook Pro 14" M3 Pro (18GB)' },
                { value: 'ThinkPad T14s Gen 5 (32GB)', label: 'ThinkPad T14s Gen 5 (32GB)' },
                { value: 'Dell UltraSharp 27" 4K Monitor', label: 'Dell UltraSharp 27" 4K Monitor' },
              ]}
            />
          </div>
          <div>
            <Label>Device Serial Number</Label>
            <Input
              value={newAsset.serial}
              onChange={e => setNew({ ...newAsset, serial: e.target.value })}
            />
          </div>
          <div>
            <Label>Regional Dispatch Hub</Label>
            <Select
              value={newAsset.hub}
              onChange={e => setNew({ ...newAsset, hub: e.target.value })}
              options={[
                { value: 'Bengaluru Hub', label: 'Bengaluru Hub' },
                { value: 'Hyderabad Hub', label: 'Hyderabad Hub' },
                { value: 'Pune Hub', label: 'Pune Hub' },
                { value: 'Gurugram Hub', label: 'Gurugram Hub' },
                { value: 'Remote Courier Dispatch', label: 'Remote Courier Dispatch' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 8 }}>
            <Button variant="outline" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Deploy Asset</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
