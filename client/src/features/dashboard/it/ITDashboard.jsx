import { useState } from 'react';
import { Card, Button, Badge, StatCard, Modal, Input, Select, Label } from '../../../components/common/ui';
import { Laptop, Plus, CheckCircle2, Clock, KeyRound, ShieldCheck, Box, HardDrive } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_QUEUE = [
  { employee: 'Sneha Kulkarni', asset: 'MacBook Pro 16" M3 Max (36GB)', serial: 'PUN-MBP-2026-109', hub: 'Pune Hinjawadi Hub', status: 'In Transit', tone: 'warning' },
  { employee: 'Arjun Rao', asset: 'ThinkPad T14s Gen 5 (32GB)', serial: 'HYD-TP-2026-214', hub: 'Hyderabad HITEC City', status: 'Allocated & Acknowledged', tone: 'success' },
  { employee: 'Aarav Sharma', asset: 'MacBook Pro 16" M3 Max (36GB)', serial: 'BLR-MBP-2026-108', hub: 'Bengaluru Bellandur Hub', status: 'Allocated & Acknowledged', tone: 'success' },
  { employee: 'Aditya Sengupta', asset: 'Dell UltraSharp 27" 4K Monitor', serial: 'BLR-MON-2026-088', hub: 'Remote Dispatch', status: 'Pending Courier', tone: 'info' },
];

export default function ITDashboard() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newAsset, setNewAsset] = useState({
    employee: '',
    asset: 'MacBook Pro 16" M3 Max (36GB)',
    serial: `BLR-ASSET-${Math.floor(100 + Math.random() * 900)}`,
    hub: 'Bengaluru Bellandur Hub',
  });
  const navigate = useNavigate();

  const handleRegister = e => {
    e.preventDefault();
    if (!newAsset.employee.trim()) return;
    setQueue([
      {
        employee: newAsset.employee,
        asset: newAsset.asset,
        serial: newAsset.serial,
        hub: newAsset.hub,
        status: 'Ready for Pickup',
        tone: 'info',
      },
      ...queue,
    ]);
    setIsModalOpen(false);
    setNewAsset({
      employee: '',
      asset: 'MacBook Pro 16" M3 Max (36GB)',
      serial: `BLR-ASSET-${Math.floor(100 + Math.random() * 900)}`,
      hub: 'Bengaluru Bellandur Hub',
    });
  };

  const handleUpdateStatus = (serial, newStatus, tone) => {
    setQueue(queue.map(q => (q.serial === serial ? { ...q, status: newStatus, tone } : q)));
    setEditingItem(null);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">IT Infrastructure &amp; Provisioning Operations</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Hardware workstation allocations, SaaS access keys, and Day 1 equipment readiness across India Hubs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={() => navigate('/assets')}>
            View Asset Inventory →
          </Button>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Register IT Asset
          </Button>
        </div>
      </header>

      {/* ── 3 Executive KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <StatCard
          icon={Laptop}
          label="Hardware Dispatch Queue"
          value="4"
          hint="2 ready for pickup in Bengaluru"
          tone="info"
        />
        <StatCard
          icon={KeyRound}
          label="SaaS &amp; VPN License Requests"
          value="8"
          hint="GitHub, Slack &amp; AWS 2FA access"
          tone="primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Day 1 Equipment Readiness"
          value="100%"
          hint="0 delayed handovers this quarter"
          tone="success"
        />
      </div>

      {/* ── Action Queue Card ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="h2">Provisioning &amp; Handover Action Queue</h2>
            <p className="meta">Hardware workstations and security keys to provision before employee Day 1</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {queue.map(item => (
            <div
              key={item.serial}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xs)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.employee}</div>
                <div className="meta">Tag: <span style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{item.serial}</span> · {item.hub}</div>
              </div>

              <div style={{ flex: '1 1 240px' }}>
                <div className="caption" style={{ fontWeight: 600 }}>{item.asset}</div>
              </div>

              <Badge tone={item.tone}>{item.status}</Badge>

              <Button size="xs" variant="soft" onClick={() => setEditingItem(item)}>
                Update Status
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Register Asset Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Equipment for Onboardee"
        description="Assign a laptop or security peripheral to an incoming hire."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRegister}>Confirm Registration</Button>
          </>
        }
      >
        <form onSubmit={handleRegister} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Employee Name</Label>
            <Input
              required
              placeholder="e.g. Rahul Sen"
              value={newAsset.employee}
              onChange={e => setNewAsset({ ...newAsset, employee: e.target.value })}
            />
          </div>
          <div>
            <Label>Hardware Model</Label>
            <Select
              value={newAsset.asset}
              onChange={e => setNewAsset({ ...newAsset, asset: e.target.value })}
            >
              <option value="MacBook Pro 16&quot; M3 Max (36GB)">MacBook Pro 16" M3 Max (36GB / 1TB)</option>
              <option value="ThinkPad T14s Gen 5 (32GB)">Lenovo ThinkPad T14s Gen 5 (32GB)</option>
              <option value="Dell UltraSharp 27&quot; 4K Monitor">Dell UltraSharp 27" 4K USB-C Monitor</option>
              <option value="YubiKey 5C NFC Security Key">YubiKey 5C NFC Security Key</option>
            </Select>
          </div>
          <div>
            <Label>Asset Tag Serial</Label>
            <Input
              value={newAsset.serial}
              onChange={e => setNewAsset({ ...newAsset, serial: e.target.value })}
            />
          </div>
          <div>
            <Label>Tech Hub Location</Label>
            <Select
              value={newAsset.hub}
              onChange={e => setNewAsset({ ...newAsset, hub: e.target.value })}
            >
              <option value="Bengaluru Bellandur Hub">Bengaluru Bellandur Hub</option>
              <option value="Hyderabad HITEC City">Hyderabad HITEC City</option>
              <option value="Pune Hinjawadi Hub">Pune Hinjawadi Hub</option>
              <option value="Gurugram Cyber City">Gurugram Cyber City</option>
              <option value="Remote Dispatch (Courier)">Remote Dispatch (Courier)</option>
            </Select>
          </div>
        </form>
      </Modal>

      {/* ── Update Status Modal ── */}
      {editingItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          title={`Update Status: ${editingItem.serial}`}
          description={`Assigned to ${editingItem.employee} (${editingItem.asset})`}
          footer={<Button variant="secondary" onClick={() => setEditingItem(null)}>Cancel</Button>}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <Button
              variant="secondary"
              onClick={() => handleUpdateStatus(editingItem.serial, 'Allocated & Acknowledged', 'success')}
            >
              ✓ Mark as Handed Over &amp; Acknowledged
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleUpdateStatus(editingItem.serial, 'In Courier Transit', 'warning')}
            >
              📦 Mark as In Courier Transit
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleUpdateStatus(editingItem.serial, 'Ready for Pickup', 'info')}
            >
              🏢 Mark as Ready for Office Pickup
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
