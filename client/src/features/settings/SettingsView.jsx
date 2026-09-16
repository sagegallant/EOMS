/**
 * SettingsView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Settings grid with DarkTaskCard + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { Save, Bell, Shield, Database, Clock, KeyRound, Globe, Server } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const SECTIONS = [
  {
    title: 'Notifications & Alerts',
    icon: Bell,
    settings: [
      { id: 'email_notif', label: 'Corporate Email Alerts', desc: 'Dispatch transactional onboarding emails via SendGrid', type: 'toggle', value: true },
      { id: 'task_remind', label: 'Statutory 24h Reminders', desc: 'Slack + Email alert 24h prior to task expiration', type: 'toggle', value: true },
      { id: 'weekly_digest', label: 'Executive Weekly Recap', desc: 'Summary report every Monday 8:00 AM IST', type: 'toggle', value: false },
    ],
  },
  {
    title: 'Security & Access Governance',
    icon: Shield,
    settings: [
      { id: 'mfa_required', label: 'FIDO2 / YubiKey Hardware MFA', desc: 'Enforce WebAuthn hardware keys for all privileged roles', type: 'toggle', value: true },
      { id: 'session_timeout', label: 'Inactivity Session Timeout', desc: 'Auto-logout idle sessions per ISO 27001 guidelines', type: 'select', value: '30 minutes', options: ['15 minutes', '30 minutes', '1 hour', '4 hours'] },
    ],
  },
  {
    title: 'Data Privacy & DPDP Retention',
    icon: Database,
    settings: [
      { id: 'data_retention', label: 'Audit Log Vault Retention', desc: 'Cryptographic immutable retention period', type: 'select', value: '7 years (DPDP Act)', options: ['90 days', '1 year', '7 years (DPDP Act)'] },
      { id: 'auto_archive', label: 'Auto-Archive Completed Cohorts', desc: 'Move 90-day graduated profiles to archival storage', type: 'toggle', value: true },
    ],
  },
  {
    title: 'Onboarding SLA Benchmarks',
    icon: Clock,
    settings: [
      { id: 'sla_target', label: 'Full Journey Target SLA', desc: 'Standard turnaround for engineering readiness', type: 'select', value: '45 days', options: ['30 days', '45 days', '60 days', '90 days'] },
      { id: 'sla_alert', label: 'Escalation Alert Threshold', desc: 'Trigger manager notification at SLA percentage', type: 'select', value: '80%', options: ['60%', '70%', '80%', '90%'] },
    ],
  },
];

const SECURITY_POSTURE = [
  { title: 'Hardware MFA Enforced (FIDO2)', date: '100% Active', done: true },
  { title: 'DPDP 2023 Consent Logs Enabled', date: 'Compliant', done: true },
  { title: 'TLS 1.3 & HSTS Preload Enabled', date: 'Enforced', done: true },
  { title: 'Automated Daily Database Backups', date: 'Healthy', done: true },
];

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 'var(--r-full)',
        background: value ? 'var(--primary)' : 'var(--bg-sunken)',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: value ? 'calc(100% - 19px)' : 3,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

export default function SettingsView() {
  const [settings, setSettings] = useState(
    Object.fromEntries(SECTIONS.flatMap(s => s.settings).map(s => [s.id, s.value]))
  );
  const [saved, setSaved] = useState(false);
  const rowRef = useScrollReveal({ delay: 0.05 });

  const updateSetting = (id, val) => setSettings(prev => ({ ...prev, [id]: val }));
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="System Settings & Preferences"
        subtitle="Configure organization parameters, statutory retention rules, and enterprise authentication."
        action={
          <Button size="sm" icon={Save} onClick={handleSave} variant={saved ? 'secondary' : 'primary'}>
            {saved ? '✓ Changes Saved' : 'Save Changes'}
          </Button>
        }
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Security Hardening" value={100} delay={0.0} />
        <MetricPillBar label="Audit Retention"    value={100} delay={0.1} />
        <MetricPillBar label="Hardware MFA"       value={100} delay={0.2} />
        <MetricPillBar label="Target SLA Window"  value={45} delay={0.3} color="amber" />
      </div>

      {/* ── Main Settings Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          {SECTIONS.map(section => {
            const Icon = section.icon;
            return (
              <Card key={section.title} style={{ padding: 'var(--sp-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 'var(--r-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                    <Icon size={16} />
                  </div>
                  <h3 className="h3">{section.title}</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {section.settings.map((s, i) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        padding: '12px 0',
                        borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.label}</div>
                        <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
                      </div>
                      {s.type === 'toggle' ? (
                        <Toggle value={settings[s.id]} onChange={v => updateSetting(s.id, v)} />
                      ) : (
                        <select
                          value={settings[s.id]}
                          onChange={e => updateSetting(s.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8125rem',
                            borderRadius: 'var(--r-md)',
                            border: '1px solid var(--border-subtle)',
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                          }}
                        >
                          {s.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
        <DarkTaskCard title="Security Posture Checks" tasks={SECURITY_POSTURE} />
      </div>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Identity Provider (IdP) & SSO Federation Details" icon={KeyRound}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { idp: 'Google Workspace SAML 2.0', status: 'Primary IdP', desc: 'Federated single sign-on bound to @company.in organization domain.' },
              { idp: 'Okta Adaptive MFA', status: 'Enforced', desc: 'Step-up authentication required for AWS IAM and production cluster access.' },
              { idp: 'SCIM User Provisioning API', status: 'Active', desc: 'Auto-deprovisioning triggered immediately when HR status transitions to terminated.' },
            ].map((idp, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{idp.idp}</span>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--primary)' }}>{idp.status}</span>
                </div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{idp.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Indian Data Privacy (DPDP Act 2023) Compliance Parameters" icon={Globe}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { rule: 'Data Localization', spec: 'AWS ap-south-1 (Mumbai)', desc: 'All statutory records and PII remain within Indian borders.' },
              { rule: 'Consent Notice Manager', spec: 'Multi-lingual Available', desc: 'Explicit purpose codes recorded for Aadhaar and EPFO data.' },
              { rule: 'Data Protection Officer (DPO)', spec: 'dpo@eoms.in', desc: 'Registered officer point of contact for employee privacy queries.' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{p.rule}</div>
                <div className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.spec}</div>
                <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>
    </div>
  );
}
