/**
 * ManagerDashboard.jsx — v2.1
 * Direct inspiration from HR_Dashboard.webp (Crextio design)
 * Consistent layout: WelcomeHero + MetricPills + 3-col grid + Collapsibles
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, AlertTriangle, TrendingUp, Calendar, UserCheck, Award } from 'lucide-react';
import {
  WelcomeHero, MetricPillBar, KPIStat, AvatarHeroCard,
  DarkTaskCard, CollapsibleRow, Card, Button, Badge, Avatar,
} from '../../../components/common/ui';
import { Sparkline, StackedBarChart, RadialProgress, ActivityTimeline } from '../../../components/common/charts';
import { useScrollReveal } from '../../../utils/animations';

const TEAM_MEMBERS = [
  { name: 'Aarav Sharma',   role: 'SDE-II',                  dept: 'Platform Engineering', hub: 'Bengaluru', progress: 72, phase: '30d', status: 'On Track',     tone: 'success' },
  { name: 'Sneha Kulkarni', role: 'Senior Product Designer', dept: 'Product & UI/UX',      hub: 'Pune',      progress: 45, phase: 'Week 1', status: 'Needs Review', tone: 'warning' },
  { name: 'Kabir Mehta',    role: 'SDE-II',                  dept: 'Platform Engineering', hub: 'Gurugram',  progress: 35, phase: 'Week 1', status: 'Just Started', tone: 'info' },
  { name: 'Aditya Sengupta',role: 'SDE-II',                  dept: 'Platform Engineering', hub: 'Bengaluru', progress: 15, phase: 'Pre-board', status: 'Just Started', tone: 'info' },
];

const PHASE_DATA = [
  { phase: 'Pre-board', count: 1 },
  { phase: 'Week 1',    count: 2 },
  { phase: '30d',       count: 1 },
  { phase: '60d',       count: 0 },
];

const VELOCITY_SPARK = [
  { d: 'W1', v: 45 }, { d: 'W2', v: 52 }, { d: 'W3', v: 61 }, { d: 'W4', v: 72 },
];

const MANAGER_TASKS = [
  { title: '1:1 Check-in with Aarav Sharma', date: 'Completed', done: true },
  { title: 'Review 30-Day Milestone — Sneha', date: 'Due today', done: false },
  { title: 'Sign off IT Provisioning — Kabir', date: 'Due tomorrow', done: false },
  { title: 'Set 60-Day Sprint OKRs — Aditya', date: 'Sep 18', done: false },
  { title: 'Quarterly Team Feedback Sync', date: 'Sep 22', done: false },
];

const RECENT_MILESTONES = [
  { title: 'Aarav Sharma passed POSH quiz (98%)', type: 'success', time: '1h ago', meta: 'Training' },
  { title: 'Sneha Kulkarni submitted portfolio documents', type: 'info', time: '4h ago', meta: 'Documents' },
  { title: 'Kabir Mehta joined Platform Engineering Slack', type: 'success', time: '1d ago', meta: 'Communication' },
];

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const rowRef   = useScrollReveal({ delay: 0.05 });
  const gridRef  = useScrollReveal({ delay: 0.1 });
  const [showAll, setShowAll] = useState(false);

  const avgProgress = Math.round(TEAM_MEMBERS.reduce((s, t) => s + t.progress, 0) / TEAM_MEMBERS.length);
  const visibleMembers = showAll ? TEAM_MEMBERS : TEAM_MEMBERS.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

      {/* ── 1. Welcome Hero ── */}
      <WelcomeHero name="Vikram Malhotra" role="Engineering Leadership" />

      {/* ── 2. Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Team Velocity"     value={72} delay={0.0} />
        <MetricPillBar label="Avg Progress"      value={avgProgress} delay={0.1} />
        <MetricPillBar label="1:1 Completion"    value={80} delay={0.2} />
        <MetricPillBar label="Pending Signoffs"  value={25} delay={0.3} color="amber" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', marginLeft: 'auto', flexShrink: 0, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 'var(--sp-5)' }}>
          <KPIStat icon={Users}         value={TEAM_MEMBERS.length} label="Members" />
          <KPIStat icon={CheckCircle2}  value={avgProgress}         label="Avg Done" suffix="%" />
          <KPIStat icon={AlertTriangle} value={1}                   label="Attention" />
        </div>
      </div>

      {/* ── 3. Main 3-Column Grid ── */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.8fr 1.5fr', gap: 'var(--sp-4)', alignItems: 'start' }}>

        {/* LEFT: Avatar Hero + Velocity Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <AvatarHeroCard
            name="Vikram Malhotra"
            role="Director of Platform Engineering"
            sub="🇮🇳 Bengaluru Tech Hub · 4 Direct Reports"
            style={{ minHeight: 220 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Card style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 2 }}>Sprint Velocity</p>
                  <div className="kpi-number" style={{ fontSize: '1.5rem' }}>+27%</div>
                </div>
                <TrendingUp size={16} style={{ color: 'var(--primary)', marginTop: 4 }} />
              </div>
              <Sparkline data={VELOCITY_SPARK} dataKey="v" color="var(--chart-green)" height={48} />
              <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                4-week ramp-up curve
              </div>
            </Card>

            <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p className="meta" style={{ color: 'var(--text-faint)' }}>Cohort Health</p>
              <RadialProgress value={88} size={84} strokeWidth={8} color="var(--chart-green)" label="88%" sublabel="On Schedule" />
            </Card>
          </div>
        </div>

        {/* MIDDLE: Team Members & Cohort Phases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Card style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 className="h3">Direct Reports</h3>
                <p className="caption" style={{ color: 'var(--text-muted)' }}>Active onboarding status</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/employees')}>View All</Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visibleMembers.map(m => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                  <Avatar name={m.name} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{m.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>• {m.hub}</span>
                    </div>
                    <div className="caption" style={{ color: 'var(--text-muted)' }}>{m.role}</div>
                  </div>
                  <div style={{ width: 70, textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{m.progress}%</div>
                    <div style={{ height: 3, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden', marginTop: 3 }}>
                      <div style={{ height: '100%', width: `${m.progress}%`, background: 'var(--primary-fill)' }} />
                    </div>
                  </div>
                  <Badge tone={m.tone}>{m.status}</Badge>
                </div>
              ))}
            </div>

            {TEAM_MEMBERS.length > 3 && (
              <button
                onClick={() => setShowAll(v => !v)}
                style={{ marginTop: 10, width: '100%', padding: '7px', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-green)', background: 'transparent', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                {showAll ? '↑ Collapse' : `+ ${TEAM_MEMBERS.length - 3} more members`}
              </button>
            )}
          </Card>

          <Card style={{ padding: 'var(--sp-4)' }}>
            <h3 className="h3" style={{ marginBottom: 12 }}>Team by Phase</h3>
            <StackedBarChart
              data={PHASE_DATA}
              xKey="phase"
              categories={[{ dataKey: 'count', name: 'Members', color: 'var(--chart-green)' }]}
              height={100}
            />
          </Card>
        </div>

        {/* RIGHT: Dark Task Card */}
        <DarkTaskCard title="Manager Action Items" tasks={MANAGER_TASKS} />

      </div>

      {/* ── 4. Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Team Milestones & Activity" icon={Award}>
          <ActivityTimeline events={RECENT_MILESTONES} />
        </CollapsibleRow>

        <CollapsibleRow title="1:1 Meeting Schedule" icon={Calendar}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { name: 'Aarav Sharma', date: 'Sep 17, 11:00 AM', topic: 'Architecture Deep-Dive & First PR' },
              { name: 'Sneha Kulkarni', date: 'Sep 18, 2:00 PM', topic: 'Figma Library & Component Review' },
              { name: 'Kabir Mehta', date: 'Sep 19, 4:30 PM', topic: 'Local Dev & Docker Setup' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{s.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{s.date}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{s.topic}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>

    </div>
  );
}
