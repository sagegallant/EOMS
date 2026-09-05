import { Card, Button, Badge, Avatar, Progress } from '../../components/common/ui';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, MapPin, Building, Calendar, Phone, Shield, Laptop, CheckCircle2 } from 'lucide-react';

export default function ProfileView() {
  const { user } = useAuthStore();

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)', maxWidth: 960 }} className="animate-fade-in">
      {/* ── Profile Header Card ── */}
      <Card style={{ padding: 'var(--sp-6)' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar name={user?.username || 'Aarav Sharma'} size={72} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 className="h1" style={{ fontSize: '1.5rem' }}>
                {user?.username === 'aarav.sharma' || user?.username === 'alex.johnson' ? 'Aarav Sharma' : (user?.username || 'Employee Profile')}
              </h1>
              <Badge tone="success" icon={CheckCircle2}>Active Onboardee</Badge>
            </div>
            <p className="body" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
              Senior Software Engineer (SDE-II) · Platform Engineering
            </p>
            <div style={{ display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <MapPin size={14} style={{ color: 'var(--primary)' }} /> Bengaluru (Bellandur Hub)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Mail size={14} style={{ color: 'var(--primary)' }} /> {user?.username}@eoms.in
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Calendar size={14} style={{ color: 'var(--primary)' }} /> Joined Jan 12, 2026
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-5)' }}>
        {/* ── Organizational Reporting ── */}
        <Card>
          <h2 className="h2" style={{ marginBottom: 14 }}>Reporting &amp; Team Details</h2>
          <div style={{ display: 'grid', gap: 12, fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Department:</span>
              <span style={{ fontWeight: 600 }}>Platform Engineering</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Direct Manager:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Vikram Malhotra (Director)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Buddy:</span>
              <span style={{ fontWeight: 600 }}>Karthik Krishnan (Senior SDE)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Job Band / Grade:</span>
              <span style={{ fontWeight: 600 }}>Level 3 (Senior Engineer)</span>
            </div>
          </div>
        </Card>

        {/* ── Emergency Contact ── */}
        <Card>
          <h2 className="h2" style={{ marginBottom: 14 }}>Primary Emergency Contact</h2>
          <div style={{ display: 'grid', gap: 12, fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Contact Name:</span>
              <span style={{ fontWeight: 600 }}>Sunil Sharma</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Relationship:</span>
              <span style={{ fontWeight: 600 }}>Father</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Emergency Phone:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>+91 98450 12345</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
              <span style={{ fontWeight: 600 }}>sunil.sharma@gmail.com</span>
            </div>
          </div>
        </Card>

        {/* ── Assigned Hardware Kit ── */}
        <Card style={{ gridColumn: '1 / -1' }}>
          <h2 className="h2" style={{ marginBottom: 14 }}>Assigned Corporate Hardware &amp; Security Tokens</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem' }}>MacBook Pro 16" M3 Max</strong>
                <Badge tone="success">Verified</Badge>
              </div>
              <div className="meta" style={{ marginTop: 4 }}>Tag: BLR-MBP-2026-108 · 36GB / 1TB</div>
            </div>
            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem' }}>Dell UltraSharp 27" 4K</strong>
                <Badge tone="success">Verified</Badge>
              </div>
              <div className="meta" style={{ marginTop: 4 }}>Tag: BLR-MON-2026-088 · Home Workstation</div>
            </div>
            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.9rem' }}>YubiKey 5C NFC</strong>
                <Badge tone="success">Verified</Badge>
              </div>
              <div className="meta" style={{ marginTop: 4 }}>Tag: BLR-SEC-2026-014 · Hardware 2FA</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
