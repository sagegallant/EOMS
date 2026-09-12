import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader } from '../../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../../components/common/charts';
import { Laptop, Plus, CheckCircle2, ChevronRight } from 'lucide-react';

const INITIAL_QUEUE = [
  { employee: 'Sneha Kulkarni',  asset: 'MacBook Pro 16" M3 Max (36GB)',        serial: 'PUN-MBP-2026-109', hub: 'Pune Hinjawadi Hub',      status: 'In Transit',               tone: 'warning' },
  { employee: 'Arjun Rao',       asset: 'ThinkPad T14s Gen 5 (32GB)',           serial: 'HYD-TP-2026-214',  hub: 'Hyderabad HITEC City',     status: 'Allocated & Acknowledged', tone: 'success' },
  { employee: 'Aarav Sharma',    asset: 'MacBook Pro 16" M3 Max (36GB)',        serial: 'BLR-MBP-2026-108', hub: 'Bengaluru Bellandur Hub',  status: 'Allocated & Acknowledged', tone: 'success' },
  { employee: 'Aditya Sengupta', asset: 'Dell UltraSharp 27" 4K Monitor',      serial: 'BLR-MON-2026-088', hub: 'Remote Dispatch',          status: 'Pending Courier',          tone: 'info' },
];

const HUB_ASSETS = [
  { label: 'Bengaluru',  value: 12, displayValue: '12 assets' },
  { label: 'Hyderabad',  value: 7,  displayValue: '7 assets' },
  { label: 'Pune',       value: 5,  displayValue: '5 assets' },
  { label: 'Gurugram',   value: 4,  displayValue: '4 assets' },
  { label: 'Remote',     value: 2,  displayValue: '2 assets' },
];

export default function ITDashboard() {
  const [queue, setQueue]         = useState(INITIAL_QUEUE);
  const [showAll, setShowAll]     = useState(false);
  const [isModalOpen, setModal]   = useState(false);
  const [newAsset, setNew]        = useState({ employee: '', asset: 'MacBook Pro 16" M3 Max (36GB)', serial: `BLR-ASSET-${Math.floor(100 + Math.random() * 900)}`, hub: 'Bengaluru Bellandur Hub' });
  const navigate = useNavigate();

  const pending   = queue.filter(q => q.tone !== 'success');
  const allocated = queue.filter(q => q.tone === 'success');
  const visible   = showAll ? queue : queue.slice(0, 3);

  const handleRegister = e => {
    e.preventDefault();
    if (!newAsset.employee.trim()) return;
    setQueue([{ ...newAsset, status: 'Ready for Pickup', tone: 'info' }, ...queue]);
    setModal(false);
    setNew({ employee: '', asset: 'MacBook Pro 16" M3 Max (36GB)', serial: `BLR-ASSET-${Math.floor(100 + Math.random() * 900)}`, hub: 'Bengaluru Bellandur Hub' });
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="IT Provisioning"
        subtitle="Asset allocation queue and hardware inventory status."
        action={<Button size="sm" icon={Plus} onClick={() => setModal(true)}>Register Asset</Button>}
      />

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-5)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 }}>Provisioning Queue</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <MiniDonut value={allocated.length} total={queue.length} label={`${allocated.length}`} sublabel="allocated" size={80} color="var(--chart-emerald)" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Allocated</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{allocated.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                <span style={{ fontWeight: 500, color: 'var(--warning-text)' }}>{pending.length}</span>
              </div>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 'var(--sp-5)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Assets by Hub</p>
          <HorizontalBar items={HUB_ASSETS} colorVar="--chart-blue" />
        </Card>
      </div>

      {/* ── Provisioning Queue ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="h3">Queue</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/assets')}>All assets <ChevronRight size={13} /></Button>
        </div>
        <AnimatedList style={{ display: 'grid', gap: 8 }}>
          {visible.map((item, i) => (
            <AnimatedItem key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--bg-subtle)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Laptop size={15} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.employee}</div>
                  <div className="meta" style={{ color: 'var(--text-muted)' }}>{item.asset} · {item.serial}</div>
                </div>
                <Badge tone={item.tone}>{item.status}</Badge>
                {item.tone !== 'success' && (
                  <Button variant="soft" size="xs" onClick={() => {
                    setQueue(q => q.map((it, idx) => idx === queue.indexOf(item) ? { ...it, status: 'Allocated & Acknowledged', tone: 'success' } : it));
                  }}>
                    <CheckCircle2 size={13} /> Allocate
                  </Button>
                )}
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
        {queue.length > 3 && (
          <button onClick={() => setShowAll(v => !v)}
            style={{ marginTop: 10, width: '100%', padding: '7px', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer' }}>
            {showAll ? '↑ Collapse' : `+ ${queue.length - 3} more items`}
          </button>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setModal(false)} title="Register Asset" description="Add a hardware asset to the provisioning queue."
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleRegister}>Register</Button></>}>
        <form onSubmit={handleRegister} style={{ display: 'grid', gap: 14 }}>
          <div><Label>Employee Name</Label><Input required placeholder="e.g. Tanvi Reddy" value={newAsset.employee} onChange={e => setNew({ ...newAsset, employee: e.target.value })} /></div>
          <div><Label>Asset Type</Label>
            <Select value={newAsset.asset} onChange={e => setNew({ ...newAsset, asset: e.target.value })}>
              <option>MacBook Pro 16" M3 Max (36GB)</option>
              <option>ThinkPad T14s Gen 5 (32GB)</option>
              <option>Dell UltraSharp 27" 4K Monitor</option>
              <option>Dell Latitude 5540 (16GB)</option>
            </Select>
          </div>
          <div><Label>Serial / Asset Tag</Label><Input placeholder="e.g. BLR-MBP-2026-110" value={newAsset.serial} onChange={e => setNew({ ...newAsset, serial: e.target.value })} /></div>
          <div><Label>Tech Hub</Label>
            <Select value={newAsset.hub} onChange={e => setNew({ ...newAsset, hub: e.target.value })}>
              <option>Bengaluru Bellandur Hub</option><option>Hyderabad HITEC City</option>
              <option>Pune Hinjawadi Hub</option><option>Gurugram Cyber City</option><option>Remote Dispatch</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
