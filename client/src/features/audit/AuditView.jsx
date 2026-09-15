import { Card, PageHeader } from '../../components/common/ui';
import { TrendChart, ActivityTimeline } from '../../components/common/charts';

const AUDIT_EVENTS = [
  { title:'Employee document approved',  description:'Priya Patel approved PAN Card for Aarav Sharma.',     type:'success', time:'10:32 AM', meta:'Documents'  },
  { title:'Asset allocation updated',    description:'MacBook Pro serial BLR-MBP-2026-108 allocated.',      type:'info',    time:'09:15 AM', meta:'Assets'     },
  { title:'Login — priya.patel',         description:'Authenticated from Bengaluru Hub (IP 10.2.4.88).',    type:'neutral', time:'Yest. 08:01', meta:'Auth'   },
  { title:'RBAC permission change',      description:'neha.nair granted COMPLIANCE_OFFICER access.',         type:'warning', time:'2d 04:22 PM', meta:'Security'},
  { title:'New employee onboarded',      description:'Kabir Mehta enrolled in Engineering 90-Day plan.',    type:'success', time:'2d 11:00 AM', meta:'Onboard'},
  { title:'Document rejected',           description:'Priya Patel rejected Cancelled Cheque from Pooja.',   type:'danger',  time:'3d 02:41 PM', meta:'Docs'   },
  { title:'Training course completed',   description:'Arjun Rao completed Information Security module.',    type:'success', time:'3d 03:15 PM', meta:'Training'},
];

const ACTIVITY_TREND = [
  { date:'Mon', events:12 }, { date:'Tue', events:18 }, { date:'Wed', events:9 },
  { date:'Thu', events:22 }, { date:'Fri', events:15 }, { date:'Sat', events:4 }, { date:'Sun', events:2 },
];

export default function AuditView() {
  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Audit Log" subtitle="System-wide security and compliance event trail." />
      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Event Frequency (7 days)</h2>
        <TrendChart data={ACTIVITY_TREND} xKey="date" series={[{ dataKey:'events', name:'Events', color:'var(--chart-1)' }]} height={160} />
      </Card>
      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:16 }}>Event Trail</h2>
        <ActivityTimeline events={AUDIT_EVENTS} maxVisible={20} />
      </Card>
    </div>
  );
}
