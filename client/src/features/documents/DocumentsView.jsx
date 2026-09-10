import { useState } from 'react';
import { Card, Button, Badge, Modal, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../components/common/charts';
import { FileCheck, FileWarning, FileMinus, Eye, CheckCircle2, XCircle, Upload } from 'lucide-react';

const INITIAL_DOCS = [
  { id: 1, employee: 'Aarav Sharma',   type: 'PAN Card',             status: 'VERIFIED',  reviewer: 'Priya Patel', date: 'Mar 10, 2026', tone: 'success' },
  { id: 2, employee: 'Sneha Kulkarni', type: 'Aadhaar Card',         status: 'PENDING',   reviewer: '—',           date: 'Mar 15, 2026', tone: 'warning' },
  { id: 3, employee: 'Arjun Rao',      type: 'EPFO Form 11 (UAN)',   status: 'VERIFIED',  reviewer: 'Neha Nair',   date: 'Mar 08, 2026', tone: 'success' },
  { id: 4, employee: 'Kabir Mehta',    type: 'Relieving Letter',      status: 'PENDING',   reviewer: '—',           date: 'Mar 18, 2026', tone: 'warning' },
  { id: 5, employee: 'Ananya Iyer',    type: 'POSH Sign-off',         status: 'VERIFIED',  reviewer: 'Neha Nair',   date: 'Mar 12, 2026', tone: 'success' },
  { id: 6, employee: 'Pooja Desai',    type: 'Cancelled Cheque',      status: 'REJECTED',  reviewer: 'Priya Patel', date: 'Mar 14, 2026', tone: 'danger' },
];

const STATUS_BARS = [
  { label: 'Verified', value: 3, displayValue: '3 docs', color: 'var(--chart-emerald)' },
  { label: 'Pending',  value: 2, displayValue: '2 docs', color: 'var(--warning)' },
  { label: 'Rejected', value: 1, displayValue: '1 doc',  color: 'var(--chart-rose)' },
];

const STATUS_ICONS = { VERIFIED: FileCheck, PENDING: FileWarning, REJECTED: FileMinus };

export default function DocumentsView() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [reviewing, setReviewing] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const updateStatus = (id, status) => {
    setDocs(ds => ds.map(d => d.id === id ? { ...d, status, tone: status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'danger' : 'warning', reviewer: 'Priya Patel' } : d));
    setReviewing(null);
  };

  const visible = filter === 'ALL' ? docs : docs.filter(d => d.status === filter);
  const verified = docs.filter(d => d.status === 'VERIFIED').length;
  const total    = docs.length;

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader title="Documents" subtitle="Statutory document verification queue for Indian compliance." />

      {/* ── Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Verification Rate</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <MiniDonut value={verified} total={total} label={`${Math.round((verified/total)*100)}%`} size={72} color="var(--chart-emerald)" />
            <div style={{ fontSize: '0.8125rem', display: 'grid', gap: 6 }}>
              {STATUS_BARS.map(s => <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}><span style={{ color: 'var(--text-muted)' }}>{s.label}</span><span style={{ fontWeight: 500 }}>{s.value}</span></div>)}
            </div>
          </div>
        </Card>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>By Status</p>
          <HorizontalBar items={STATUS_BARS} maxValue={total} />
        </Card>
      </div>

      {/* ── Doc List ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['ALL', 'VERIFIED', 'PENDING', 'REJECTED'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '4px 10px', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 500, border: '1px solid', cursor: 'pointer', transition: 'all var(--t-fast)',
                  borderColor: filter === f ? 'var(--primary)' : 'var(--border-default)',
                  background: filter === f ? 'var(--primary-light)' : 'transparent',
                  color: filter === f ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <AnimatedList style={{ display: 'grid', gap: 6 }}>
          {visible.map(doc => {
            const Icon = STATUS_ICONS[doc.status] || FileWarning;
            return (
              <AnimatedItem key={doc.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap', transition: 'border-color var(--t-fast)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: `var(--${doc.status === 'VERIFIED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'danger'}-bg)`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon size={15} style={{ color: `var(--${doc.status === 'VERIFIED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'danger'})` }} />
                  </div>
                  <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doc.type}</div>
                    <div className="meta" style={{ color: 'var(--text-muted)' }}>{doc.employee} · {doc.date}</div>
                  </div>
                  <Badge tone={doc.tone}>{doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}</Badge>
                  {doc.status === 'PENDING' && (
                    <Button variant="soft" size="xs" icon={Eye} onClick={() => setReviewing(doc)}>Review</Button>
                  )}
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      </Card>

      <Modal isOpen={!!reviewing} onClose={() => setReviewing(null)}
        title={`Review: ${reviewing?.type}`}
        description={`Submitted by ${reviewing?.employee} on ${reviewing?.date}`}
        footer={<>
          <Button variant="dangerSoft" icon={XCircle} onClick={() => updateStatus(reviewing.id, 'REJECTED')}>Reject</Button>
          <Button icon={CheckCircle2} onClick={() => updateStatus(reviewing.id, 'VERIFIED')}>Approve</Button>
        </>}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ padding: 16, borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '2px dashed var(--border-default)', display: 'grid', placeItems: 'center', minHeight: 120 }}>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              <Upload size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p className="caption">{reviewing?.type} document preview</p>
              <p className="meta" style={{ marginTop: 2 }}>Document content shown here in production</p>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 6, fontSize: '0.8125rem' }}>
            {[['Employee', reviewing?.employee], ['Document Type', reviewing?.type], ['Submitted', reviewing?.date]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
