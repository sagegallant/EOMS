/**
 * ProfileView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + 3-col Hero grid + DarkTaskCard + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, Avatar, PageHeader, MetricPillBar, AvatarHeroCard, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { RadialProgress, Sparkline, ActivityTimeline } from '../../components/common/charts';
import { Mail, MapPin, Building2, Calendar, ShieldCheck, Award, FileText, UserCheck } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const SPARK_WEEK = [
  { d: 'M', v: 2 }, { d: 'T', v: 4 }, { d: 'W', v: 1 }, { d: 'T', v: 3 }, { d: 'F', v: 2 }, { d: 'S', v: 0 }, { d: 'S', v: 1 },
];

const MODULES = [
  { label: 'POSH Act 2013 Sensitization', pct: 68, color: 'var(--chart-green)' },
  { label: 'DPDP Act 2023 Data Privacy',  pct: 40, color: 'var(--chart-sage)' },
  { label: 'Engineering Architecture & Testing', pct: 90, color: 'var(--chart-green)' },
];

const AARAV_TASKS = [
  { title: 'Complete POSH Sensitization Quiz', date: 'Due Tomorrow', done: false },
  { title: 'Sign IP & Confidentiality Agreement', date: 'Due this week', done: false },
  { title: '1:1 Check-in with Vikram Malhotra', date: 'Sep 18', done: false },
  { title: 'Acknowledge MacBook Pro 16" M3', date: 'Done', done: true },
  { title: 'Submit PAN Card & Aadhaar', date: 'Done', done: true },
];

const ACTIVITY = [
  { title: 'Completed POSH Act Module 1', type: 'success', time: '2h ago', meta: 'Training' },
  { title: 'Submitted PAN Card Document', type: 'info', time: 'Yesterday', meta: 'Documents' },
  { title: 'MacBook Pro 16" Acknowledged', type: 'success', time: '2d ago', meta: 'IT Assets' },
  { title: 'Enrolled in Platform 90-Day Plan', type: 'info', time: '3d ago', meta: 'Onboarding' },
];

export default function ProfileView() {
  const rowRef = useScrollReveal({ delay: 0.05 });
  const gridRef = useScrollReveal({ delay: 0.1 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Employee Profile"
        subtitle="Individual onboarding progression, statutory compliance records, and learning records."
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Onboarding Progress" value={72} delay={0.0} />
        <MetricPillBar label="POSH Certification"   value={68} delay={0.1} />
        <MetricPillBar label="Document Compliance"  value={85} delay={0.2} />
        <MetricPillBar label="Hardware Dispatch"    value={100} delay={0.3} />
      </div>

      {/* ── 3-Column Profile Grid ── */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: '2fr 1.8fr 1.4fr', gap: 'var(--sp-4)', alignItems: 'start' }}>

        {/* LEFT: Avatar Hero + Progress Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <AvatarHeroCard
            name="Aarav Sharma"
            role="Senior Software Engineer (SDE-II)"
            sub="🇮🇳 Bengaluru Tech Hub · Platform Engineering"
            style={{ minHeight: 220 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
            <Card style={{ padding: 'var(--sp-4)' }}>
              <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 4 }}>Weekly Tasks</p>
              <div className="kpi-number" style={{ fontSize: '1.5rem', marginBottom: 8 }}>
                13 <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>completed</span>
              </div>
              <Sparkline data={SPARK_WEEK} dataKey="v" color="var(--chart-green)" height={44} />
            </Card>
            <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <p className="meta" style={{ color: 'var(--text-faint)' }}>Overall Journey</p>
              <RadialProgress value={72} size={80} strokeWidth={8} color="var(--chart-green)" label="72%" sublabel="Complete" />
            </Card>
          </div>
        </div>

        {/* MIDDLE: Employment Details + Training */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <Card style={{ padding: 'var(--sp-4)' }}>
            <h3 className="h3" style={{ marginBottom: 14 }}>Employment Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.8125rem' }}>
              {[
                [Building2, 'Platform Engineering'],
                [MapPin,     'Bengaluru (Bellandur Hub)'],
                [Mail,       'aarav.sharma@eoms.in'],
                [Calendar,   'Joined Jan 12, 2026'],
                [UserCheck,  'Manager: Vikram Malhotra'],
                [Award,      'Buddy: Rahul Verma'],
              ].map(([Icon, val]) => (
                <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                  <Icon size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 'var(--sp-4)' }}>
            <h3 className="h3" style={{ marginBottom: 14 }}>Curriculum & Training</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MODULES.map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{m.pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 'inherit', transition: 'width 0.8s var(--ease-out)' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT: Dark Task Card */}
        <DarkTaskCard title="Aarav's Next Actions" tasks={AARAV_TASKS} />

      </div>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Statutory Indian Tax & Provident Fund Registration" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { field: 'Permanent Account Number (PAN)', value: 'ABCPS1234F', status: 'Verified via NSDL' },
              { field: 'Universal Account Number (UAN)', value: '101458923401', status: 'EPFO Active' },
              { field: 'Provident Fund Member ID', value: 'KN/BNG/0045892/000/00145', status: 'Linked' },
              { field: 'Corporate Health Cover (₹10L)', value: 'Care Health / Star Health', status: 'Enrolled' },
            ].map((st, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{st.field}</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginTop: 2, fontFamily: 'monospace' }}>{st.value}</div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary)', marginTop: 2 }}>{st.status}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Recent Activity & Audit Timeline" icon={FileText}>
          <ActivityTimeline events={ACTIVITY} />
        </CollapsibleRow>
      </div>
    </div>
  );
}
