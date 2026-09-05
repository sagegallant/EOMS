import { useState } from 'react';
import { Card, Button, Badge, Modal, Input, Select, Label } from '../../components/common/ui';
import { Laptop, Plus, CheckCircle2, Clock, ShieldCheck, Box, HardDrive, KeyRound } from 'lucide-react';

const INITIAL_ASSETS = [
  {
    id: 1,
    tag: 'BLR-MBP-2026-108',
    serial: 'C02XYZ108M3',
    model: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
    category: 'Hardware Workstation',
    allocatedTo: 'Aarav Sharma',
    hub: 'Bengaluru (Bellandur Hub)',
    status: 'acknowledged',
    allocatedAt: 'Jan 12, 2026',
    notes: 'Collected on Day 1 at Bengaluru Tech Hub. Hardware verified.',
  },
  {
    id: 2,
    tag: 'BLR-MON-2026-088',
    serial: 'CN088DEL4K',
    model: 'Dell UltraSharp 27" 4K USB-C Monitor',
    category: 'Display & Peripherals',
    allocatedTo: 'Aarav Sharma',
    hub: 'Bengaluru (Home Setup)',
    status: 'acknowledged',
    allocatedAt: 'Jan 13, 2026',
    notes: 'Delivered via courier for hybrid workstation.',
  },
  {
    id: 3,
    tag: 'BLR-SEC-2026-014',
    serial: 'YK5C-99014',
    model: 'YubiKey 5C NFC Security Key',
    category: 'Security Token',
    allocatedTo: 'Aarav Sharma',
    hub: 'Bengaluru Hub',
    status: 'acknowledged',
    allocatedAt: 'Jan 12, 2026',
    notes: 'Configured for AWS & GitHub 2FA authentication.',
  },
  {
    id: 4,
    tag: 'HYD-TP-2026-214',
    serial: 'PF2K991A4',
    model: 'Lenovo ThinkPad T14s Gen 5 (32GB / 1TB)',
    category: 'Hardware Workstation',
    allocatedTo: 'Arjun Rao',
    hub: 'Hyderabad (HITEC City)',
    status: 'acknowledged',
    allocatedAt: 'Feb 02, 2026',
    notes: 'Issued at Hyderabad office.',
  },
  {
    id: 5,
    tag: 'PUN-MBP-2026-109',
    serial: 'C02XYZ109M3',
    model: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
    category: 'Hardware Workstation',
    allocatedTo: 'Sneha Kulkarni',
    hub: 'Pune (Hinjawadi)',
    status: 'pending',
    allocatedAt: 'Jan 20, 2026',
    notes: 'In courier transit to Pune. Awaiting employee acknowledgement.',
  },
  {
    id: 6,
    tag: 'BLR-MBP-2026-110',
    serial: 'C02XYZ110M3',
    model: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
    category: 'Hardware Workstation',
    allocatedTo: 'Unassigned',
    hub: 'Bengaluru Inventory',
    status: 'in_stock',
    allocatedAt: '—',
    notes: 'In IT reserve inventory.',
  },
];

