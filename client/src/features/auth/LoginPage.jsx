/**
 * LoginPage.jsx — EOMS v2.1
 * Sage green background, centered white card, Crextio-style pill demo buttons
 * Instant 1-click demo login & secure credential validation
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck } from 'lucide-react';

const DEMO_USERS = [
  { label: 'Priya (HR)',    username: 'priya.patel',     role: 'HR Admin' },
  { label: 'Aarav (SDE)',   username: 'aarav.sharma',    role: 'Employee' },
  { label: 'Vikram (Mgr)',  username: 'vikram.malhotra', role: 'Manager' },
  { label: 'Rohan (IT)',    username: 'rohan.verma',     role: 'IT Admin' },
  { label: 'Admin',        username: 'admin',           role: 'System Admin' },
];

const PILL_COLORS = [
  { bg: '#DCFCE7', color: '#14532D' },
  { bg: '#DBEAFE', color: '#1E3A8A' },
  { bg: '#FEF3C7', color: '#78350F' },
  { bg: '#FCE7F3', color: '#831843' },
  { bg: '#EDE9FE', color: '#4C1D95' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('priya.patel');
  const [password, setPassword] = useState('Password@123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const cardRef   = useRef(null);
  const navigate  = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.1 }
    );
  }, []);

  const performLogin = async (uname, pass) => {
    setError('');
    setLoading(true);
    try {
      await login({
        username: uname.trim(),
        password: pass || 'Password@123',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid credentials. Password for demo accounts is Password@123');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username or select a demo account.');
      return;
    }
    performLogin(username, password);
  };

  const handleDemoClick = (u) => {
    setUsername(u.username);
    setPassword('Password@123');
    performLogin(u.username, 'Password@123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Decorative ambient blooms */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 360, height: 360, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-8%', left: '-4%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(22,163,74,0.08)', pointerEvents: 'none' }} />

      {/* Card */}
      <div ref={cardRef} style={{
        background: 'var(--bg-surface)',
        borderRadius: 20,
        boxShadow: '0 4px 32px rgba(22,163,74,0.10), 0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid var(--border-green)',
        padding: '36px 32px',
        width: '100%',
        maxWidth: 420,
        zIndex: 1,
      }}>
        {/* Logo & Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #16A34A, #4ADE80)', display: 'grid', placeItems: 'center', boxShadow: '0 4px 14px rgba(22,163,74,0.35)', marginBottom: 12 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>E</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: '1.375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>EOMS</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2, textAlign: 'center' }}>
            Employee Onboarding Management System
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-green)', marginBottom: 20 }} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
              Username or Email
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. priya.patel or aarav.sharma"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font)',
                borderRadius: 10,
                border: '1.5px solid var(--border-default)',
                background: 'var(--bg-sunken)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password@123"
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font)',
                borderRadius: 10,
                border: '1.5px solid var(--border-default)',
                background: 'var(--bg-sunken)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
            />
          </div>

          {error && (
            <div style={{ padding: '9px 12px', background: 'var(--danger-bg)', borderRadius: 8, color: 'var(--danger)', fontSize: '0.8125rem', border: '1px solid #FCA5A5' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '11px',
              borderRadius: 'var(--r-full)',
              background: loading ? 'var(--border-default)' : 'var(--primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.9375rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font)',
              transition: 'all 0.15s',
              boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.background = 'var(--primary-hover)'; }}
            onMouseLeave={e => { e.target.style.background = loading ? 'var(--border-default)' : 'var(--primary)'; }}
          >
            {loading ? 'Authenticating…' : 'Continue →'}
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-faint)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            <span>Instant Demo Logins (1-Click)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {DEMO_USERS.map((u, i) => {
              const { bg, color } = PILL_COLORS[i % PILL_COLORS.length];
              return (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => handleDemoClick(u)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--r-full)',
                    fontSize: '0.78125rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font)',
                    background: bg,
                    color,
                    border: `1px solid ${color}22`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                  title={`Sign in as ${u.role}`}
                >
                  {u.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--text-faint)' }}>
          Password: <strong style={{ color: 'var(--text-secondary)' }}>Password@123</strong>
        </div>
      </div>
    </div>
  );
}
