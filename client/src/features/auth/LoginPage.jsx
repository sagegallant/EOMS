import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Button, Input } from '../../components/common/ui';

export default function LoginPage() {
  const [step, setStep] = useState('credentials'); // credentials | mfa
  const [form, setForm] = useState({ identifier: '', password: '', code: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState(null);
  const setSession = useAuthStore(s => s.setSession);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (step === 'credentials') {
        const { data } = await api.post('/auth/login', form);
        if (data.mfaRequired) {
          setChallenge(data.challenge);
          setStep('mfa');
        } else {
          finish(data);
        }
      } else {
        const { data } = await api.post('/auth/mfa/verify', {
          challenge,
          code: form.code,
        });
        finish(data);
      }
    } catch (err) {
      // For local testing fallback if backend is not started
      if (!err.response) {
        const idStr = (form.identifier || '').toLowerCase();
        const role = idStr.includes('aarav') || idStr.includes('alex') || idStr.includes('sneha') || idStr.includes('arjun') ? 'EMPLOYEE' :
                     idStr.includes('priya') || idStr.includes('sarah') ? 'HR_ADMIN' :
                     idStr.includes('vikram') || idStr.includes('michael') ? 'DEPARTMENT_MANAGER' :
                     idStr.includes('rohan') || idStr.includes('david') ? 'IT_ADMIN' :
                     idStr.includes('neha') ? 'COMPLIANCE_OFFICER' : 'SYSTEM_ADMIN';
        finish({
          token: 'demo-mock-token-jwt',
          user: { id: 1, username: form.identifier || 'admin', roles: [role] }
        });
        return;
      }
      setError(err.response?.data?.message ?? 'Something went wrong. Try again.');
    }
  };

  const finish = d => {
    setSession(d.token, d.user);
    navigate('/dashboard');
  };

  return (
    <div
      className="login-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
        minHeight: '100vh',
        background: 'var(--surface)',
      }}
    >
      {/* ── Brand panel ── */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--sp-5)',
          padding: 'var(--sp-7)',
        }}
        aria-label="EOMS"
      >
        <BrandLogo />
        <h1 className="display" style={{ textAlign: 'center', maxWidth: 420 }}>
          From First Day to
          <br />
          Fully Onboarded.
        </h1>
        <p className="body" style={{ maxWidth: 380, textAlign: 'center', color: 'var(--text-3)' }}>
          One structured platform guiding every new employee from offer acceptance to full productivity.
        </p>
        <OnboardingMark /> {/* abstract SVG: nodes → progress arc → document */}
        <p className="meta">🔒 Secured with encrypted sessions &amp; audited access</p>
      </section>

      {/* ── Form panel ── */}
      <section style={{ display: 'grid', placeItems: 'center', padding: 'var(--sp-5)' }}>
        <form
          onSubmit={submit}
          style={{
            width: 'min(400px, 100%)',
            background: 'var(--surface)',
            borderRadius: 'var(--r-lg)',
            boxShadow: 'var(--neo-lg)',
            padding: 'var(--sp-6)',
            display: 'grid',
            gap: 'var(--sp-4)',
          }}
          aria-labelledby="login-heading"
        >
          <div>
            <h2 id="login-heading" className="h1">
              {step === 'credentials' ? 'Welcome back' : 'Two-factor verification'}
            </h2>
            <p className="caption" style={{ color: 'var(--text-3)', marginTop: 4 }}>
              {step === 'credentials'
                ? 'Sign in to your EOMS workspace.'
                : 'Enter the 6-digit code from your authenticator app.'}
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="caption"
              style={{
                color: 'var(--danger)',
                background: 'var(--danger-bg)',
                padding: '10px 14px',
                borderRadius: 'var(--r-sm)',
              }}
            >
              ⚠ {error}
            </p>
          )}

          {step === 'credentials' ? (
            <>
              <label style={lbl}>
                Email or username
                <Input
                  required
                  autoComplete="username"
                  value={form.identifier}
                  placeholder="e.g. alex.johnson or admin"
                  onChange={e => setForm({ ...form, identifier: e.target.value })}
                />
              </label>
              <label style={lbl}>
                Password
                <span style={{ position: 'relative', display: 'block' }}>
                  <Input
                    required
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    placeholder="••••••••••••"
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 10,
                      color: 'var(--text-3)',
                      fontSize: '.8125rem',
                    }}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </span>
              </label>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '.8125rem',
                }}
              >
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--text-2)' }}>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#forgot">Forgot password?</a>
              </div>
              <Button type="submit" style={{ width: '100%' }}>
                Sign In
              </Button>
            </>
          ) : (
            <>
              <label style={lbl}>
                Verification code
                <Input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="••••••"
                  value={form.code}
                  style={{
                    letterSpacing: '.4em',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                  }}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                />
              </label>
              <Button type="submit" style={{ width: '100%' }}>
                Verify &amp; Continue
              </Button>
              <button
                type="button"
                className="caption"
                onClick={() => setStep('credentials')}
                style={{ color: 'var(--text-3)' }}
              >
                ← Back to sign in
              </button>
            </>
          )}

          <div className="meta" style={{ textAlign: 'center', marginTop: 'var(--sp-2)' }}>
            🔐 Protected by Enterprise MFA &amp; Full Audit Trail
            <div style={{ marginTop: 8, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Demo Quick-Fill:
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginTop: 6 }}>
                {[
                  { name: 'Priya (HR)', id: 'priya.patel' },
                  { name: 'Aarav (SDE)', id: 'aarav.sharma' },
                  { name: 'Vikram (Mgr)', id: 'vikram.malhotra' },
                  { name: 'Rohan (IT)', id: 'rohan.verma' },
                  { name: 'Admin', id: 'admin' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setForm({ identifier: p.id, password: 'Password@123', code: '123456' })}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--r-xs)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 4, color: 'var(--text-muted)' }}>Password: <strong>Password@123</strong></div>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

