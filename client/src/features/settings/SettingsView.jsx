import { useState } from 'react';
import { Card, Button, Input, Select, Label, Badge } from '../../components/common/ui';
import { Settings, Save, CheckCircle2, Shield, Bell, Building } from 'lucide-react';

export default function SettingsView() {
  const [settings, setSettings] = useState({
    companyName: 'EOMS Technologies India Private Limited',
    primaryHub: 'Bengaluru (Bellandur Tech Corridor), Karnataka',
    slaDays: '45',
    supportEmail: 'peopleops@eoms.in',
    poshEmail: 'icc.complaints@eoms.in',
    mfaEnforced: true,
    emailNotifications: true,
    autoProvisioning: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)', maxWidth: 840 }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="display">System Settings &amp; Configuration</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Platform-wide governance, SLA targets, and Indian statutory compliance rules.
          </p>
        </div>
        {saved && (
          <Badge tone="success" icon={CheckCircle2}>
            Settings saved successfully!
          </Badge>
        )}
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--sp-5)' }}>
        {/* ── Organization Profile ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Building size={20} style={{ color: 'var(--primary)' }} />
            <h2 className="h2">Corporate Organization Profile</h2>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <Label>Registered Legal Entity Name (India)</Label>
              <Input
                value={settings.companyName}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
            <div>
              <Label>Primary Tech Hub &amp; Operations Center</Label>
              <Input
                value={settings.primaryHub}
                onChange={e => setSettings({ ...settings, primaryHub: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <Label>People Operations (HR) Mailbox</Label>
                <Input
                  value={settings.supportEmail}
                  onChange={e => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>
              <div>
                <Label>Statutory POSH ICC Committee Email</Label>
                <Input
                  value={settings.poshEmail}
                  onChange={e => setSettings({ ...settings, poshEmail: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* ── Onboarding SLA Rules ── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Shield size={20} style={{ color: 'var(--primary)' }} />
            <h2 className="h2">Onboarding SLA &amp; Compliance Policies</h2>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <Label>Target Days to 100% Contributor Ramp-Up</Label>
              <Input
                type="number"
                value={settings.slaDays}
                onChange={e => setSettings({ ...settings, slaDays: e.target.value })}
              />
              <div className="meta" style={{ marginTop: 4 }}>Standard recommended Indian tech SLA is 45 calendar days.</div>
            </div>

            <div style={{ display: 'grid', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.mfaEnforced}
                  onChange={e => setSettings({ ...settings, mfaEnforced: e.target.checked })}
                  style={{ width: 17, height: 17, accentColor: 'var(--primary)' }}
                />
                Enforce Hardware Security Keys / 2FA for all new employee logins
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  style={{ width: 17, height: 17, accentColor: 'var(--primary)' }}
                />
                Dispatch automatic email reminders 3 days before milestone sign-offs
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.autoProvisioning}
                  onChange={e => setSettings({ ...settings, autoProvisioning: e.target.checked })}
                  style={{ width: 17, height: 17, accentColor: 'var(--primary)' }}
                />
                Automatically queue IT asset tickets upon candidate offer acceptance
              </label>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" icon={Save} size="lg">
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
