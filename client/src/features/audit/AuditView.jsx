import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Modal, PageHeader, AnimatedList, AnimatedItem } from '../../components/common/ui';
import { TrendChart } from '../../components/common/charts';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';
import { auditApi } from '../../api/audit';

const ACTION_TONES = {
  LOGIN: 'info',
  LOGIN_FAILED: 'danger',
  CREATE_EMPLOYEE: 'sage',
  UPDATE_TASK_PROGRESS: 'sage',
  UPLOAD_DOCUMENT: 'info',
  VERIFY_DOCUMENT_APPROVED: 'sage',
  VERIFY_DOCUMENT_REJECTED: 'danger',
  ALLOCATE_ASSET: 'info',
  ASSET_ACKNOWLEDGED: 'sage',
  TRAINING_QUIZ_PASSED: 'sage',
  TRAINING_QUIZ_FAILED: 'danger',
  MFA_ENABLED: 'sage',
  MFA_DISABLED: 'warning',
  SLA_MARK_OVERDUE: 'warning',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AuditView() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const loadData = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 25 };
      if (actionFilter) params.action = actionFilter;

      const res = await auditApi.list(params);
      setLogs(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err?.response?.data?.message || 'Failed to load audit records from server.');
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  // Compute 7-day activity trend from logs
  const dayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  logs.forEach((log) => {
    const d = new Date(log.createdAt);
    const dayName = DAYS[d.getDay()];
    if (dayCounts[dayName] !== undefined) {
      dayCounts[dayName] += 1;
    }
  });

  const activityTrend = [
    { date: 'Mon', events: dayCounts.Mon },
    { date: 'Tue', events: dayCounts.Tue },
    { date: 'Wed', events: dayCounts.Wed },
    { date: 'Thu', events: dayCounts.Thu },
    { date: 'Fri', events: dayCounts.Fri },
    { date: 'Sat', events: dayCounts.Sat },
    { date: 'Sun', events: dayCounts.Sun },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Audit Trail"
        subtitle="Append-only compliance, authorization, and system security event log."
        actions={
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={() => loadData(pagination.page)} disabled={loading}>
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

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom: 14 }}>Security Event Frequency (Current Sample)</h2>
        <TrendChart
          data={activityTrend}
          xKey="date"
          series={[{ dataKey: 'events', name: 'Security Events', color: 'var(--chart-1)' }]}
          height={150}
        />
      </Card>

      <Card $p="var(--sp-5)">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Filter Action:
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--border-default)',
                fontSize: '0.8125rem',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="CREATE_EMPLOYEE">CREATE_EMPLOYEE</option>
              <option value="UPDATE_TASK_PROGRESS">UPDATE_TASK_PROGRESS</option>
              <option value="UPLOAD_DOCUMENT">UPLOAD_DOCUMENT</option>
              <option value="VERIFY_DOCUMENT_APPROVED">VERIFY_DOCUMENT_APPROVED</option>
              <option value="VERIFY_DOCUMENT_REJECTED">VERIFY_DOCUMENT_REJECTED</option>
              <option value="ALLOCATE_ASSET">ALLOCATE_ASSET</option>
              <option value="ASSET_ACKNOWLEDGED">ASSET_ACKNOWLEDGED</option>
              <option value="TRAINING_QUIZ_PASSED">TRAINING_QUIZ_PASSED</option>
              <option value="SLA_MARK_OVERDUE">SLA_MARK_OVERDUE</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} events)
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                variant="outline"
                size="xs"
                icon={ChevronLeft}
                disabled={pagination.page <= 1 || loading}
                onClick={() => loadData(pagination.page - 1)}
              />
              <Button
                variant="outline"
                size="xs"
                icon={ChevronRight}
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => loadData(pagination.page + 1)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading audit records...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <ShieldAlert size={32} style={{ margin: '0 auto 8px', color: 'var(--sage-400)' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
              No audit logs recorded
            </div>
          </div>
        ) : (
          <AnimatedList style={{ display: 'grid', gap: 8 }}>
            {logs.map((log) => {
              const tone = ACTION_TONES[log.action] || 'neutral';
              const actorName = log.Actor?.username || 'System Engine';

              return (
                <AnimatedItem key={log.logId}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 14px',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Badge tone={tone}>{log.action}</Badge>

                    <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {log.action.replace(/_/g, ' ')}
                      </div>
                      <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                        <span>Actor: {actorName}</span>
                        <span>·</span>
                        <span>Target: {log.targetTable || '—'} {log.targetId ? `(#${log.targetId})` : ''}</span>
                        <span>·</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {log.ipAddress && (
                      <span className="caption" style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {log.ipAddress}
                      </span>
                    )}

                    {log.details && (
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Eye}
                        onClick={() => setSelectedLog(log)}
                      >
                        Inspect Details
                      </Button>
                    )}
                  </div>
                </AnimatedItem>
              );
            })}
          </AnimatedList>
        )}
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Event #${selectedLog?.logId}: ${selectedLog?.action}`}
        description={`Recorded at ${selectedLog?.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : ''}`}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button onClick={() => setSelectedLog(null)}>Close</Button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Actor User:</span>
            <span style={{ fontWeight: 600 }}>{selectedLog?.Actor?.username || 'System Engine'} ({selectedLog?.Actor?.email || 'N/A'})</span>

            <span style={{ color: 'var(--text-muted)' }}>IP Address:</span>
            <span>{selectedLog?.ipAddress || 'Internal / N/A'}</span>

            <span style={{ color: 'var(--text-muted)' }}>User Agent:</span>
            <span style={{ wordBreak: 'break-all' }}>{selectedLog?.userAgent || 'Internal System'}</span>

            <span style={{ color: 'var(--text-muted)' }}>Target:</span>
            <span>{selectedLog?.targetTable} #{selectedLog?.targetId}</span>
          </div>

          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6 }}>Payload / State Details</div>
            <pre
              style={{
                background: 'var(--bg-sunken)',
                padding: 12,
                borderRadius: 'var(--r-md)',
                fontSize: '0.75rem',
                overflowX: 'auto',
                color: 'var(--text-primary)',
              }}
            >
              {JSON.stringify(selectedLog?.details, null, 2)}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
}
