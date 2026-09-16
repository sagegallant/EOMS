/**
 * ITDashboard.jsx — v2.1
 * Direct inspiration from HR_Dashboard.webp (Crextio design)
 * Consistent layout: WelcomeHero + MetricPills + 3-col grid + Collapsibles
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, CheckCircle2, AlertTriangle, Plus, ShieldCheck, Box, Server, MapPin } from 'lucide-react';
import {
  WelcomeHero, MetricPillBar, KPIStat, AvatarHeroCard,
  DarkTaskCard, CollapsibleRow, Card, Button, Badge, Modal, Input, Select, Label
} from '../../../components/common/ui';
import { MiniDonut, HorizontalBar, RadialProgress } from '../../../components/common/charts';
import { useScrollReveal } from '../../../utils/animations';

const INITIAL_QUEUE = [
  { employee: 'Sneha Kulkarni',  asset: 'MacBook Pro 16" M3 Max (36GB)', serial: 'PUN-MBP-2026-109', hub: 'Pune Hinjawadi Hub',      status: 'In Transit',               tone: 'warning' },
  { employee: 'Arjun Rao',       asset: 'ThinkPad T14s Gen 5 (32GB)',    serial: 'HYD-TP-2026-214',  hub: 'Hyderabad HITEC City',     status: 'Allocated & Acknowledged', tone: 'success' },
  { employee: 'Aarav Sharma',    asset: 'MacBook Pro 16" M3 Max (36GB)', serial: 'BLR-MBP-2026-108', hub: 'Bengaluru Bellandur Hub',  status: 'Allocated & Acknowledged', tone: 'success' },
  { employee: 'Aditya Sengupta', asset: 'Dell UltraSharp 27" 4K Monitor',serial: 'BLR-MON-2026-088', hub: 'Bengaluru Bellandur Hub', status: 'Pending Courier',          tone: 'info' },
  { employee: 'Kabir Mehta',     asset: 'MacBook Air 15" M3 (16GB)',     serial: 'DEL-MBA-2026-042', hub: 'Gurugram CyberHub',        status: 'Provisioning',             tone: 'info' },
];

const HUB_ASSETS = [
  { label: 'Bengaluru Bellandur', value: 14, displayValue: '14 units' },
  { label: 'Hyderabad HITEC City',value: 8,  displayValue: '8 units' },
  { label: 'Pune Hinjawadi',      value: 6,  displayValue: '6 units' },
  { label: 'Gurugram CyberHub',   value: 4,  displayValue: '4 units' },
  { label: 'Remote Dispatch',     value: 3,  displayValue: '3 units' },
];

const IT_TASKS = [
  { title: 'Flash macOS Sequoia Image — Sneha', date: 'Completed', done: true },
  { title: 'Courier MacBook Pro 16" — Aditya', date: 'Due today', done: false },
  { title: 'Provision YubiKey 5C NFC — Kabir', date: 'Due tomorrow', done: false },
  { title: 'Configure Okta + AWS SSO — Ananya', date: 'Sep 18', done: false },
  { title: 'Collect Return Device — Rohan V.', date: 'Sep 21', done: false },
];

export default function ITDashboard() {
  const navigate = useNavigate();
  const rowRef   = useScrollReveal({ delay: 0.05 });
  const gridRef  = useScrollReveal({ delay: 0.1 });

  const [queue, setQueue]         = useState(INITIAL_QUEUE);
  const [isModalOpen, setModal]   = useState(false);
  const [newAsset, setNew]        = useState({
    employee: '',
    asset: 'MacBook Pro 16" M3 Max (36GB)',
    serial: `BLR-ASSET-${Math.floor(100 + Math.random() * 900)}`,
    hub: 'Bengaluru Bellandur Hub'
  });

  const allocated = queue.filter(q => q.tone === 'success');
  const pending   = queue.filter(q => q.tone !== 'success');
  const allocationRate = Math.round((allocated.length / queue.length) * 100);

  const handleRegister = e => {
    e.preventDefault();
    if (!newAsset.employee.trim()) return;
    setQueue([{ ...newAsset, status: 'Ready for Dispatch', tone: 'info' }, ...queue]);
    setModal(false);
    setNew({
      employee: '',
      asset: 'MacBook Pro 16" M3 Max (36GB)',
      serial: `BLR-ASSET-${Math.floor(100 + Math.random() * 900)}`,
      hub: 'Bengaluru Bellandur Hub'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

      {/* ── 1. Welcome Hero ── */}
      <WelcomeHero name="Karthik Subramanian" role="IT Infrastructure & SecOps" />

      {/* ── 2. Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Hardware Allocated" value={allocationRate} delay={0.0} />
        <MetricPillBar label="SLA Compliance"     value={94} delay={0.1} />
        <MetricPillBar label="MDM Enrolled"       value={100} delay={0.2} />
        <MetricPillBar label="Pending Dispatch"   value={35} delay={0.3} color="amber" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', marginLeft: 'auto', flexShrink: 0, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 'var(--sp-5)' }}>
          <KPIStat icon={Laptop}        value={queue.length}     label="Queue Total" />
          <KPIStat icon={CheckCircle2}  value={allocated.length} label="Delivered" />
          <KPIStat icon={AlertTriangle} value={pending.length}   label="Pending" />
        </div>
      </div>

      {/* ── 3. Main 3-Column Grid ── */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.8fr 1.5fr', gap: 'var(--sp-4)', alignItems: 'start' }}>

        {/* LEFT: Avatar Hero + Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <AvatarHeroCard
            name="Karthik Subramanian"
            role="Lead IT Infrastructure Architect"
            sub="🇮🇳 Pan-India Hardware Dispatch & MDM"
            style={{ minHeight: 220 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 8 }}>Allocated Ratio</p>
              <MiniDonut
                value={allocated.length}
                total={queue.length}
                label={`${allocationRate}%`}
                sublabel="allocated"
                size={80}
                color="var(--chart-green)"
              />
            </Card>
            <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p className="meta" style={{ color: 'var(--text-faint)' }}>SLA Delivery</p>
              <RadialProgress value={94} size={84} strokeWidth={8} color="var(--chart-green)" label="94%" sublabel="48h SLA" />
            </Card>
          </div>
        </div>

        {/* MIDDLE: Regional Hub Breakdown & Quick Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Card style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="h3">Inventory by Hub</h3>
              <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>35 Units Total</span>
            </div>
            <HorizontalBar items={HUB_ASSETS} colorVar="--chart-green" />
          </Card>

          <Card style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="h3">Immediate Action Queue</h3>
              <Button size="xs" icon={Plus} onClick={() => setModal(true)}>Register</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {queue.slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                  <Laptop size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.75rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.employee}</div>
                    <div className="caption" style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.asset}</div>
                  </div>
                  <Badge tone={item.tone}>{item.status.split(' ')[0]}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT: Dark Task Card */}
        <DarkTaskCard title="IT Dispatch Queue" tasks={IT_TASKS} />

      </div>

      {/* ── 4. Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Full Hardware Provisioning Queue" icon={Box}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {queue.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', flexWrap: 'wrap' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--primary-light)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Laptop size={15} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.employee}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>{item.asset} · <span style={{ fontFamily: 'monospace' }}>{item.serial}</span></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="caption" style={{ color: 'var(--text-secondary)' }}>{item.hub}</span>
                </div>
                <Badge tone={item.tone}>{item.status}</Badge>
                {item.tone !== 'success' && (
                  <Button variant="soft" size="xs" onClick={() => {
                    setQueue(q => q.map((it, idx) => idx === i ? { ...it, status: 'Allocated & Acknowledged', tone: 'success' } : it));
                  }}>
                    <CheckCircle2 size={13} /> Allocate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Security & Device Compliance Standards" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { title: 'Disk Encryption (FileVault / BitLocker)', status: '100% Enforced', desc: 'Hardware-level AES 256-bit XTS encryption active on all provisioned devices.' },
              { title: 'Jamf Pro / Intune MDM Profile',        status: 'Active', desc: 'Auto-enrollment Zero-Touch configuration verified during initial boot.' },
              { title: 'YubiKey 5C NFC Multi-Factor Token',   status: 'Dispatched', desc: 'FIDO2 WebAuthn authentication tokens bound to company IdP.' },
              { title: 'CrowdStrike Falcon Endpoint Security', status: 'Healthy', desc: 'Real-time telemetry and threat prevention agent installed.' },
            ].map((sec, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{sec.title}</span>
                  <Badge tone="success">{sec.status}</Badge>
                </div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{sec.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>

      {/* ── Register Asset Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => setModal(false)} title="Register & Dispatch Hardware">
        <form onSubmit={handleRegister} style={{ display: 'grid', gap: 'var(--sp-4)' }}>
          <div>
            <Label>Recipient Employee Name</Label>
            <Input
              required
              placeholder="e.g. Priya Iyer"
              value={newAsset.employee}
              onChange={e => setNew({ ...newAsset, employee: e.target.value })}
            />
          </div>
          <div>
            <Label>Asset Model</Label>
            <Select
              value={newAsset.asset}
              onChange={e => setNew({ ...newAsset, asset: e.target.value })}
              options={[
                { value: 'MacBook Pro 16" M3 Max (36GB)', label: 'MacBook Pro 16" M3 Max (36GB)' },
                { value: 'ThinkPad T14s Gen 5 (32GB)', label: 'ThinkPad T14s Gen 5 (32GB)' },
                { value: 'MacBook Air 15" M3 (16GB)', label: 'MacBook Air 15" M3 (16GB)' },
                { value: 'Dell UltraSharp 27" 4K Monitor', label: 'Dell UltraSharp 27" 4K Monitor' },
              ]}
            />
          </div>
          <div>
            <Label>Asset Serial Number</Label>
            <Input
              value={newAsset.serial}
              onChange={e => setNew({ ...newAsset, serial: e.target.value })}
            />
          </div>
          <div>
            <Label>Dispatch Hub</Label>
            <Select
              value={newAsset.hub}
              onChange={e => setNew({ ...newAsset, hub: e.target.value })}
              options={[
                { value: 'Bengaluru Bellandur Hub', label: 'Bengaluru Bellandur Hub' },
                { value: 'Hyderabad HITEC City Hub', label: 'Hyderabad HITEC City Hub' },
                { value: 'Pune Hinjawadi Hub', label: 'Pune Hinjawadi Hub' },
                { value: 'Gurugram CyberHub', label: 'Gurugram CyberHub' },
                { value: 'Remote Courier Dispatch', label: 'Remote Courier Dispatch' },
              ]}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 8 }}>
            <Button variant="outline" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Confirm Dispatch</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
