/**
 * EmployeeDashboard.jsx — v2.1
 * Same Crextio pattern: WelcomeHero + MetricPills + 3-col grid + Collapsibles
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Laptop, FileCheck, ShieldCheck } from 'lucide-react';
import { WelcomeHero, MetricPillBar, AvatarHeroCard, DarkTaskCard, CollapsibleRow, Card, Button, Badge } from '../../../components/common/ui';
import { RadialProgress, Sparkline, ActivityTimeline } from '../../../components/common/charts';

const WEEK = [{ d: 'M', v: 2 }, { d: 'T', v: 4 }, { d: 'W', v: 1 }, { d: 'T', v: 3 }, { d: 'F', v: 2 }, { d: 'S', v: 0 }, { d: 'S', v: 1 }];

const MY_TASKS = [
  { title: 'Complete POSH Sensitization Quiz', date: 'Due tomorrow', done: false },
  { title: 'Sign IP & Confidentiality Agreement', date: 'Due this week', done: false },
  { title: '1:1 Check-in with Vikram Malhotra', date: 'Mar 25', done: false },
  { title: 'Acknowledge MacBook Pro 16" M3', date: 'Done', done: true },
  { title: 'Submit PAN Card & Aadhaar', date: 'Done', done: true },
];

const TRAINING = [
  { label: 'POSH Act 2013', pct: 68, color: 'var(--chart-green)' },
  { label: 'Data Protection (DPDP)', pct: 40, color: 'var(--chart-sage)' },
  { label: 'Engineering Best Practices', pct: 90, color: 'var(--chart-amber)' },
];

const GOALS = [
  { title: 'Meet your team', icon: '👥', pct: 100, done: true },
  { title: 'Set up tools & accounts', icon: '⚙️', pct: 85, done: false },
  { title: 'Complete POSH training', icon: '📋', pct: 68, done: false },
  { title: 'Submit all documents', icon: '📄', pct: 72, done: false },
];

const ACTIVITY = [
  { title: 'Completed POSH Module Part 1', type: 'success', time: '2h ago', meta: 'Training' },
  { title: 'Submitted PAN Card', type: 'info', time: 'Yesterday', meta: 'Documents' },
  { title: 'MacBook Pro 16" acknowledged', type: 'success', time: '2d ago', meta: 'IT Assets' },
];

const ASSETS = [
  { label: 'MacBook Pro 16" M3 Max', serial: 'BLR-MBP-2026-108', status: 'Acknowledged', tone: 'success' },
  { label: 'YubiKey Security Key', serial: 'BLR-YK-2026-044', status: 'Pending', tone: 'warning' },
];

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <WelcomeHero name="Aarav Sharma" role="Platform Engineering · SDE-II" />

      {/* Metric pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Journey Progress" value={72} delay={0.0} />
        <MetricPillBar label="POSH Completion" value={68} delay={0.1} />
        <MetricPillBar label="Documents"       value={85} delay={0.2} />
        <MetricPillBar label="Tasks Done"      value={57} delay={0.3} color="amber" />
      </div>

      {/* 3-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 1.5fr', gap: 'var(--sp-4)', alignItems: 'start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <AvatarHeroCard name="Aarav Sharma" role="Senior Software Engineer (SDE-II)" sub="🇮🇳 Bengaluru Hub · Week 3 of 90" style={{ minHeight: 210 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Card style={{ padding: 'var(--sp-4)' }}>
              <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 4 }}>Weekly tasks</p>
              <div className="kpi-number" style={{ fontSize: '1.5rem', marginBottom: 8 }}>13 <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>done</span></div>
              <Sparkline data={WEEK} dataKey="v" color="var(--chart-green)" height={44} />
            </Card>
            <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p className="meta" style={{ color: 'var(--text-faint)' }}>Journey</p>
              <RadialProgress value={72} size={80} strokeWidth={8} color="var(--chart-green)" label="72%" sublabel="Complete" />
            </Card>
          </div>
        </div>

        {/* MIDDLE: Goals tracker */}
        <Card style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 className="h3">Goals Tracker</h3>
            <span className="caption" style={{ color: 'var(--text-muted)' }}>First 2 weeks</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {GOALS.map(g => (
              <div key={g.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1rem' }}>{g.icon}</span>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>{g.title}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: g.done ? 'var(--primary)' : 'var(--text-muted)' }}>{g.pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.pct}%`, background: g.done ? 'var(--chart-green)' : 'var(--primary-fill)', borderRadius: 'inherit', transition: 'width 0.8s var(--ease-out)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT: Dark task card */}
        <DarkTaskCard title="My Tasks" tasks={MY_TASKS} />
      </div>

      {/* Collapsibles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="My Training" icon={BookOpen}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRAINING.map(t => (
              <div key={t.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{t.label}</span>
                  <span style={{ fontWeight: 600 }}>{t.pct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${t.pct}%`, background: t.color, borderRadius: 'inherit', transition: 'width 0.8s var(--ease-out)' }} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
        <CollapsibleRow title="IT Assets" icon={Laptop}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ASSETS.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: i < ASSETS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <Laptop size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{a.label}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>{a.serial}</div>
                </div>
                <Badge tone={a.tone}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </CollapsibleRow>
        <CollapsibleRow title="Recent Activity" icon={ShieldCheck}>
          <ActivityTimeline events={ACTIVITY} />
        </CollapsibleRow>
      </div>
    </div>
  );
}
