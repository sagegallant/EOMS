/**
 * AuditView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Event Trail + Collapsibles
 */
import { useState } from 'react';
import { Card, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { TrendChart, ActivityTimeline } from '../../components/common/charts';
import { Shield, ShieldCheck, Lock, Key, FileCheck, Terminal } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const AUDIT_EVENTS = [
  { title: 'Statutory document verified', description: 'Priya Patel verified PAN Card for Aarav Sharma against NSDL database.', type: 'success', time: '10:32 AM', meta: 'Compliance' },
  { title: 'Hardware asset allocation locked', description: 'Karthik Subramanian updated MacBook Pro serial BLR-MBP-2026-108 in Jamf MDM.', type: 'info', time: '09:15 AM', meta: 'IT Provisioning' },
  { title: 'IdP Authentication — priya.patel@eoms.in', description: 'WebAuthn YubiKey MFA success from Bengaluru Bellandur Hub (10.2.4.88).', type: 'neutral', time: 'Yesterday 08:01 AM', meta: 'Identity' },
  { title: 'RBAC Permission elevation', description: 'neha.nair assigned COMPLIANCE_OFFICER role by system admin.', type: 'warning', time: '2d ago 04:22 PM', meta: 'RBAC' },
  { title: 'Candidate onboarding plan activated', description: 'Kabir Mehta enrolled into Platform Engineering 90-Day track.', type: 'success', time: '2d ago 11:00 AM', meta: 'Onboarding' },
  { title: 'Document verification returned', description: 'Priya Patel flagged Cancelled Cheque from Pooja Desai (Account name mismatch).', type: 'danger', time: '3d ago 02:41 PM', meta: 'Compliance' },
  { title: 'Mandatory POSH training certified', description: 'Arjun Rao scored 98% in POSH Act 2013 Sensitization Assessment.', type: 'success', time: '3d ago 03:15 PM', meta: 'Training' },
  { title: 'Global security policy refreshed', description: 'System Administrator enabled 90-day automated log retention under DPDP Act.', type: 'neutral', time: '4d ago 01:10 PM', meta: 'Policy' },
];

const ACTIVITY_TREND = [
  { date: 'Mon', events: 12 },
  { date: 'Tue', events: 18 },
  { date: 'Wed', events: 14 },
  { date: 'Thu', events: 22 },
  { date: 'Fri', events: 19 },
  { date: 'Sat', events: 6 },
  { date: 'Sun', events: 3 },
];

const SECURITY_CHECKS = [
  { title: 'SOC 2 Type II Telemetry Integrity', date: 'Verified 100%', done: true },
  { title: 'DPDP 2023 Consent Logs Signed', date: 'Active', done: true },
  { title: 'Weekly Access Key Rotation', date: 'Next: Sep 20', done: false },
  { title: 'Penetration Testing Review', date: 'Scheduled Sep 28', done: false },
];

export default function AuditView() {
  const rowRef = useScrollReveal({ delay: 0.05 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Security & Compliance Audit Trail"
        subtitle="Cryptographically verifiable event log for DPDP Act 2023, ISO 27001, and SOC 2 Type II compliance."
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Log Integrity (HMAC)" value={100} delay={0.0} />
        <MetricPillBar label="SOC 2 Compliance"     value={100} delay={0.1} />
        <MetricPillBar label="RBAC Health Score"    value={98} delay={0.2} />
        <MetricPillBar label="Anomalies Flagged"   value={0} delay={0.3} />
      </div>

      {/* ── Visual Section: TrendChart + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 className="h3">Security Telemetry (7-Day Trend)</h3>
              <p className="caption" style={{ color: 'var(--text-muted)' }}>Automated compliance verification events</p>
            </div>
            <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>94 Total Events</span>
          </div>
          <TrendChart
            data={ACTIVITY_TREND}
            xKey="date"
            series={[{ dataKey: 'events', name: 'Security Events', color: 'var(--chart-green)' }]}
            height={160}
            showLegend={false}
          />
        </Card>
        <DarkTaskCard title="Security & Access Telemetry" tasks={SECURITY_CHECKS} />
      </div>

      {/* ── Event Trail Card ── */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 className="h3">Event Trail</h3>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>Real-time immutable audit feed</span>
        </div>
        <ActivityTimeline events={AUDIT_EVENTS} maxVisible={20} />
      </Card>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="DPDP Act 2023 & ISO 27001 Audit Specifications" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { standard: 'Data Fiduciary Logging (DPDP Act)', spec: 'Section 8 Compliance', desc: 'All personal employee records modifications logged with timestamp, principal ID, and purpose code.' },
              { standard: 'SOC 2 Type II Common Criteria', spec: 'CC6.1 & CC7.2', desc: 'Logical access logging with automated SIEM synchronization to AWS CloudWatch & OpenSearch.' },
              { standard: 'Log Immutability & Encryption', spec: 'WORM (Write Once Read Many)', desc: 'SHA-256 hash chains sealed in AWS S3 Glacier Vault with Object Lock retention for 7 years.' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{s.standard}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{s.spec}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Incident Response & CERT-In Mandatory Reporting" icon={Lock}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { phase: 'T+0 to T+15m: Automated Isolation', action: 'Session token invalidated across all active instances and VPN suspended.' },
              { phase: 'T+15m to T+2h: Forensics & Triage', action: 'Memory snapshot and endpoint telemetry preserved for forensic inspection.' },
              { phase: 'T+2h to T+6h: CERT-In Notification', action: 'Formal incident report filed under Ministry of Electronics and IT guidelines.' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{p.phase}</div>
                <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{p.action}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>
    </div>
  );
}