const lbl = { display: 'grid', gap: 6, fontSize: '.875rem', fontWeight: 600, color: 'var(--text-1)' };

/* Minimal abstract mark: person → doc → progress */
function OnboardingMark() {
  return (
    <svg
      width="240"
      height="120"
      viewBox="0 0 240 120"
      role="img"
      aria-label="Abstract illustration of onboarding progress"
    >
      <circle cx="40" cy="60" r="26" fill="var(--surface)" stroke="var(--text-3)" strokeDasharray="3 4" />
      <circle cx="40" cy="52" r="7" fill="var(--primary)" />
      <path d="M28 74c3-8 21-8 24 0" fill="var(--primary)" />
      <rect
        x="100"
        y="34"
        width="52"
        height="64"
        rx="8"
        fill="var(--surface)"
        stroke="var(--text-3)"
        strokeDasharray="3 4"
      />
      <line x1="110" y1="52" x2="142" y2="52" stroke="var(--text-3)" strokeWidth="3" strokeLinecap="round" />
      <line x1="110" y1="64" x2="134" y2="64" stroke="var(--text-3)" strokeWidth="3" strokeLinecap="round" />
      <line x1="110" y1="76" x2="138" y2="76" stroke="var(--text-3)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="196" cy="60" r="30" fill="none" stroke="var(--surface-sunken)" strokeWidth="9" />
      <circle
        cx="196"
        cy="60"
        r="30"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray="145 188"
        transform="rotate(-90 196 60)"
      />
      <text x="196" y="66" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text-1)">
        72%
      </text>
    </svg>
  );
}

function BrandLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span
        aria-hidden="true"
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: 'var(--surface)',
          boxShadow: 'var(--neo-md)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--primary)',
          fontWeight: 800,
          fontSize: 18,
        }}
      >
        E
      </span>
      <span style={{ fontWeight: 750, fontSize: '1.15rem', color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
        EOMS
      </span>
    </div>
  );
}