export default function AssetsView() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [filterCat, setFilterCat] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    model: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
    category: 'Hardware Workstation',
    allocatedTo: '',
    hub: 'Bengaluru (Bellandur Hub)',
    tag: `BLR-ASSET-${Date.now().toString().slice(-4)}`,
    serial: `SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  });

  const handleAcknowledge = id => {
    setAssets(
      assets.map(a =>
        a.id === id ? { ...a, status: 'acknowledged', notes: 'Acknowledged by employee via portal.' } : a
      )
    );
  };

  const handleAllocateSubmit = e => {
    e.preventDefault();
    const item = {
      id: Date.now(),
      tag: newAsset.tag,
      serial: newAsset.serial,
      model: newAsset.model,
      category: newAsset.category,
      allocatedTo: newAsset.allocatedTo || 'Unassigned',
      hub: newAsset.hub,
      status: newAsset.allocatedTo ? 'pending' : 'in_stock',
      allocatedAt: newAsset.allocatedTo ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      notes: newAsset.allocatedTo ? 'Newly allocated equipment awaiting employee handover.' : 'Available in stock.',
    };

    setAssets([item, ...assets]);
    setIsModalOpen(false);
  };

  const filtered = assets.filter(a => (filterCat === 'ALL' ? true : a.category === filterCat));

  const getStatusBadge = status => {
    if (status === 'acknowledged') return <Badge tone="success" icon={CheckCircle2}>Acknowledged</Badge>;
    if (status === 'pending') return <Badge tone="warning" icon={Clock}>Pending Handover</Badge>;
    return <Badge tone="neutral">In Stock</Badge>;
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Asset &amp; Hardware Provisioning</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            IT equipment allocation, serial tracking, and handover acknowledgments across India Hubs.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          + Allocate New Asset
        </Button>
      </header>

      {/* ── Stats Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Tracked Assets</div>
          <div className="h1" style={{ marginTop: 4 }}>{assets.length}</div>
        </Card>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--success)', fontWeight: 600 }}>Handover Acknowledged</div>
          <div className="h1" style={{ marginTop: 4, color: 'var(--success)' }}>
            {assets.filter(a => a.status === 'acknowledged').length}
          </div>
        </Card>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--warning)', fontWeight: 600 }}>Pending Handover</div>
          <div className="h1" style={{ marginTop: 4, color: 'var(--warning)' }}>
            {assets.filter(a => a.status === 'pending').length}
          </div>
        </Card>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>Available in Stock</div>
          <div className="h1" style={{ marginTop: 4, color: 'var(--primary)' }}>
            {assets.filter(a => a.status === 'in_stock').length}
          </div>
        </Card>
      </div>

      {/* ── Table Card ── */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2 className="h2">Asset Inventory &amp; Allocations</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="caption" style={{ color: 'var(--text-muted)' }}>Category:</span>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Hardware Workstation">Hardware Workstations</option>
              <option value="Display & Peripherals">Displays &amp; Peripherals</option>
              <option value="Security Token">Security Tokens</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 20px' }}>Asset Tag</th>
                <th style={{ padding: '12px 16px' }}>Model &amp; Specs</th>
                <th style={{ padding: '12px 16px' }}>Allocated To</th>
                <th style={{ padding: '12px 16px' }}>Hub / Location</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Laptop size={15} /> {a.tag}
                    </div>
                    <div className="meta">SN: {a.serial}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.model}</div>
                    <div className="meta">{a.category}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                    {a.allocatedTo}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                    {a.hub}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(a.status)}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    {a.status === 'pending' ? (
                      <Button size="xs" variant="primary" onClick={() => handleAcknowledge(a.id)}>
                        Acknowledge Handover
                      </Button>
                    ) : (
                      <span className="caption" style={{ color: 'var(--text-muted)' }}>Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Allocate Asset Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Allocate New Corporate Equipment"
        description="Assign a hardware workstation or peripheral to a team member."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAllocateSubmit}>Confirm Allocation</Button>
          </>
        }
      >
        <form onSubmit={handleAllocateSubmit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Hardware Model</Label>
            <Select
              value={newAsset.model}
              onChange={e => setNewAsset({ ...newAsset, model: e.target.value })}
            >
              <option value="Apple MacBook Pro 16&quot; M3 Max (36GB / 1TB)">Apple MacBook Pro 16" M3 Max (36GB / 1TB)</option>
              <option value="Lenovo ThinkPad T14s Gen 5 (32GB / 1TB)">Lenovo ThinkPad T14s Gen 5 (32GB / 1TB)</option>
              <option value="Dell UltraSharp 27&quot; 4K USB-C Monitor">Dell UltraSharp 27" 4K USB-C Monitor</option>
              <option value="YubiKey 5C NFC Security Key">YubiKey 5C NFC Security Key</option>
            </Select>
          </div>
          <div>
            <Label>Recipient Employee</Label>
            <Input
              required
              placeholder="e.g. Aditya Sengupta"
              value={newAsset.allocatedTo}
              onChange={e => setNewAsset({ ...newAsset, allocatedTo: e.target.value })}
            />
          </div>
          <div>
            <Label>Dispatch Tech Hub</Label>
            <Select
              value={newAsset.hub}
              onChange={e => setNewAsset({ ...newAsset, hub: e.target.value })}
            >
              <option value="Bengaluru (Bellandur Hub)">Bengaluru - Bellandur Tech Hub</option>
              <option value="Hyderabad (HITEC City)">Hyderabad - HITEC City</option>
              <option value="Pune (Hinjawadi)">Pune - Hinjawadi</option>
              <option value="Gurugram (Cyber City)">Gurugram - Cyber City</option>
              <option value="Remote Dispatch (Courier)">Remote Dispatch (Blue Dart Courier)</option>
            </Select>
          </div>
          <div>
            <Label>Asset Tag ID</Label>
            <Input
              value={newAsset.tag}
              onChange={e => setNewAsset({ ...newAsset, tag: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
