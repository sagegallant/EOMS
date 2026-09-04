import { useState } from 'react';
import { Card, Button, Badge, Modal, Input, Select, Label } from '../../components/common/ui';
import { FileText, Upload, CheckCircle2, XCircle, Clock, Eye, AlertCircle, ShieldCheck } from 'lucide-react';

const INITIAL_DOCS = [
  {
    id: 1,
    employee: 'Aarav Sharma',
    type: 'PAN Card Copy',
    fileName: 'Aarav_Sharma_PAN_Card.pdf',
    size: '1.05 MB',
    uploadedAt: 'Jan 12, 2026',
    status: 'approved',
    reviewer: 'Priya Patel (HR)',
    notes: 'PAN details cross-verified with NSDL Income Tax database. Name matches Aarav Sharma.',
  },
  {
    id: 2,
    employee: 'Aarav Sharma',
    type: 'Aadhaar Identity Proof',
    fileName: 'Aarav_Sharma_Aadhaar.pdf',
    size: '2.10 MB',
    uploadedAt: 'Jan 12, 2026',
    status: 'approved',
    reviewer: 'Priya Patel (HR)',
    notes: 'Aadhaar masked UIDAI copy verified.',
  },
  {
    id: 3,
    employee: 'Aarav Sharma',
    type: 'EPFO Form 11 Declaration',
    fileName: 'Aarav_Sharma_EPFO_Form11.pdf',
    size: '512 KB',
    uploadedAt: 'Jan 13, 2026',
    status: 'approved',
    reviewer: 'Priya Patel (HR)',
    notes: 'Existing UAN validated for Provident Fund transfer.',
  },
  {
    id: 4,
    employee: 'Aarav Sharma',
    type: 'Cancelled Cheque / Bank Proof',
    fileName: 'Aarav_HDFC_Bank_Cheque.pdf',
    size: '820 KB',
    uploadedAt: 'Jan 13, 2026',
    status: 'approved',
    reviewer: 'Ritu Choudhury (Payroll)',
    notes: 'HDFC Bank Bellandur branch IFSC and salary account details verified.',
  },
  {
    id: 5,
    employee: 'Aarav Sharma',
    type: 'POSH Policy Acknowledgement',
    fileName: 'Aarav_POSH_Signed_Affidavit.pdf',
    size: '614 KB',
    uploadedAt: 'Jan 14, 2026',
    status: 'pending',
    reviewer: 'Neha Nair (Compliance)',
    notes: 'Under statutory legal review queue.',
  },
  {
    id: 6,
    employee: 'Sneha Kulkarni',
    type: 'Aadhaar Identity Proof',
    fileName: 'Sneha_Kulkarni_Aadhaar.pdf',
    size: '1.80 MB',
    uploadedAt: 'Jan 20, 2026',
    status: 'requires_resubmission',
    reviewer: 'Priya Patel (HR)',
    notes: 'Corner QR code of Aadhaar scan is cut off. Please re-upload clear full-page PDF.',
  },
  {
    id: 7,
    employee: 'Arjun Rao',
    type: 'PAN Card Copy',
    fileName: 'Arjun_Rao_PAN.pdf',
    size: '850 KB',
    uploadedAt: 'Feb 02, 2026',
    status: 'pending',
    reviewer: 'Priya Patel (HR)',
    notes: 'Pending initial HR review.',
  },
  {
    id: 8,
    employee: 'Ananya Iyer',
    type: 'Relieving & Experience Letter',
    fileName: 'Ananya_Iyer_Relieving_Cert.pdf',
    size: '1.20 MB',
    uploadedAt: 'Feb 10, 2026',
    status: 'pending',
    reviewer: 'Priya Patel (HR)',
    notes: 'Pending HR verification of service tenure.',
  },
];

