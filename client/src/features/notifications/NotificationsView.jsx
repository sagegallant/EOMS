import { useState } from 'react';
import { Card, Button, PageHeader } from '../../components/common/ui';
import { ActivityTimeline } from '../../components/common/charts';
import { BellOff } from 'lucide-react';

const INITIAL_NOTIFS = [
  { title: 'POSH certification due tomorrow',                  description: 'Complete the POSH Act 2013 module by EOD tomorrow.',   type: 'warning', time: '2h ago',  meta: 'Training' },
  { title: 'Document approved: PAN Card',                      description: 'Priya Patel approved your PAN Card submission.',         type: 'success', time: '5h ago',  meta: 'Documents' },
  { title: 'Asset acknowledged: MacBook Pro 16" M3',           description: 'Rohan Verma confirmed your hardware allocation.',        type: 'success', time: 'Yesterday', meta: 'IT Assets' },
  { title: '1:1 reminder with Vikram Malhotra',                description: 'Your 60-day milestone check-in is scheduled for today.', type: 'info',    time: 'Yesterday', meta: 'Manager' },
  { title: 'New teammate joining your team',                   description: 'Pooja Desai joins Platform Engineering on Monday.',      type: 'info',    time: '2d ago',  meta: 'Team' },
  { title: 'Data Protection training 40% complete',            description: 'Keep going — you\'re making good progress.',             type: 'neutral', time: '3d ago',  meta: 'Training' },
];

export default function NotificationsView() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [read, setRead] = useState([]);

  const markAllRead = () => setRead(notifs.map((_, i) => i));

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Notifications"
        subtitle={`${notifs.length - read.length} unread`}
        action={
          <Button variant="ghost" size="sm" icon={BellOff} onClick={markAllRead}>Mark all read</Button>
        }
      />

      <Card $hoverable style={{ padding: 'var(--sp-5)' }}>
        <ActivityTimeline
          events={notifs.map((n, i) => ({
            ...n,
            time: n.time,
            title: n.title,
            type: read.includes(i) ? 'neutral' : n.type,
          }))}
          maxVisible={20}
        />
      </Card>
    </div>
  );
}
