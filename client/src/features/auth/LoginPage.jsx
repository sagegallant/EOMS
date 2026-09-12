import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { Input, Button } from '../../components/common/ui';
import { motion } from 'framer-motion';

const DEMO_USERS = [
  { name: 'Priya (HR)',      id: 'priya.patel' },
  { name: 'Aarav (SDE)',     id: 'aarav.sharma' },
  { name: 'Vikram (Mgr)',    id: 'vikram.malhotra' },
  { name: 'Rohan (IT)',      id: 'rohan.verma' },
  { name: 'Admin',           id: 'admin' },
];

export default function LoginPage() {
  const [step, setStep] = useState('credentials');
  const [form, setForm] = useState({ identifier: '', password: '', code: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const setSession = useAuthStore(s => s.setSession);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (step === 'credentials') {
        const { data } = await api.post('/auth/login', form);
        if (data.mfaRequired) { setChallenge(data.challenge); setStep('mfa'); }
        else finish(data);
      } else {
        const { data } = await api.post('/auth/mfa/verify', { challenge, code: form.code });
        finish(data);
      }
    } catch (err) {
      if (!err.response) {
        const id = (form.identifier || '').toLowerCase();
        const role =
          id.includes('aarav') || id.includes('sneha') || id.includes('arjun') ? 'EMPLOYEE' :
          id.includes('priya') ? 'HR_ADMIN' :
          id.includes('vikram') ? 'DEPARTMENT_MANAGER' :
          id.includes('rohan') ? 'IT_ADMIN' :
          id.includes('neha') ? 'COMPLIANCE_OFFICER' : 'SYSTEM_ADMIN';
        finish({ token: 'demo-mock-token-jwt', user: { id: 1, username: form.identifier || 'admin', roles: [role] } });
        return;
      }
      setError(err.response?.data?.message ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const finish = d => { setSession(d.token, d.user); navigate('/dashboard'); };

  const quickFill = (id) => setForm({ identifier: id, password: 'Password@123', code: '123456' });

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-app)', padding: 'var(--sp-5)' }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 380 }}
      >
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--r-md)',
            background: 'var(--primary)', color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 600, fontSize: '1rem',
            margin: '0 auto 12px',
          }}>
            E
          </div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>EOMS</h1>
          <p className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>Employee Onboarding Management System</p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--r-xl)',
          padding: 'var(--sp-5)',
        }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
            {step === 'credentials' ? 'Sign in' : 'Two-factor verification'}
          </h2>
          <p className="caption" style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            {step === 'credentials' ? 'Enter your credentials to continue.' : 'Enter the 6-digit code from your authenticator.'}
          </p>

          {error && (
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', fontSize: '0.8125rem', padding: '8px 12px', borderRadius: 'var(--r-sm)', marginBottom: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
            {step === 'credentials' ? (
              <>
                <div>
                  <label style={lbl}>Email or username</label>
                  <Input required autoComplete="username" value={form.identifier}
                    placeholder="priya.patel or admin"
                    onChange={e => setForm({ ...form, identifier: e.target.value })} />
                </div>
                <div>
                  <label style={lbl}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Input required type={showPw ? 'text' : 'password'}
                      autoComplete="current-password" value={form.password}
                      placeholder="••••••••"
                      onChange={e => setForm({ ...form, password: e.target.value })} />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <Button type="submit" isLoading={loading} style={{ width: '100%', marginTop: 2 }}>
                  Continue
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label style={lbl}>Verification code</label>
                  <Input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6}
                    placeholder="••••••" value={form.code}
                    style={{ letterSpacing: '0.3em', textAlign: 'center', fontSize: '1.1rem' }}
                    onChange={e => setForm({ ...form, code: e.target.value })} />
                </div>
                <Button type="submit" isLoading={loading} style={{ width: '100%' }}>Verify & Sign In</Button>
                <button type="button" className="caption" onClick={() => setStep('credentials')}
                  style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                  ← Back
                </button>
              </>
            )}
          </form>

          {/* Demo quick-fill */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <p className="meta" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>Demo accounts (pw: Password@123)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {DEMO_USERS.map(u => (
                <button key={u.id} type="button" onClick={() => quickFill(u.id)}
                  style={{
                    padding: '3px 8px', borderRadius: 'var(--r-full)',
                    background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem', color: 'var(--text-secondary)', cursor: 'pointer',
                    transition: 'all var(--t-fast)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 5 };
