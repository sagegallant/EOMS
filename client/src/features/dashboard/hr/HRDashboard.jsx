/**
 * HRDashboard.jsx — v2.1
 * Direct inspiration from HR_Dashboard.webp (Crextio design)
 *
 * Layout:
 *   [WelcomeHero] "Welcome in," + role + date
 *   [MetricPillBars row] Active 18 | Compliance 98% | SLA 84% | Pending 3
 *   [KPI row] 18 👥 · 98% ✓ · 3 ⚠
 *   [3-col grid]
 *     Left:  AvatarHeroCard (Priya Patel) + week progress chart
 *     Mid:   Compliance ring + schedule/week calendar
 *     Right: DarkTaskCard (Onboarding Tasks 4/12)
 *   [Collapsibles] Pension & EPFO | Document Queue | Training Compliance
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle2, AlertTriangle, TrendingUp, FileText, BookOpen } from 'lucide-react';
import {
  WelcomeHero, MetricPillBar, KPIStat, AvatarHeroCard,
  DarkTaskCard, CollapsibleRow, Card, Button, Badge, Avatar,
} from '../../../components/common/ui';
import { MiniDonut, Sparkline, StackedBarChart, RadialProgress, ActivityTimeline } from '../../../components/common/charts';
import { useScrollReveal } from '../../../utils/animations';

/* ── Static data ── */
const WEEK_ACTIVITY = [
  { d: 'Mon', v: 14 }, { d: 'Tue', v: 18 }, { d: 'Wed', v: 11 },
  { d: 'Thu', v: 20 }, { d: 'Fri', v: 16 }, { d: 'Sat', v: 6 }, { d: 'Sun', v: 3 },
];

const COHORT_PHASE = [
  { phase: 'Pre', count: 2 }, { phase: 'Wk 1', count: 4 },
  { phase: '30d', count: 5 }, { phase: '60d', count: 4 }, { phase: '90d', count: 3 },
];

const ONBOARDING_TASKS = [
  { title: 'Aadhaar Verification — Aarav', date: 'Sep 13', done: true },
  { title: 'EPFO Form 11 — Sneha', date: 'Sep 13', done: true },
  { title: 'POSH Training — Kabir', date: 'Sep 14', done: false },
  { title: 'Asset Assignment — Pooja', date: 'Sep 15', done: false },
  { title: '1:1 Check-in — Ananya', date: 'Sep 16', done: false },
];

const SCHEDULE_EVENTS = [
  { title: 'Aarav — POSH Session', time: '10:00 AM', tone: 'success' },
  { title: 'Sneha — Doc Review', time: '2:30 PM', tone: 'amber' },
  { title: 'Kabir — IT Onboarding', time: '4:00 PM', tone: 'info' },
];

const COHORT = [
  { name: 'Aarav Sharma',   role: 'SDE-II',                   dept: 'Platform Eng', hub: 'Bengaluru', progress: 72, tone: 'success' },
  { name: 'Sneha Kulkarni', role: 'Sr. Product Designer',     dept: 'Product & UX', hub: 'Pune',       progress: 45, tone: 'warning' },
  { name: 'Arjun Rao',      role: 'Cloud Infra Specialist',   dept: 'Cloud & Infra', hub: 'Hyderabad', progress: 88, tone: 'success' },
  { name: 'Kabir Mehta',    role: 'SDE-II',                   dept: 'Platform Eng', hub: 'Gurugram',   progress: 35, tone: 'info' },
];

const PENDING_DOCS = [
  { name: 'Sneha Kulkarni', doc: 'Aadhaar Card',    date: 'Mar 15' },
  { name: 'Kabir Mehta',    doc: 'Relieving Letter', date: 'Mar 18' },
  { name: 'Pooja Desai',    doc: 'Cancelled Cheque', date: 'Mar 14' },
];

const TRAINING_ITEMS = [
  { label: 'POSH Act 2013',       pct: 98, color: 'var(--chart-green)' },
  { label: 'Data Protection Act', pct: 84, color: 'var(--chart-sage)' },
  { label: 'Induction Module',    pct: 76, color: 'var(--chart-amber)' },
];

