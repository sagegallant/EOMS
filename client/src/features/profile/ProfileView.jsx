import { useState } from 'react';
import { Card, Button, Avatar, PageHeader } from '../../components/common/ui';
import { RadialProgress, Sparkline, ActivityTimeline } from '../../components/common/charts';
import { Mail, MapPin, Building2, Calendar } from 'lucide-react';

const SPARK_WEEK = [
  { d: 'M', v: 2 }, { d: 'T', v: 4 }, { d: 'W', v: 1 }, { d: 'T', v: 3 }, { d: 'F', v: 2 }, { d: 'S', v: 0 }, { d: 'S', v: 1 },
];

const ACTIVITY = [
  { title: 'Completed: POSH Act 2013 Module',    type: 'success', time: '2h ago',    meta: 'Training' },
  { title: 'Submitted: PAN Card document',       type: 'info',    time: 'Yesterday', meta: 'Documents' },
  { title: 'Acknowledged: MacBook Pro 16"',      type: 'success', time: '2d ago',    meta: 'IT Assets' },
  { title: 'Enrolled in Engineering 90-Day Plan', type: 'info',   time: '3d ago',    meta: 'Onboarding' },
];

const MODULES = [
  { label: 'POSH Compliance',           pct: 68, color: 'var(--chart-blue)' },
  { label: 'Data Protection (DPDP)',    pct: 40, color: 'var(--chart-violet)' },
  { label: 'Engineering Best Practices',pct: 90, color: 'var(--chart-emerald)' },
];

export default function ProfileView() {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="Profile" />

      {/* ── Identity + Progress Hero ── */}
      <Card $hoverable style={{ padding: 'var(--sp-5)' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <RadialProgress value={72} size={110} strokeWidth={10} color="var(--chart-blue)" label="72%" sublabel="Complete" />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Avatar name="Aarav Sharma" size={48} />
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Aarav Sharma</div>
                <div className="meta" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Senior Software Engineer (SDE-II)</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '0.875rem', marginTop: 12 }}>
              {[
                [Building2, 'Platform Engineering'],
                [MapPin,     'Bengaluru (Hybrid)'],
                [Mail,       'aarav.sharma@eoms.in'],
                [Calendar,   'Joined Jan 12, 2026'],
              ].map(([Icon, val]) => (
                <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontWeight: 500 }}>
                  <Icon size={14} />{val}
                </div>
              ))}
            </div>
          </div>
          <div style={{ width: 120, flexShrink: 0 }}>
            <p className="meta" style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>Weekly activity</p>
            <Sparkline data={SPARK_WEEK} dataKey="v" color="var(--chart-blue)" height={48} />
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        {/* ── Training Progress ── */}
        <Card $hoverable style={{ gridColumn: 'span 5', padding: 'var(--sp-5)' }}>
          <h2 className="h3" style={{ marginBottom: 'var(--sp-4)' }}>Training Progress</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {MODULES.map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 'inherit', transition: 'width 700ms var(--ease)' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Activity Timeline ── */}
        <Card $hoverable style={{ gridColumn: 'span 7', padding: 'var(--sp-5)' }}>
          <h2 className="h3" style={{ marginBottom: 'var(--sp-4)' }}>Recent Activity</h2>
          <ActivityTimeline events={ACTIVITY} />
        </Card>
      </div>
    </div>
  );
}
