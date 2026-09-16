import { useState } from 'react';
import { Card, Button, Badge, AnimatedList, AnimatedItem, PageHeader, KpiCard } from '../../components/common/ui';
import { MiniDonut, HorizontalBar, StackedBarChart } from '../../components/common/charts';
import { Laptop, Plus, CheckCircle2 } from 'lucide-react';

const INITIAL_ASSETS = [
  { id:1, employee:'Aarav Sharma',   asset:'MacBook Pro 16" M3 Max', serial:'BLR-MBP-2026-108', hub:'Bengaluru', status:'Acknowledged', tone:'sage'    },
  { id:2, employee:'Sneha Kulkarni', asset:'MacBook Pro 14" M3 Pro',  serial:'PUN-MBP-2026-109', hub:'Pune',      status:'In Transit',   tone:'warning' },
  { id:3, employee:'Arjun Rao',      asset:'ThinkPad T14s Gen 5',     serial:'HYD-TP-2026-214',  hub:'Hyderabad', status:'Acknowledged', tone:'sage'    },
  { id:4, employee:'Kabir Mehta',    asset:'Dell Latitude 5540',      serial:'GGN-DL-2026-301',  hub:'Gurugram',  status:'Pending',      tone:'info'    },
  { id:5, employee:'Ananya Iyer',    asset:'LG UltraFine 5K 27"',    serial:'BLR-MON-2026-045', hub:'Bengaluru', status:'Acknowledged', tone:'sage'    },
];

const BY_HUB = [
  { label:'Bengaluru', value:2, displayValue:'2 assets' },
  { label:'Hyderabad', value:1, displayValue:'1 asset' },
  { label:'Pune',      value:1, displayValue:'1 asset' },
  { label:'Gurugram',  value:1, displayValue:'1 asset' },
];

const BY_CAT = [
  { name:'Laptops', count:4 }, { name:'Monitors', count:1 }, { name:'Keyboards', count:0 }, { name:'Software', count:0 },
];

export default function AssetsView() {
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const acknowledged = assets.filter(a=>a.tone==='sage').length;

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader title="Assets" subtitle="Hardware provisioning and acknowledgement tracking for India tech hubs."
        action={<Button size="sm" icon={Plus}>Add Asset</Button>} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'var(--sp-4)' }}>
        <KpiCard icon={Laptop} label="Total Assets"  value={assets.length} />
        <KpiCard icon={CheckCircle2} label="Acknowledged" value={acknowledged} />
        <KpiCard icon={Laptop} label="Pending"       value={assets.length-acknowledged} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:14 }}>By Category</h2>
          <StackedBarChart data={BY_CAT} xKey="name" categories={[{ dataKey:'count', name:'Assets', color:'var(--chart-1)' }]} height={120} />
        </Card>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom:12 }}>By Tech Hub</h2>
          <HorizontalBar items={BY_HUB} colorVar="--chart-1" />
        </Card>
      </div>

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Asset Registry</h2>
        <AnimatedList style={{ display:'grid', gap:6 }}>
          {assets.map(a => (
            <AnimatedItem key={a.id}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)', flexWrap:'wrap', transition:'all var(--t-fast)' }}
                onMouseEnter={e=>{e.currentTarget.style.background='var(--sage-50)';e.currentTarget.style.borderColor='var(--sage-200)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='var(--bg-surface)';e.currentTarget.style.borderColor='var(--border-subtle)'}}>
                <div style={{ width:32, height:32, borderRadius:'var(--r-md)', background:'var(--sage-100)', display:'grid', placeItems:'center', flexShrink:0 }}>
                  <Laptop size={15} style={{ color:'var(--sage-700)' }} />
                </div>
                <div style={{ flex:'1 1 200px', minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:'0.875rem', color:'var(--text-primary)' }}>{a.asset}</div>
                  <div className="meta">{a.employee} · {a.serial} · {a.hub}</div>
                </div>
                <Badge tone={a.tone}>{a.status}</Badge>
                {a.tone!=='sage' && (
                  <Button variant="soft" size="xs" icon={CheckCircle2} onClick={() => setAssets(as => as.map((it,idx) => it.id===a.id ? { ...it, status:'Acknowledged', tone:'sage' } : it))}>Acknowledge</Button>
                )}
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
      </Card>
    </div>
  );
}
