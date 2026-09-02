import { Card, PageHeader } from '../../components/common/ui';
import { TrendChart, ActivityTimeline } from '../../components/common/charts';

const AUDIT_EVENTS = [
  { title: 'Employee document approved',       description: 'Priya Patel approved PAN Card for Aarav Sharma.',        type: 'success', time: '10:32 AM', meta: 'Documents' },
  { title: 'Asset allocation updated',         description: 'Rohan Verma updated MacBook Pro serial BLR-MBP-2026-108.', type: 'info',    time: '09:15 AM', meta: 'Assets' },
  { title: 'Login — priya.patel',              description: 'Authenticated from Bengaluru Hub (IP 10.2.4.88).',        type: 'neutral', time: 'Yesterday 08:01 AM', meta: 'Auth' },
  { title: 'RBAC permission change',           description: 'neha.nair granted COMPLIANCE_OFFICER access.',            type: 'warning', time: '2d ago 04:22 PM', meta: 'Security' },
  { title: 'New employee onboarded',           description: 'Kabir Mehta enrolled in Engineering 90-Day plan.',        type: 'success', time: '2d ago 11:00 AM', meta: 'Onboarding' },
  { title: 'Document rejected',               description: 'Priya Patel rejected Cancelled Cheque from Pooja Desai.',  type: 'danger',  time: '3d ago 02:41 PM', meta: 'Documents' },
  { title: 'Training course completed',        description: 'Arjun Rao completed Information Security Governance.',    type: 'success', time: '3d ago 03:15 PM', meta: 'Training' },
  { title: 'Settings updated',                description: 'admin changed email retention policy to 90 days.',         type: 'neutral', time: '4d ago 01:10 PM', meta: 'Settings' },
];

const ACTIVITY_TREND = [
  { date: 'Mon', events: 12 }, { date: 'Tue', events: 18 }, { date: 'Wed', events: 9 },
  { date: 'Thu', events: 22 }, { date: 'Fri', events: 15 }, { date: 'Sat', events: 4 }, { date: 'Sun', events: 2 },
];

export default function AuditView() {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="Audit Log" subtitle="System-wide security and compliance event trail." />

      {/* ── Event frequency chart + Timeline (Bento Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        <Card $hoverable style={{ gridColumn: 'span 5', padding: 'var(--sp-5)' }}>
          <h2 className="h3" style={{ marginBottom: 'var(--sp-4)' }}>Event Frequency (7 days)</h2>
          <TrendChart
            data={ACTIVITY_TREND}
            xKey="date"
            series={[{ dataKey: 'events', name: 'Events', color: 'var(--chart-blue)' }]}
            height={200}
          />
        </Card>

        {/* ── Timeline ── */}
        <Card $hoverable style={{ gridColumn: 'span 7', padding: 'var(--sp-5)' }}>
          <h2 className="h3" style={{ marginBottom: 'var(--sp-5)' }}>Event Trail</h2>
          <ActivityTimeline events={AUDIT_EVENTS} maxVisible={20} />
        </Card>
      </div>
    </div>
  );
}
