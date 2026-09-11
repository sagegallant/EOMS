import { useState } from 'react';
import { Card, Button, Input, Label, Select, PageHeader } from '../../components/common/ui';
import { Save, Bell, Shield, Database, Clock } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Notifications',
    icon: Bell,
    settings: [
      { id: 'email_notif', label: 'Email Notifications', desc: 'Receive onboarding updates via email', type: 'toggle', value: true },
      { id: 'task_remind', label: 'Task Reminders',       desc: 'Get reminded about pending tasks 24h before due date', type: 'toggle', value: true },
      { id: 'weekly_digest', label: 'Weekly Digest',      desc: 'Receive a weekly summary every Monday morning', type: 'toggle', value: false },
    ],
  },
  {
    title: 'Security & Compliance',
    icon: Shield,
    settings: [
      { id: 'mfa_required', label: 'Require MFA',         desc: 'Enforce two-factor authentication for all users', type: 'toggle', value: true },
      { id: 'session_timeout', label: 'Session Timeout',  desc: 'Auto-logout idle users', type: 'select', value: '30 minutes', options: ['15 minutes', '30 minutes', '1 hour', '4 hours'] },
    ],
  },
  {
    title: 'Data & Retention',
    icon: Database,
    settings: [
      { id: 'data_retention', label: 'Audit Log Retention', desc: 'How long to keep audit events', type: 'select', value: '90 days', options: ['30 days', '60 days', '90 days', '1 year'] },
      { id: 'auto_archive',   label: 'Auto-Archive Completed Plans', desc: 'Archive onboarding plans after 90-day milestone', type: 'toggle', value: true },
    ],
  },
  {
    title: 'SLA Configuration',
    icon: Clock,
    settings: [
      { id: 'sla_target', label: 'Onboarding SLA Target', desc: 'Target completion time for full onboarding', type: 'select', value: '45 days', options: ['30 days', '45 days', '60 days', '90 days'] },
      { id: 'sla_alert',  label: 'SLA Alert Threshold',    desc: 'Alert when employees exceed this % of SLA time', type: 'select', value: '80%', options: ['60%', '70%', '80%', '90%'] },
    ],
  },
];

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 36, height: 20, borderRadius: 'var(--r-full)',
        background: value ? 'var(--primary)' : 'var(--bg-sunken)',
        position: 'relative', border: 'none', cursor: 'pointer',
        flexShrink: 0, transition: 'background var(--t-normal)',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 'calc(100% - 17px)' : 3,
        width: 14, height: 14, borderRadius: '50%', background: '#fff',
        transition: 'left var(--t-normal) var(--ease)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      }} />
    </button>
  );
}

export default function SettingsView() {
  const [settings, setSettings] = useState(
    Object.fromEntries(SECTIONS.flatMap(s => s.settings).map(s => [s.id, s.value]))
  );
  const [saved, setSaved] = useState(false);

  const updateSetting = (id, val) => setSettings(prev => ({ ...prev, [id]: val }));
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)', maxWidth: 640 }}>
      <PageHeader
        title="Settings"
        subtitle="Configure EOMS behaviour, security, and compliance preferences."
        action={
          <Button size="sm" icon={Save} onClick={handleSave} variant={saved ? 'secondary' : 'primary'}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </Button>
        }
      />

      {SECTIONS.map(section => {
        const Icon = section.icon;
        return (
          <Card key={section.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                <Icon size={14} />
              </div>
              <h2 className="h3">{section.title}</h2>
            </div>
            <div style={{ display: 'grid', gap: 0 }}>
              {section.settings.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{s.label}</div>
                    <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
                  </div>
                  {s.type === 'toggle' ? (
                    <Toggle value={settings[s.id]} onChange={val => updateSetting(s.id, val)} />
                  ) : s.type === 'select' ? (
                    <select value={settings[s.id]} onChange={e => updateSetting(s.id, e.target.value)}
                      style={{ padding: '5px 10px', fontSize: '0.8125rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', flexShrink: 0 }}>
                      {s.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={settings[s.id]} onChange={e => updateSetting(s.id, e.target.value)}
                      style={{ padding: '5px 10px', fontSize: '0.8125rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', width: 140, outline: 'none' }} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
