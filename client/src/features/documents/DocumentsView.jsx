import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Badge,
  Modal,
  Input,
  Select,
  AnimatedList,
  AnimatedItem,
  PageHeader,
} from '../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../components/common/charts';
import {
  FileCheck,
  FileWarning,
  FileMinus,
  Eye,
  CheckCircle2,
  XCircle,
  Upload,
  Download,
  RefreshCw,
  Plus,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { documentApi } from '../../api/documents';
import { employeeApi } from '../../api/employees';
import { useAuthStore } from '../../store/authStore';

const ICON_MAP = {
  approved: FileCheck,
  pending: FileWarning,
  rejected: XCircle,
  requires_resubmission: FileMinus,
};

const TONE_MAP = {
  approved: 'sage',
  pending: 'warning',
  rejected: 'danger',
  requires_resubmission: 'warning',
};

export default function DocumentsView() {
  const { user } = useAuthStore();
  const [docs, setDocs] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Review state
  const [reviewing, setReviewing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    employeeId: user?.employeeId || '',
    typeId: '',
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const isStaff = user?.roles?.some(r =>
    ['HR_ADMIN', 'HR_SPECIALIST', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'].includes(r)
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [docsRes, typesRes] = await Promise.all([
        documentApi.list(),
        documentApi.listTypes(),
      ]);
      setDocs(docsRes.data || []);
      setDocTypes(typesRes.data || []);

      if (isStaff) {
        try {
          const empRes = await employeeApi.list();
          setEmployees(empRes.data || []);
        } catch {
          // non-critical if employee list fails
        }
      }
    } catch (err) {
      console.error('Failed to load documents data:', err);
      setError(err?.response?.data?.message || 'Failed to load document records from server.');
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVerify = async (status) => {
    if (!reviewing) return;
    try {
      setReviewSubmitting(true);
      await documentApi.verify(reviewing.documentId, {
        status,
        comments: reviewNotes || undefined,
      });
      setReviewing(null);
      setReviewNotes('');
      await loadData();
    } catch (err) {
      console.error('Verification failed:', err);
      alert(err?.response?.data?.message || 'Failed to update verification status.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await documentApi.downloadBlob(doc.documentId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName || 'document.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Unable to download file. Please check permissions or file availability.');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.typeId) {
      setUploadError('Please select a document type.');
      return;
    }
    if (!uploadForm.file) {
      setUploadError('Please choose a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const fd = new FormData();
      fd.append('file', uploadForm.file);
      fd.append('typeId', uploadForm.typeId);
      fd.append('employeeId', uploadForm.employeeId || user?.employeeId);

      await documentApi.upload(fd);
      setUploadModalOpen(false);
      setUploadForm({
        employeeId: user?.employeeId || '',
        typeId: '',
        file: null,
      });
      await loadData();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err?.response?.data?.message || 'Failed to upload document. Whitelisted types: PDF, PNG, JPG.');
    } finally {
      setUploading(false);
    }
  };

  // Helper metrics
  const total = docs.length;
  const verifiedCount = docs.filter(
    (d) => d.DocumentVerifications?.[0]?.status === 'approved'
  ).length;
  const pendingCount = docs.filter(
    (d) => !d.DocumentVerifications?.[0] || d.DocumentVerifications?.[0]?.status === 'pending'
  ).length;
  const rejectedCount = docs.filter(
    (d) => d.DocumentVerifications?.[0]?.status === 'rejected'
  ).length;
  const resubmitCount = docs.filter(
    (d) => d.DocumentVerifications?.[0]?.status === 'requires_resubmission'
  ).length;

  const statusBars = [
    { label: 'Approved', value: verifiedCount, displayValue: `${verifiedCount} docs`, color: 'var(--chart-1)' },
    { label: 'Pending', value: pendingCount, displayValue: `${pendingCount} docs`, color: 'var(--warning)' },
    { label: 'Rejected', value: rejectedCount, displayValue: `${rejectedCount} docs`, color: 'var(--danger)' },
    { label: 'Resubmit', value: resubmitCount, displayValue: `${resubmitCount} docs`, color: 'var(--accent-orange)' },
  ];

  const visible = docs.filter((d) => {
    const status = d.DocumentVerifications?.[0]?.status || 'pending';
    if (filter === 'ALL') return true;
    return status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Documents"
        subtitle="Statutory document verification & compliance repository."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
              Refresh
            </Button>
            <Button
              size="sm"
              icon={Upload}
              onClick={() => {
                setUploadError(null);
                setUploadModalOpen(true);
              }}
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {error && (
        <Card $p="var(--sp-4)" style={{ borderColor: 'var(--danger-border)', background: 'var(--danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.875rem' }}>{error}</span>
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom: 12 }}>Verification Compliance</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <MiniDonut
              value={verifiedCount}
              total={total || 1}
              label={total ? `${Math.round((verifiedCount / total) * 100)}%` : '0%'}
              size={72}
              color="var(--chart-1)"
            />
            <div style={{ fontSize: '0.8125rem', display: 'grid', gap: 5, flex: 1 }}>
              {statusBars.map((s) => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom: 10 }}>Verification Status Breakdown</div>
          <HorizontalBar items={statusBars} maxValue={Math.max(total, 1)} />
        </Card>
      </div>

      <Card $p="var(--sp-5)">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'requires_resubmission', label: 'Resubmit' },
              { id: 'rejected', label: 'Rejected' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1.5px solid',
                  cursor: 'pointer',
                  transition: 'all var(--t-fast)',
                  borderColor: filter === f.id ? 'var(--sage-600)' : 'var(--border-default)',
                  background: filter === f.id ? 'var(--sage-100)' : 'transparent',
                  color: filter === f.id ? 'var(--sage-800)' : 'var(--text-muted)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {visible.length} of {total} documents
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: 10, padding: '20px 0' }}>
            <div style={{ height: 48, borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ height: 48, borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', animation: 'pulse 1.5s infinite ease-in-out' }} />
            <div style={{ height: 48, borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', animation: 'pulse 1.5s infinite ease-in-out' }} />
          </div>
        ) : visible.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileWarning size={32} style={{ margin: '0 auto 8px', color: 'var(--warning)', opacity: 0.8 }} />
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>No documents found</div>
            <div className="caption" style={{ marginTop: 4 }}>
              {filter === 'ALL' ? 'No documents have been uploaded yet.' : `No documents match filter "${filter}".`}
            </div>
          </div>
        ) : (
          <AnimatedList style={{ display: 'grid', gap: 8 }}>
            {visible.map((doc) => {
              const ver = doc.DocumentVerifications?.[0];
              const statusKey = ver?.status || 'pending';
              const Icon = ICON_MAP[statusKey] || FileWarning;
              const tone = TONE_MAP[statusKey] || 'warning';
              const empName = doc.Employee
                ? `${doc.Employee.firstName} ${doc.Employee.lastName}`
                : `Emp #${doc.employeeId}`;
              const docTypeName = doc.DocumentType?.typeName || doc.fileName;
              const dateStr = doc.uploadedAt
                ? new Date(doc.uploadedAt).toLocaleDateString()
                : '—';

              return (
                <AnimatedItem key={doc.documentId}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      flexWrap: 'wrap',
                      transition: 'all var(--t-fast)',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--r-md)',
                        background: 'var(--sage-50)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} style={{ color: 'var(--sage-700)' }} />
                    </div>

                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {docTypeName}
                      </div>
                      <div className="meta" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                        <span>{empName}</span>
                        <span>·</span>
                        <span>{doc.fileName}</span>
                        <span>·</span>
                        <span>{dateStr}</span>
                        {doc.fileSizeBytes && (
                          <>
                            <span>·</span>
                            <span>{Math.round(doc.fileSizeBytes / 1024)} KB</span>
                          </>
                        )}
                      </div>
                      {ver?.comments && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                          Note: "{ver.comments}"
                        </div>
                      )}
                    </div>

                    <Badge tone={tone}>
                      {statusKey.replace('_', ' ').toUpperCase()}
                    </Badge>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button
                        variant="soft"
                        size="xs"
                        icon={Download}
                        onClick={() => handleDownload(doc)}
                      >
                        Download
                      </Button>
                      {isStaff && (
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Eye}
                          onClick={() => {
                            setReviewing(doc);
                            setReviewNotes(ver?.comments || '');
                          }}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              );
            })}
          </AnimatedList>
        )}
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewing}
        onClose={() => setReviewing(null)}
        title={`Review Document: ${reviewing?.DocumentType?.typeName || reviewing?.fileName}`}
        description={`Submitted by ${reviewing?.Employee?.firstName || 'Employee'} ${
          reviewing?.Employee?.lastName || ''
        }`}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button
              variant="dangerSoft"
              icon={XCircle}
              disabled={reviewSubmitting}
              onClick={() => handleVerify('rejected')}
            >
              Reject
            </Button>
            <Button
              variant="outline"
              icon={HelpCircle}
              disabled={reviewSubmitting}
              onClick={() => handleVerify('requires_resubmission')}
            >
              Request Resubmission
            </Button>
            <Button
              icon={CheckCircle2}
              disabled={reviewSubmitting}
              onClick={() => handleVerify('approved')}
            >
              Approve
            </Button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--r-md)',
              background: 'var(--sage-50)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{reviewing?.fileName}</div>
              <div className="meta" style={{ marginTop: 2 }}>
                {reviewing?.mimeType} · {reviewing?.fileSizeBytes ? `${Math.round(reviewing.fileSizeBytes / 1024)} KB` : ''}
              </div>
            </div>
            <Button size="xs" variant="soft" icon={Download} onClick={() => handleDownload(reviewing)}>
              Download File
            </Button>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Compliance Notes & Audit Feedback
            </label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Provide verification notes or reason for rejection/resubmission..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-default)',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Statutory Document"
        description="Submit compliance or identification documentation for verification."
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button icon={Upload} disabled={uploading} onClick={handleUploadSubmit}>
              {uploading ? 'Uploading...' : 'Submit Document'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gap: 14 }}>
          {uploadError && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>
              {uploadError}
            </div>
          )}

          {isStaff && employees.length > 0 && (
            <div style={{ display: 'grid', gap: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Target Employee</label>
              <select
                value={uploadForm.employeeId}
                onChange={(e) => setUploadForm({ ...uploadForm, employeeId: e.target.value })}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid var(--border-default)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                }}
              >
                <option value="">Select Employee...</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.firstName} {emp.lastName} ({emp.workEmail || `ID #${emp.employeeId}`})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Document Type *</label>
            <select
              value={uploadForm.typeId}
              onChange={(e) => setUploadForm({ ...uploadForm, typeId: e.target.value })}
              required
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--r-md)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
              }}
            >
              <option value="">Select Document Type...</option>
              {docTypes.map((dt) => (
                <option key={dt.typeId} value={dt.typeId}>
                  {dt.typeName} {dt.isMandatory ? '(Mandatory)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Select File (PDF, PNG, JPG, WebP - max 5MB) *</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
              style={{
                padding: '8px',
                borderRadius: 'var(--r-md)',
                border: '1px dashed var(--border-default)',
                background: 'var(--bg-surface)',
                fontSize: '0.875rem',
              }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
