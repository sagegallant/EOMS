/**
 * DocumentsView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Filtered Doc List + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, Badge, Modal, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../components/common/charts';
import { FileCheck, FileWarning, FileMinus, Eye, CheckCircle2, XCircle, ShieldCheck, FileText, Upload } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const INITIAL_DOCS = [
  { id: 1, employee: 'Aarav Sharma',   type: 'PAN Card (TDS Verification)',     status: 'VERIFIED',  reviewer: 'Priya Patel', date: 'Sep 10, 2026', tone: 'success' },
  { id: 2, employee: 'Sneha Kulkarni', type: 'Aadhaar Card (e-KYC Offline XML)',status: 'PENDING',   reviewer: '—',           date: 'Sep 15, 2026', tone: 'warning' },
  { id: 3, employee: 'Arjun Rao',      type: 'EPFO Form 11 (UAN Transfer)',    status: 'VERIFIED',  reviewer: 'Neha Nair',   date: 'Sep 08, 2026', tone: 'success' },
  { id: 4, employee: 'Kabir Mehta',    type: 'Prior Relieving & Experience Letter', status: 'PENDING', reviewer: '—',       date: 'Sep 16, 2026', tone: 'warning' },
  { id: 5, employee: 'Ananya Iyer',    type: 'POSH Act 2013 Policy Sign-off',   status: 'VERIFIED',  reviewer: 'Neha Nair',   date: 'Sep 12, 2026', tone: 'success' },
  { id: 6, employee: 'Pooja Desai',    type: 'Bank Account Cancelled Cheque',   status: 'REJECTED',  reviewer: 'Priya Patel', date: 'Sep 14, 2026', tone: 'danger' },
];

const STATUS_BARS = [
  { label: 'Verified', value: 3, displayValue: '3 verified' },
  { label: 'Pending',  value: 2, displayValue: '2 pending' },
  { label: 'Rejected', value: 1, displayValue: '1 rejected' },
];

const PENDING_DOCS_ACTIONS = [
  { title: 'Aadhaar e-KYC — Sneha Kulkarni', date: 'Submitted Sep 15', done: false },
  { title: 'Relieving Letter — Kabir Mehta', date: 'Submitted Sep 16', done: false },
  { title: 'Bank Cheque Resubmission — Pooja', date: 'Requested Sep 14', done: false },
  { title: 'PAN Card Validation — Aarav', date: 'Verified Sep 10', done: true },
];

const STATUS_ICONS = { VERIFIED: FileCheck, PENDING: FileWarning, REJECTED: FileMinus };

export default function DocumentsView() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [reviewing, setReviewing] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const rowRef = useScrollReveal({ delay: 0.05 });

  const updateStatus = (id, status) => {
    setDocs(ds => ds.map(d => d.id === id ? {
      ...d,
      status,
      tone: status === 'VERIFIED' ? 'success' : status === 'REJECTED' ? 'danger' : 'warning',
      reviewer: 'Priya Patel'
    } : d));
    setReviewing(null);
  };

  const visible = filter === 'ALL' ? docs : docs.filter(d => d.status === filter);
  const verified = docs.filter(d => d.status === 'VERIFIED').length;
  const total = docs.length;
  const verifiedPct = Math.round((verified / total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Statutory Documents Queue"
        subtitle="Verification workflows for Indian employment compliance: PAN, Aadhaar, EPFO Form 11, and banking records."
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Verification Rate" value={verifiedPct} delay={0.0} />
        <MetricPillBar label="EPFO Compliance"   value={100} delay={0.1} />
        <MetricPillBar label="DigiLocker Linked" value={83} delay={0.2} />
        <MetricPillBar label="Action Required"   value={33} delay={0.3} color="amber" />
      </div>

      {/* ── Visual Section: Donut + Bar + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 12 }}>Audit Approval Ratio</p>
            <MiniDonut
              value={verified}
              total={total}
              label={`${verifiedPct}%`}
              sublabel="verified"
              size={84}
              color="var(--chart-green)"
            />
          </Card>
          <Card style={{ padding: 'var(--sp-4)' }}>
            <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 10 }}>Queue by Status</p>
            <HorizontalBar items={STATUS_BARS} colorVar="--chart-green" />
          </Card>
        </div>
        <DarkTaskCard title="Document Verification Queue" tasks={PENDING_DOCS_ACTIONS} />
      </div>

      {/* ── Document List Card ── */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['ALL', 'VERIFIED', 'PENDING', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1px solid',
                  cursor: 'pointer',
                  borderColor: filter === f ? 'var(--bg-dark)' : 'var(--border-subtle)',
                  background: filter === f ? 'var(--bg-dark)' : 'var(--bg-subtle)',
                  color: filter === f ? '#fff' : 'var(--text-secondary)',
                  transition: 'all 0.2s var(--ease)',
                }}
              >
                {f === 'ALL' ? 'All Records' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>
            Showing {visible.length} of {total} documents
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map(doc => {
            const Icon = STATUS_ICONS[doc.status] || FileWarning;
            return (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--r-sm)',
                    background: doc.status === 'VERIFIED' ? 'var(--primary-light)' : doc.status === 'PENDING' ? 'var(--amber-bg)' : 'var(--danger-bg)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={16}
                    style={{
                      color: doc.status === 'VERIFIED' ? 'var(--primary)' : doc.status === 'PENDING' ? 'var(--amber)' : 'var(--danger)',
                    }}
                  />
                </div>
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doc.type}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                    {doc.employee} · Uploaded {doc.date} {doc.reviewer !== '—' && `· Reviewed by ${doc.reviewer}`}
                  </div>
                </div>
                <Badge tone={doc.tone}>{doc.status.charAt(0) + doc.status.slice(1).toLowerCase()}</Badge>
                {doc.status === 'PENDING' && (
                  <Button variant="soft" size="xs" icon={Eye} onClick={() => setReviewing(doc)}>Review</Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Mandatory Statutory Records Check (Indian Payroll)" icon={ShieldCheck}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { doc: 'Permanent Account Number (PAN)', act: 'Income Tax Act 1961', req: 'Mandatory for TDS calculation and Form 16 issuance.' },
              { doc: 'Aadhaar (UIDAI Offline e-KYC)', act: 'UIDAI Guidelines', req: 'Proof of identity & address; masked XML without sharing physical copy.' },
              { doc: 'EPFO Form 11 (UAN Declaration)', act: 'EPF & MP Act 1952', req: 'Prevents duplicate Universal Account Numbers and facilitates PF transfer.' },
              { doc: 'Gratuity Form F (Nomination)', act: 'Payment of Gratuity Act 1972', req: 'Statutory beneficiary nomination signed in presence of witnesses.' },
            ].map((d, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{d.doc}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{d.act}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{d.req}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="DigiLocker & Aadhaar e-Sign Integration Protocol" icon={FileText}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { name: 'DigiLocker National Gateway', status: 'Connected', desc: 'Instant cryptographic verification of degree certificates & driving licenses.' },
              { name: 'NSDL / CDSL PAN Validation API', status: 'Live', desc: 'Real-time name and DOB match check against income tax database.' },
              { name: 'UIDAI e-Sign ESP', status: 'Active', desc: 'Legally binding Aadhaar OTP-based signature under Information Technology Act 2000.' },
            ].map((p, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{p.name}</span>
                  <Badge tone="success">{p.status}</Badge>
                </div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>

      {/* ── Review Modal ── */}
      <Modal
        isOpen={!!reviewing}
        onClose={() => setReviewing(null)}
        title={reviewing ? `Review: ${reviewing.type}` : ''}
      >
        {reviewing && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', display: 'grid', gap: 6, fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Employee</span><span style={{ fontWeight: 600 }}>{reviewing.employee}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Document</span><span style={{ fontWeight: 600 }}>{reviewing.type}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Submitted</span><span>{reviewing.date}</span></div>
            </div>
            <div style={{ height: 160, borderRadius: 'var(--r-md)', border: '2px dashed var(--border-green)', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', background: 'var(--bg-app)' }}>
              <div style={{ textAlign: 'center' }}>
                <FileText size={32} style={{ color: 'var(--primary)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Document Preview Encrypted</div>
                <div className="caption">256-bit AES statutory compliance record</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button variant="danger" size="sm" icon={XCircle} onClick={() => updateStatus(reviewing.id, 'REJECTED')}>Reject Document</Button>
              <Button size="sm" icon={CheckCircle2} onClick={() => updateStatus(reviewing.id, 'VERIFIED')}>Approve & Verify</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
