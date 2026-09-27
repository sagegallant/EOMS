import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, PageHeader, Toggle, Input } from '../../components/common/ui';
import { Save, Bell, Shield, Database, Clock, Key, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { settingApi } from '../../api/settings';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function SettingsView() {
  const { user, setUser } = useAuthStore();
  const [dbSettings, setDbSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // MFA Setup Modal state
  const [mfaModalOpen, setMfaModalOpen] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState(null);

  // MFA Disable Modal state
  const [mfaDisableModalOpen, setMfaDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await settingApi.list();
      const settingsMap = {};
      (res.data || []).forEach((s) => {
        settingsMap[s.settingKey] = s.settingValue;
      });
      setDbSettings(settingsMap);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleUpdate = async (key, value) => {
    try {
      setSavingKey(key);
      await settingApi.update(key, String(value));
      setDbSettings((prev) => ({ ...prev, [key]: String(value) }));
      setStatusMsg(`Setting "${key}" updated.`);
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error('Failed to update setting:', err);
      alert('Failed to update system setting.');
    } finally {
      setSavingKey(null);
    }
  };

  const handleStartMfaSetup = async () => {
    try {
      setMfaLoading(true);
      setMfaError(null);
      const data = await authApi.setupMfa();
      setMfaSetupData(data);
      setMfaModalOpen(true);
    } catch (err) {
      console.error('Failed to initiate MFA setup:', err);
      alert('Failed to initialize MFA setup.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleConfirmMfa = async (e) => {
    e.preventDefault();
    if (!mfaCode) {
      setMfaError('Please enter the 6-digit code from your authenticator app.');
      return;
    }

    try {
      setMfaLoading(true);
      setMfaError(null);
      await authApi.enableMfa(mfaSetupData.setupToken, mfaCode);
      setMfaModalOpen(false);
      setMfaSetupData(null);
      setMfaCode('');
      // update store
      if (user) {
        setUser({ ...user, mfaEnabled: true }, localStorage.getItem('token'));
      }
      alert('Two-factor authentication (TOTP) successfully enabled!');
    } catch (err) {
      console.error('MFA activation error:', err);
      setMfaError(err?.response?.data?.message || 'Invalid verification code. Please check your authenticator clock.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError('Please enter your current account password.');
      return;
    }

    try {
      setDisableLoading(true);
      setDisableError(null);
      await authApi.disableMfa(disablePassword);
      setMfaDisableModalOpen(false);
      setDisablePassword('');
      if (user) {
        setUser({ ...user, mfaEnabled: false }, localStorage.getItem('token'));
      }
      alert('Two-factor authentication disabled.');
    } catch (err) {
      console.error('Failed to disable MFA:', err);
      setDisableError(err?.response?.data?.message || 'Password incorrect.');
    } finally {
      setDisableLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)', maxWidth: 680 }}>
      <PageHeader
        title="Settings & Security"
        subtitle="Manage system parameters, authentication security, and compliance preferences."
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadSettings} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {statusMsg && (
        <Card $p="var(--sp-4)" style={{ borderColor: 'var(--sage-400)', background: 'var(--sage-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sage-900)', fontSize: '0.875rem' }}>
            <CheckCircle2 size={16} />
            <span>{statusMsg}</span>
          </div>
        </Card>
      )}

      {/* Two-Factor Authentication Security Card */}
      <Card $p="var(--sp-5)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--sage-100)', color: 'var(--sage-800)', display: 'grid', placeItems: 'center' }}>
            <Key size={16} />
          </div>
          <div>
            <h2 className="section-title">Two-Factor Authentication (TOTP)</h2>
            <p className="caption" style={{ marginTop: 2 }}>Secure your account using standard TOTP apps (Google Authenticator, Authy, 1Password).</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Authenticator App Status</div>
            <div className="meta" style={{ marginTop: 2 }}>
              {user?.mfaEnabled
                ? 'Active — password and 6-digit TOTP required at sign-in.'
                : 'Inactive — currently protected by single password authentication.'}
            </div>
          </div>
          <div>
            {user?.mfaEnabled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge tone="sage">ACTIVE</Badge>
                <Button size="xs" variant="dangerSoft" onClick={() => setMfaDisableModalOpen(true)}>
                  Disable MFA
                </Button>
              </div>
            ) : (
              <Button size="xs" variant="soft" icon={Smartphone} isLoading={mfaLoading} onClick={handleStartMfaSetup}>
                Enable MFA
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Compliance & SLA Policies */}
      <Card $p="var(--sp-5)">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--r-md)', background: 'var(--sage-100)', color: 'var(--sage-800)', display: 'grid', placeItems: 'center' }}>
            <Clock size={16} />
          </div>
          <h2 className="section-title">Onboarding SLA & Compliance Targets</h2>
        </div>

        <div style={{ display: 'grid', gap: 14, borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Target Onboarding SLA</div>
              <div className="meta">Default target period assigned to newly generated onboarding plans.</div>
            </div>
            <select
              value={dbSettings['sla_target_days'] || '30'}
              onChange={(e) => handleUpdate('sla_target_days', e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', fontSize: '0.8125rem' }}
            >
              <option value="30">30 Days (Standard)</option>
              <option value="45">45 Days (Extended)</option>
              <option value="60">60 Days (Comprehensive)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Mandatory Quiz Pass Threshold</div>
              <div className="meta">Minimum passing percentage required on POSH and compliance assessments.</div>
            </div>
            <select
              value={dbSettings['quiz_pass_threshold'] || '80'}
              onChange={(e) => handleUpdate('quiz_pass_threshold', e.target.value)}
              style={{ padding: '6px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)', fontSize: '0.8125rem' }}
            >
              <option value="75">75%</option>
              <option value="80">80% (Statutory Standard)</option>
              <option value="90">90% (Strict)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* MFA Setup Modal */}
      <Modal
        isOpen={mfaModalOpen}
        onClose={() => setMfaModalOpen(false)}
        title="Setup Authenticator App"
        description="Scan the QR code with your authenticator app (Google Authenticator, Authy, or 1Password)."
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setMfaModalOpen(false)}>
              Cancel
            </Button>
            <Button icon={CheckCircle2} isLoading={mfaLoading} onClick={handleConfirmMfa}>
              Verify & Activate
            </Button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 16 }}>
          {mfaError && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>
              {mfaError}
            </div>
          )}

          {mfaSetupData?.qrCode && (
            <div style={{ display: 'grid', placeItems: 'center', padding: 12, background: '#fff', borderRadius: 'var(--r-md)', border: '1px solid var(--border-default)' }}>
              <img src={mfaSetupData.qrCode} alt="TOTP QR Code" style={{ width: 180, height: 180 }} />
              <div className="caption" style={{ marginTop: 8, fontFamily: 'monospace' }}>
                Key: {mfaSetupData.manualSecret}
              </div>
            </div>
          )}

          {mfaSetupData?.backupCodes && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: 6 }}>
                Recovery Backup Codes (Save these securely):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, background: 'var(--bg-subtle)', padding: 10, borderRadius: 'var(--r-md)', fontFamily: 'monospace', fontSize: '0.75rem', textAlign: 'center' }}>
                {mfaSetupData.backupCodes.map((code) => (
                  <div key={code}>{code}</div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Enter 6-Digit Code from App *</label>
            <input
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 123456"
              style={{
                padding: '9px 13px',
                borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--border-default)',
                fontSize: '1.1rem',
                letterSpacing: '0.2em',
                textAlign: 'center',
                fontWeight: 700,
              }}
            />
          </div>
        </div>
      </Modal>

      {/* MFA Disable Modal */}
      <Modal
        isOpen={mfaDisableModalOpen}
        onClose={() => setMfaDisableModalOpen(false)}
        title="Disable Two-Factor Authentication"
        description="Enter your account password to confirm disabling TOTP security."
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setMfaDisableModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" isLoading={disableLoading} onClick={handleDisableMfa}>
              Disable MFA
            </Button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          {disableError && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>
              {disableError}
            </div>
          )}

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Account Password *</label>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              placeholder="Confirm password"
              style={{ padding: '9px 13px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border-default)' }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
