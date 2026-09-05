import { useState } from 'react';
import { Card, Button, Badge } from '../../components/common/ui';
import { ShieldAlert, Search, Filter, Lock, Terminal } from 'lucide-react';

const INITIAL_AUDIT = [
  { id: 1, action: 'SYSTEM_BOOTSTRAP', actor: 'Rajesh Nambiar (SYSTEM_ADMIN)', table: 'roles', ip: '10.0.1.5', time: 'Aug 26, 2026 10:30 IST', details: 'Initialized 10 RBAC roles and permissions' },
  { id: 2, action: 'EMPLOYEE_ONBOARDED', actor: 'Priya Patel (HR_ADMIN)', table: 'employees', ip: '10.0.2.14', time: 'Jan 12, 2026 09:15 IST', details: 'Enrolled Aarav Sharma (SDE-II, Bengaluru)' },
  { id: 3, action: 'ASSET_ALLOCATED', actor: 'Rohan Verma (IT_ADMIN)', table: 'assets', ip: '10.0.3.8', time: 'Jan 12, 2026 11:45 IST', details: 'Allocated BLR-MBP-2026-108 to Aarav Sharma' },
  { id: 4, action: 'DOCUMENT_VERIFIED', actor: 'Priya Patel (HR_ADMIN)', table: 'documents', ip: '10.0.2.14', time: 'Jan 13, 2026 14:20 IST', details: 'Verified PAN Card via NSDL portal (Status: Approved)' },
  { id: 5, action: 'DOCUMENT_REJECTED', actor: 'Priya Patel (HR_ADMIN)', table: 'documents', ip: '10.0.2.14', time: 'Jan 20, 2026 16:10 IST', details: 'Requested Aadhaar resubmission for Sneha Kulkarni' },
  { id: 6, action: 'TRAINING_COMPLETED', actor: 'Aarav Sharma (EMPLOYEE)', table: 'training_records', ip: '192.168.1.42', time: 'Jan 20, 2026 18:30 IST', details: 'Completed InfoSec & DPDP Assessment (Score: 92%)' },
];

export default function AuditView() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filtered = INITIAL_AUDIT.filter(a => {
    if (actionFilter !== 'ALL' && a.action !== actionFilter) return false;
    if (search && !a.details.toLowerCase().includes(search.toLowerCase()) && !a.actor.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="display">Immutable Security &amp; Audit Logs</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            System-wide auditable event log capturing role changes, statutory approvals, and asset allocations.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge tone="success" icon={Lock}>Append-Only Auditing Active</Badge>
        </div>
      </header>

      {/* ── Search & Filter Bar ── */}
      <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by actor or event details…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                outline: 'none',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'EMPLOYEE_ONBOARDED', 'DOCUMENT_VERIFIED', 'ASSET_ALLOCATED'].map(act => (
              <button
                key={act}
                onClick={() => setActionFilter(act)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: actionFilter === act ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: actionFilter === act ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {act === 'ALL' ? 'All Actions' : act.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Audit Table ── */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 18px' }}>Action Event</th>
                <th style={{ padding: '12px 16px' }}>Actor</th>
                <th style={{ padding: '12px 16px' }}>Target Entity</th>
                <th style={{ padding: '12px 16px' }}>Details &amp; Audit Trail</th>
                <th style={{ padding: '12px 16px' }}>Client IP</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 600 }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 6px', borderRadius: 4 }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {l.actor}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                    {l.table}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                    {l.details}
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {l.ip}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {l.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