export default function DocumentsView() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [reviewModalDoc, setReviewModalDoc] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    type: 'PAN Card Copy',
    fileName: '',
  });

  const filteredDocs = docs.filter(d => (filterStatus === 'ALL' ? true : d.status === filterStatus));

  const handleReviewAction = newStatus => {
    if (!reviewModalDoc) return;
    setDocs(
      docs.map(d =>
        d.id === reviewModalDoc.id
          ? {
              ...d,
              status: newStatus,
              notes: reviewNotes || (newStatus === 'approved' ? 'Verified and approved.' : 'Requires correction and resubmission.'),
            }
          : d
      )
    );
    setReviewModalDoc(null);
  };

  const handleUploadSubmit = e => {
    e.preventDefault();
    if (!newDoc.fileName) return;

    const item = {
      id: Date.now(),
      employee: 'Aarav Sharma',
      type: newDoc.type,
      fileName: newDoc.fileName,
      size: '1.15 MB',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending',
      reviewer: 'Priya Patel (HR)',
      notes: 'Newly submitted document in verification queue.',
    };

    setDocs([item, ...docs]);
    setIsUploadModalOpen(false);
    setNewDoc({ type: 'PAN Card Copy', fileName: '' });
  };

  const getStatusBadge = status => {
    if (status === 'approved') return <Badge tone="success" icon={CheckCircle2}>Approved</Badge>;
    if (status === 'requires_resubmission') return <Badge tone="danger" icon={XCircle}>Resubmission Required</Badge>;
    return <Badge tone="warning" icon={Clock}>Under Review</Badge>;
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Compliance &amp; Document Repository</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Indian statutory employee verification: PAN, Aadhaar, EPFO Form 11, and POSH compliance queue.
          </p>
        </div>
        <Button icon={Upload} onClick={() => setIsUploadModalOpen(true)}>
          Upload Document
        </Button>
      </header>

      {/* ── Stats Overview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total Documents</div>
          <div className="h1" style={{ marginTop: 4 }}>{docs.length}</div>
        </Card>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--success)', fontWeight: 600 }}>Verified &amp; Approved</div>
          <div className="h1" style={{ marginTop: 4, color: 'var(--success)' }}>{docs.filter(d => d.status === 'approved').length}</div>
        </Card>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--warning)', fontWeight: 600 }}>Pending Review</div>
          <div className="h1" style={{ marginTop: 4, color: 'var(--warning)' }}>{docs.filter(d => d.status === 'pending').length}</div>
        </Card>
        <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
          <div className="caption" style={{ color: 'var(--danger)', fontWeight: 600 }}>Requires Resubmission</div>
          <div className="h1" style={{ marginTop: 4, color: 'var(--danger)' }}>{docs.filter(d => d.status === 'requires_resubmission').length}</div>
        </Card>
      </div>

      {/* ── Filter Bar ── */}
      <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL', 'pending', 'approved', 'requires_resubmission'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: filterStatus === st ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: filterStatus === st ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                }}
              >
                {st === 'ALL' ? 'All Records' : st.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>
            Showing {filteredDocs.length} items
          </span>
        </div>
      </Card>

      {/* ── Document Table ── */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 20px' }}>Employee</th>
                <th style={{ padding: '12px 16px' }}>Document Type</th>
                <th style={{ padding: '12px 16px' }}>File Info</th>
                <th style={{ padding: '12px 16px' }}>Uploaded</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 150ms ease' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {d.employee}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.type}</div>
                    <div className="meta">{d.notes}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontWeight: 500 }}>
                      <FileText size={15} /> {d.fileName}
                    </div>
                    <div className="meta">{d.size}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {d.uploadedAt}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {getStatusBadge(d.status)}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <Button
                      size="xs"
                      variant="soft"
                      onClick={() => {
                        setReviewModalDoc(d);
                        setReviewNotes(d.notes);
                      }}
                    >
                      <Eye size={13} /> Review &amp; Verify
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Document Review Modal ── */}
      {reviewModalDoc && (
        <Modal
          isOpen={true}
          onClose={() => setReviewModalDoc(null)}
          title={`Review ${reviewModalDoc.type}`}
          description={`Submitted by ${reviewModalDoc.employee} on ${reviewModalDoc.uploadedAt}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setReviewModalDoc(null)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => handleReviewAction('requires_resubmission')}
              >
                Request Resubmission
              </Button>
              <Button
                onClick={() => handleReviewAction('approved')}
              >
                Approve Document
              </Button>
            </>
          }
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="caption" style={{ color: 'var(--text-muted)' }}>Document File:</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{reviewModalDoc.fileName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="caption" style={{ color: 'var(--text-muted)' }}>File Size:</span>
                <span style={{ fontWeight: 600 }}>{reviewModalDoc.size}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="caption" style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                {getStatusBadge(reviewModalDoc.status)}
              </div>
            </div>

            <div>
              <Label>Reviewer Compliance Notes &amp; Feedback</Label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="Enter audit verification comments or rejection rationale..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── Upload Modal ── */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Compliance Document"
        description="Submit official proof for statutory Indian verification."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUploadSubmit}>Submit for Verification</Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Document Category</Label>
            <Select
              value={newDoc.type}
              onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}
            >
              <option value="PAN Card Copy">PAN Card Copy (NSDL/IT Department)</option>
              <option value="Aadhaar Identity Proof">Aadhaar Identity Proof (UIDAI)</option>
              <option value="EPFO Form 11 Declaration">EPFO Form 11 Declaration (UAN)</option>
              <option value="Cancelled Cheque / Bank Proof">Cancelled Cheque / Bank Statement (Direct Deposit)</option>
              <option value="POSH Policy Acknowledgement">POSH Policy &amp; Code of Conduct Sign-off</option>
              <option value="Relieving & Experience Letter">Previous Employer Relieving Certificate</option>
            </Select>
          </div>
          <div>
            <Label>File Name / Selection</Label>
            <Input
              required
              placeholder="e.g. Aarav_Sharma_Aadhaar_Masked.pdf"
              value={newDoc.fileName}
              onChange={e => setNewDoc({ ...newDoc, fileName: e.target.value })}
            />
          </div>
          <div
            style={{
              padding: '24px 16px',
              border: '2px dashed var(--border-default)',
              borderRadius: 'var(--r-md)',
              textAlign: 'center',
              background: 'var(--bg-subtle)',
            }}
          >
            <Upload size={28} style={{ margin: '0 auto 8px auto', color: 'var(--primary)' }} />
            <div className="caption" style={{ fontWeight: 600 }}>Drag and drop file here, or browse local disk</div>
            <div className="meta" style={{ marginTop: 4 }}>PDF, PNG, JPEG up to 10MB</div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
