import { useState } from 'react';
import { Card, Button, Badge, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { StackedBarChart, HorizontalBar } from '../../components/common/charts';
import { Laptop, Plus, CheckCircle2 } from 'lucide-react';

const INITIAL_ASSETS = [
  { id: 1, employee: 'Aarav Sharma',   type: 'Laptop', asset: 'MacBook Pro 16" M3 Max (36GB)',  serial: 'BLR-MBP-2026-108', hub: 'Bengaluru', status: 'Acknowledged',  tone: 'success' },
  { id: 2, employee: 'Sneha Kulkarni', type: 'Laptop', asset: 'MacBook Pro 14" M3 Pro (18GB)',  serial: 'PUN-MBP-2026-109', hub: 'Pune',       status: 'In Transit',    tone: 'warning' },
  { id: 3, employee: 'Arjun Rao',      type: 'Laptop', asset: 'ThinkPad T14s Gen 5 (32GB)',     serial: 'HYD-TP-2026-214',  hub: 'Hyderabad',  status: 'Acknowledged',  tone: 'success' },
  { id: 4, employee: 'Kabir Mehta',    type: 'Laptop', asset: 'Dell Latitude 5540 (16GB)',      serial: 'GGN-DL-2026-301',  hub: 'Gurugram',   status: 'Pending',       tone: 'info' },
  { id: 5, employee: 'Ananya Iyer',    type: 'Monitor', asset: 'LG UltraFine 5K 27"',          serial: 'BLR-MON-2026-045', hub: 'Bengaluru',  status: 'Acknowledged',  tone: 'success' },
];

const BY_HUB = [
  { label: 'Bengaluru', value: 2, displayValue: '2 assets' },
  { label: 'Hyderabad', value: 1, displayValue: '1 asset' },
  { label: 'Pune',      value: 1, displayValue: '1 asset' },
  { label: 'Gurugram',  value: 1, displayValue: '1 asset' },
];

const BY_CAT = [
  { name: 'Laptops',   count: 4 },
  { name: 'Monitors',  count: 1 },
  { name: 'Keyboards', count: 0 },
  { name: 'Software',  count: 0 },
];

export default function AssetsView() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [isModalOpen, setModal] = useState(false);
  const [newAsset, setNew] = useState({ employee: '', type: 'Laptop', asset: 'MacBook Pro 16" M3 Max (36GB)', serial: '', hub: 'Bengaluru' });

  const handleAdd = e => {
    e.preventDefault();
    if (!newAsset.employee.trim()) return;
    setAssets([{ id: Date.now(), ...newAsset, status: 'Pending', tone: 'info' }, ...assets]);
    setModal(false);
    setNew({ employee: '', type: 'Laptop', asset: 'MacBook Pro 16" M3 Max (36GB)', serial: '', hub: 'Bengaluru' });
  };

  const acknowledge = id => setAssets(as => as.map(a => a.id === id ? { ...a, status: 'Acknowledged', tone: 'success' } : a));

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="Assets" subtitle="Hardware provisioning and acknowledgement tracking."
        action={<Button size="sm" icon={Plus} onClick={() => setModal(true)}>Add Asset</Button>} />

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <Card>
          <h2 className="h3" style={{ marginBottom: 14 }}>By Category</h2>
          <StackedBarChart data={BY_CAT} xKey="name" categories={[{ dataKey: 'count', name: 'Assets', color: 'var(--chart-blue)' }]} height={120} />
        </Card>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <h2 className="h3" style={{ marginBottom: 12 }}>By Tech Hub</h2>
          <HorizontalBar items={BY_HUB} colorVar="--chart-violet" />
        </Card>
      </div>

      {/* ── Asset List ── */}
      <Card>
        <h2 className="h3" style={{ marginBottom: 14 }}>Asset Registry</h2>
        <AnimatedList style={{ display: 'grid', gap: 6 }}>
          {assets.map(asset => (
            <AnimatedItem key={asset.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', transition: 'border-color var(--t-fast)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--bg-subtle)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Laptop size={15} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{asset.asset}</div>
                  <div className="meta" style={{ color: 'var(--text-muted)' }}>{asset.employee} · {asset.serial} · {asset.hub}</div>
                </div>
                <Badge tone={asset.tone}>{asset.status}</Badge>
                {asset.status !== 'Acknowledged' && (
                  <Button variant="soft" size="xs" icon={CheckCircle2} onClick={() => acknowledge(asset.id)}>Acknowledge</Button>
                )}
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setModal(false)} title="Register Asset"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleAdd}>Register</Button></>}>
        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 14 }}>
          <div><Label>Employee Name</Label><Input required placeholder="e.g. Tanvi Reddy" value={newAsset.employee} onChange={e => setNew({ ...newAsset, employee: e.target.value })} /></div>
          <div><Label>Asset Type</Label>
            <Select value={newAsset.type} onChange={e => setNew({ ...newAsset, type: e.target.value })}>
              <option>Laptop</option><option>Monitor</option><option>Keyboard</option><option>Software License</option>
            </Select>
          </div>
          <div><Label>Model</Label>
            <Select value={newAsset.asset} onChange={e => setNew({ ...newAsset, asset: e.target.value })}>
              <option>MacBook Pro 16" M3 Max (36GB)</option>
              <option>ThinkPad T14s Gen 5 (32GB)</option>
              <option>Dell Latitude 5540 (16GB)</option>
              <option>LG UltraFine 5K 27"</option>
            </Select>
          </div>
          <div><Label>Serial / Asset Tag</Label><Input placeholder="e.g. BLR-MBP-2026-110" value={newAsset.serial} onChange={e => setNew({ ...newAsset, serial: e.target.value })} /></div>
          <div><Label>Tech Hub</Label>
            <Select value={newAsset.hub} onChange={e => setNew({ ...newAsset, hub: e.target.value })}>
              <option>Bengaluru</option><option>Hyderabad</option><option>Pune</option><option>Gurugram</option><option>Remote</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