export default function HRDashboard() {
  const navigate = useNavigate();
  const rowRef   = useScrollReveal({ delay: 0.05 });
  const gridRef  = useScrollReveal({ delay: 0.1 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>

      {/* ── 1. Welcome hero ── */}
      <WelcomeHero name="Priya Patel" role="People Operations" />

      {/* ── 2. Metric pill bars (Crextio row) ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Active Onboardees" value={72} delay={0.0} />
        <MetricPillBar label="Compliance"        value={98} delay={0.1} />
        <MetricPillBar label="SLA Performance"   value={84} delay={0.2} />
        <MetricPillBar label="Pending Docs"      value={33} delay={0.3} color="amber" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-6)', marginLeft: 'auto', flexShrink: 0, borderLeft: '1px solid var(--border-subtle)', paddingLeft: 'var(--sp-5)' }}>
          <KPIStat icon={Users}        value={18}  label="Employees" />
          <KPIStat icon={CheckCircle2} value={98}  label="Compliance" suffix="%" />
          <KPIStat icon={AlertTriangle} value={3}  label="Pending" />
        </div>
      </div>

      {/* ── 3. Main 3-column grid ── */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: '2.2fr 1.8fr 1.5fr', gap: 'var(--sp-4)', alignItems: 'start' }}>

        {/* LEFT: Avatar hero + week chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <AvatarHeroCard name="Priya Patel" role="HR Administrator" sub="₹ People Operations · Bengaluru" style={{ minHeight: 220 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            {/* Progress / week chart */}
            <Card style={{ padding: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 2 }}>Week in review</p>
                  <div className="kpi-number" style={{ fontSize: '1.5rem' }}>18 <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>active</span></div>
                </div>
                <TrendingUp size={16} style={{ color: 'var(--primary)', marginTop: 4 }} />
              </div>
              <Sparkline data={WEEK_ACTIVITY} dataKey="v" color="var(--chart-green)" height={56} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <span key={i} style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>{d}</span>
                ))}
              </div>
            </Card>
            {/* Compliance ring */}
            <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p className="meta" style={{ color: 'var(--text-faint)' }}>Compliance</p>
              <RadialProgress value={98} size={84} strokeWidth={8} color="var(--chart-green)" label="98%" sublabel="POSH" />
            </Card>
          </div>
        </div>

        {/* MIDDLE: Schedule + cohort phases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {/* Schedule */}
          <Card style={{ padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 className="h3">Schedule</h3>
              <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sep 2026</span>
            </div>
            {/* Mini week row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 14 }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-faint)', marginBottom: 3 }}>{d}</div>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', margin: '0 auto', background: i === 2 ? 'var(--bg-dark)' : i === 0 ? 'var(--primary-light)' : 'transparent', color: i === 2 ? '#fff' : i === 0 ? 'var(--primary)' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: i <= 2 ? 600 : 400, display: 'grid', placeItems: 'center' }}>
                    {16 + i}
                  </div>
                </div>
              ))}
            </div>
            {/* Events */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SCHEDULE_EVENTS.map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 'var(--r-sm)', background: ev.tone === 'success' ? 'var(--success-bg)' : ev.tone === 'amber' ? 'var(--amber-bg)' : 'var(--info-bg)', border: `1px solid ${ev.tone === 'success' ? 'var(--border-green)' : ev.tone === 'amber' ? 'var(--amber-border)' : 'rgba(59,130,246,0.2)'}` }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: ev.tone === 'success' ? 'var(--primary)' : ev.tone === 'amber' ? 'var(--amber)' : 'var(--info)', flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>{ev.title}</div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ev.time}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Cohort phase chart */}
          <Card style={{ padding: 'var(--sp-4)' }}>
            <h3 className="h3" style={{ marginBottom: 12 }}>Cohort by Phase</h3>
            <StackedBarChart data={COHORT_PHASE} xKey="phase" categories={[{ dataKey: 'count', name: 'Employees', color: 'var(--chart-green)' }]} height={110} />
          </Card>
        </div>

        {/* RIGHT: Dark task card */}
        <DarkTaskCard title="Onboarding Tasks" tasks={ONBOARDING_TASKS} />
      </div>

      {/* ── 4. Collapsibles (Crextio bottom section) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {/* Document Queue */}
        <CollapsibleRow title="Document Queue" icon={FileText}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PENDING_DOCS.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < PENDING_DOCS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <Avatar name={d.name} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{d.name}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>{d.doc} · Due {d.date}</div>
                </div>
                <Badge tone="warning">Pending</Badge>
                <Button size="xs" variant="soft">Review</Button>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        {/* Training Compliance */}
        <CollapsibleRow title="Training Compliance" icon={BookOpen}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {TRAINING_ITEMS.map(t => (
              <div key={t.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 5 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${t.pct}%`, background: t.color, borderRadius: 'inherit', transition: 'width 0.8s var(--ease-out)' }} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        {/* Cohort Summary */}
        <CollapsibleRow title="Active Cohort" icon={Users} defaultOpen>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {COHORT.map(emp => (
              <div key={emp.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <Avatar name={emp.name} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.name}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>{emp.role} · {emp.dept}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🇮🇳 <span>{emp.hub}</span>
                </div>
                <div style={{ width: 80 }}>
                  <div style={{ height: 4, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${emp.progress}%`, background: 'var(--primary-fill)', borderRadius: 'inherit', transition: 'width 0.8s var(--ease-out)' }} />
                  </div>
                  <div className="meta" style={{ marginTop: 2, textAlign: 'right', color: 'var(--text-muted)' }}>{emp.progress}%</div>
                </div>
                <Badge tone={emp.tone}>{emp.tone === 'success' ? 'On Track' : emp.tone === 'warning' ? 'Review' : 'Started'}</Badge>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>
    </div>
  );
}
