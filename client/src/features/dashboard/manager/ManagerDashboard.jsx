import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Avatar, AnimatedList, AnimatedItem, PageHeader } from '../../../components/common/ui';
import { StackedBarChart, Sparkline } from '../../../components/common/charts';
import { ChevronRight, Users } from 'lucide-react';

const TEAM = [
  { name: 'Aarav Sharma',   role: 'SDE-II',                dept: 'Platform Engineering', progress: 72, status: 'On Track',     tone: 'success' },
  { name: 'Sneha Kulkarni', role: 'Senior Product Designer', dept: 'Product & UI/UX',      progress: 45, status: 'Needs Review', tone: 'warning' },
  { name: 'Kabir Mehta',    role: 'SDE-II',                dept: 'Platform Engineering', progress: 35, status: 'Just Started', tone: 'info' },
  { name: 'Aditya Sengupta',role: 'SDE-II',                dept: 'Platform Engineering', progress: 15, status: 'Just Started', tone: 'info' },
];

const PHASE_DATA = [
  { phase: 'Week 1', count: 2 },
  { phase: '30d',    count: 1 },
  { phase: '60d',    count: 1 },
];

const SPARK = [
  { d: 'W1', v: 55 }, { d: 'W2', v: 61 }, { d: 'W3', v: 58 }, { d: 'W4', v: 67 },
];

export default function ManagerDashboard() {
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const visible = showAll ? TEAM : TEAM.slice(0, 2);
  const avgProgress = Math.round(TEAM.reduce((s, t) => s + t.progress, 0) / TEAM.length);

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="Team Overview" subtitle={`${TEAM.length} team members in active onboarding.`} />

      {/* ── KPI + Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Team Avg Progress</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{avgProgress}%</div>
              <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 4 }}>Target: 75% by end-of-month</div>
            </div>
            <div style={{ width: 80 }}>
              <Sparkline data={SPARK} dataKey="v" color="var(--chart-blue)" height={36} />
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="h3" style={{ marginBottom: 12 }}>Team by Phase</h2>
          <StackedBarChart
            data={PHASE_DATA}
            xKey="phase"
            categories={[{ dataKey: 'count', name: 'Members', color: 'var(--chart-violet)' }]}
            height={100}
          />
        </Card>
      </div>

      {/* ── Team List ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 className="h3">My Team</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>View all <ChevronRight size={13} /></Button>
        </div>
        <AnimatedList style={{ display: 'grid', gap: 8 }}>
          {visible.map(m => (
            <AnimatedItem key={m.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
                <Avatar name={m.name} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{m.name}</div>
                  <div className="meta" style={{ color: 'var(--text-muted)' }}>{m.role}</div>
                </div>
                <div style={{ width: 100 }}>
                  <div style={{ height: 3, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.progress}%`, background: 'var(--primary)', borderRadius: 'inherit', transition: 'width 600ms var(--ease)' }} />
                  </div>
                  <div className="meta" style={{ marginTop: 2, textAlign: 'right', color: 'var(--text-muted)' }}>{m.progress}%</div>
                </div>
                <Badge tone={m.tone}>{m.status}</Badge>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
        {TEAM.length > 2 && (
          <button onClick={() => setShowAll(v => !v)}
            style={{ marginTop: 10, width: '100%', padding: '7px', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer' }}>
            {showAll ? '↑ Collapse' : `+ ${TEAM.length - 2} more members`}
          </button>
        )}
      </Card>
    </div>
  );
}
