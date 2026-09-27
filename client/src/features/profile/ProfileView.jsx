import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Avatar, PageHeader, Collapsible, Badge, AnimatedList, AnimatedItem } from '../../components/common/ui';
import { RadialProgress, ActivityTimeline } from '../../components/common/charts';
import { Mail, MapPin, Building2, Calendar, FileText, Laptop, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { employeeApi } from '../../api/employees';
import { documentApi } from '../../api/documents';
import { assetApi } from '../../api/assets';
import { onboardingApi } from '../../api/onboarding';
import { trainingApi } from '../../api/training';

export default function ProfileView() {
  const { user } = useAuthStore();
  const [emp, setEmp] = useState(null);
  const [plan, setPlan] = useState(null);
  const [docs, setDocs] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [trainingRecords, setTrainingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!user?.employeeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [empRes, planRes, docsRes, allocsRes, trainRes] = await Promise.all([
        employeeApi.getById(user.employeeId).catch(() => ({ data: null })),
        onboardingApi.getPlanByEmployeeId(user.employeeId).catch(() => ({ data: null })),
        documentApi.list({ employeeId: user.employeeId }).catch(() => ({ data: [] })),
        assetApi.listAllocations({ employeeId: user.employeeId }).catch(() => ({ data: [] })),
        trainingApi.getEmployeeTraining(user.employeeId).catch(() => ({ data: [] })),
      ]);

      setEmp(empRes?.data || null);
      setPlan(planRes?.data || null);
      setDocs(docsRes?.data || []);
      setAllocations(allocsRes?.data || []);
      setTrainingRecords(trainRes?.data || []);
    } catch (err) {
      console.error('Failed to load profile data:', err);
      setError(err?.response?.data?.message || 'Failed to load profile from backend.');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const fullName = emp
    ? `${emp.firstName} ${emp.lastName}`
    : user?.fullName || user?.username || 'Employee';
  const roleTitle = emp?.Position?.jobTitle || (user?.roles || []).join(', ') || 'Team Member';
  const deptName = emp?.Position?.Department?.deptName || 'EOMS Global';
  const location = emp?.workLocation || 'Bengaluru (Hybrid)';
  const email = emp?.workEmail || user?.email || 'N/A';
  const hireDateStr = emp?.hireDate
    ? new Date(emp.hireDate).toLocaleDateString()
    : 'Active';

  const progress = plan ? Math.round(Number(plan.progressPercent) || 0) : 0;
  const verifiedDocs = docs.filter((d) => d.DocumentVerifications?.[0]?.status === 'approved').length;

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)', maxWidth: 780 }}>
      <PageHeader
        title="Profile & Identity"
        subtitle="Employee service record, security posture, and compliance status."
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
            Refresh
          </Button>
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

      {/* Hero card */}
      <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--sage-800) 0%, var(--sage-600) 100%)', padding: 'var(--sp-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Avatar name={fullName} size={64} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{fullName}</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{roleTitle}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Building2 size={12} /> {deptName}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  <MapPin size={12} /> {location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Mail size={12} /> {email}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                  <Calendar size={12} /> Joined {hireDateStr}
                </span>
              </div>
            </div>
            {plan && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <RadialProgress
                  value={progress}
                  size={84}
                  strokeWidth={8}
                  color="#86EFAC"
                  trackColor="rgba(255,255,255,0.2)"
                  label={`${progress}%`}
                  sublabel="onboarded"
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 'var(--sp-4)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {plan?.status ? plan.status.toUpperCase() : 'N/A'}
            </div>
            <div className="meta">Plan Status</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {verifiedDocs} / {docs.length}
            </div>
            <div className="meta">Verified Docs</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {allocations.length}
            </div>
            <div className="meta">Assigned Assets</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {trainingRecords.filter((r) => r.status === 'completed').length} / {trainingRecords.length}
            </div>
            <div className="meta">Completed Modules</div>
          </div>
        </div>
      </div>

      {/* Accordion profile sections */}
      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom: 8 }}>Statutory Documents</h2>
        {docs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '12px 0' }}>
            No documents uploaded yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8, paddingTop: 8 }}>
            {docs.map((d) => {
              const status = d.DocumentVerifications?.[0]?.status || 'pending';
              const tone = status === 'approved' ? 'sage' : status === 'rejected' ? 'danger' : 'warning';
              return (
                <div
                  key={d.documentId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--sage-50)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <FileText size={14} style={{ color: 'var(--sage-700)' }} />
                    <span style={{ fontWeight: 600 }}>{d.DocumentType?.typeName || d.fileName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{d.fileName}</span>
                    <Badge tone={tone}>{status.toUpperCase()}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom: 8 }}>Allocated Hardware Assets</h2>
        {allocations.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '12px 0' }}>
            No hardware assets allocated.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8, paddingTop: 8 }}>
            {allocations.map((al) => (
              <div
                key={al.allocationId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--sage-50)',
                  fontSize: '0.8125rem',
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Laptop size={14} style={{ color: 'var(--sage-700)' }} />
                  <span style={{ fontWeight: 600 }}>{al.Asset?.AssetModel?.modelName || 'Laptop'}</span>
                  <span className="caption">({al.Asset?.assetTag})</span>
                </div>
                <Badge tone={al.acknowledgementStatus === 'acknowledged' ? 'sage' : 'warning'}>
                  {al.acknowledgementStatus.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
