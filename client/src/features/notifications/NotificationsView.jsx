import { useState } from 'react';
import { Card, Button, PageHeader } from '../../components/common/ui';
import { ActivityTimeline } from '../../components/common/charts';
import { BellOff } from 'lucide-react';

const INITIAL_NOTIFS = [
  { title:'POSH certification due tomorrow',          description:'Complete POSH Act 2013 module by EOD tomorrow.',  type:'warning', time:'2h ago',    meta:'Training'  },
  { title:'Document approved: PAN Card',              description:'Priya Patel approved your PAN Card submission.',  type:'success', time:'5h ago',    meta:'Documents' },
  { title:'Asset acknowledged: MacBook Pro 16" M3',  description:'Rohan Verma confirmed hardware allocation.',       type:'success', time:'Yesterday', meta:'IT Assets' },
  { title:'1:1 reminder with Vikram Malhotra',        description:'Your 60-day milestone check-in is today.',        type:'info',    time:'Yesterday', meta:'Manager'   },
  { title:'New teammate joining Platform Eng',        description:'Pooja Desai joins Platform Engineering Monday.',  type:'info',    time:'2d ago',    meta:'Team'      },
  { title:'DPDP training 40% complete',               description:"Keep going — you're making great progress.",      type:'neutral', time:'3d ago',    meta:'Training'  },
];

export default function NotificationsView() {
  const [notifs] = useState(INITIAL_NOTIFS);
  const [read, setRead] = useState([]);
  const unread = notifs.length - read.length;

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Notifications" subtitle={`${unread} unread`}
        action={<Button variant="ghost" size="sm" icon={BellOff} onClick={() => setRead(notifs.map((_,i)=>i))}>Mark all read</Button>} />
      <Card $p="var(--sp-5)">
        <ActivityTimeline events={notifs.map((n,i) => ({ ...n, type:read.includes(i)?'neutral':n.type }))} maxVisible={20} />
      </Card>
    </div>
  );
}
