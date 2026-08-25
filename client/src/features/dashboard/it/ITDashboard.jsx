import { Card, Button, Badge, Kpi } from '../../../components/common/ui';

export default function ITDashboard() {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display" style={{ fontSize: '1.6rem' }}>IT & Provisioning Operations</h1>
          <p className="body" style={{ color: 'var(--text-3)' }}>
            Hardware allocation, software licensing, and Day 1 equipment readiness.
          </p>
        </div>
        <Button size="md">+ Register Asset</Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <Kpi icon="💻" label="Hardware in Queue" value="5" hint="Ready for dispatch" tone="info" />
        <Kpi icon="🔑" label="License Requests" value="8" hint="SaaS & VPN access" />
        <Kpi icon="✓" label="Day 1 Readiness" value="100%" hint="0 delayed handovers" tone="success" />
      </div>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h2 className="h2">Provisioning Action Queue</h2>
            <p className="meta">Hardware and system accounts to provision before employee start dates</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          {[
            { employee: 'Chloe Dubois', asset: 'MacBook Pro 16" M3', serial: 'MBP-2026-904', status: 'Pending Courier', tone: 'warning' },
            { employee: 'Liam Smith', asset: 'Dell Latitude 7440', serial: 'DEL-2026-441', status: 'Ready for Pickup', tone: 'info' },
            { employee: 'Alex Johnson', asset: 'MacBook Pro 14" M3', serial: 'MBP-2026-102', status: 'Allocated & Acknowledged', tone: 'success' },
          ].map(item => (
            <div
              key={item.serial}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-4)',
                padding: 'var(--sp-3) var(--sp-4)',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-white)',
                boxShadow: 'var(--neo-sm)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 180px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.employee}</div>
                <div className="meta">Tag: {item.serial}</div>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <div className="caption" style={{ fontWeight: 600 }}>{item.asset}</div>
              </div>
              <Badge tone={item.tone}>{item.status}</Badge>
              <Button size="sm" variant="soft">Update Status</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
