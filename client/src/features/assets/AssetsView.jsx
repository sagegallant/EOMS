import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Badge,
  Modal,
  AnimatedList,
  AnimatedItem,
  PageHeader,
  KpiCard,
} from '../../components/common/ui';
import { MiniDonut, HorizontalBar, StackedBarChart } from '../../components/common/charts';
import {
  Laptop,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { assetApi } from '../../api/assets';
import { employeeApi } from '../../api/employees';
import { useAuthStore } from '../../store/authStore';

const STATUS_TONE = {
  in_stock: 'info',
  allocated: 'sage',
  in_repair: 'warning',
  retired: 'danger',
};

const ACK_TONE = {
  acknowledged: 'sage',
  pending: 'warning',
  disputed: 'danger',
};

export default function AssetsView() {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'ALLOCATED' | 'PENDING_ACK'

  // Allocation Modal
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [allocateForm, setAllocateForm] = useState({ assetId: '', employeeId: '', notes: '' });
  const [allocateSubmitting, setAllocateSubmitting] = useState(false);
  const [allocateError, setAllocateError] = useState(null);

  // Acknowledging action
  const [ackLoadingId, setAckLoadingId] = useState(null);

  const isITOrAdmin = user?.roles?.some((r) =>
    ['IT_ADMIN', 'SYSTEM_ADMIN', 'HR_ADMIN'].includes(r)
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [assetsRes, allocsRes] = await Promise.all([
        assetApi.list(),
        assetApi.listAllocations(),
      ]);
      setAssets(assetsRes.data || []);
      setAllocations(allocsRes.data || []);

      if (isITOrAdmin) {
        try {
          const empRes = await employeeApi.list();
          setEmployees(empRes.data || []);
        } catch {
          // non-critical
        }
      }
    } catch (err) {
      console.error('Failed to load asset data:', err);
      setError(err?.response?.data?.message || 'Failed to load assets from server.');
    } finally {
      setLoading(false);
    }
  }, [isITOrAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!allocateForm.assetId || !allocateForm.employeeId) {
      setAllocateError('Please select both an asset and an employee.');
      return;
    }

    try {
      setAllocateSubmitting(true);
      setAllocateError(null);
      await assetApi.allocate({
        assetId: Number(allocateForm.assetId),
        employeeId: Number(allocateForm.employeeId),
        notes: allocateForm.notes || undefined,
      });
      setAllocateModalOpen(false);
      setAllocateForm({ assetId: '', employeeId: '', notes: '' });
      await loadData();
    } catch (err) {
      console.error('Allocation failed:', err);
      setAllocateError(err?.response?.data?.message || 'Failed to allocate asset.');
    } finally {
      setAllocateSubmitting(false);
    }
  };

  const handleAcknowledge = async (allocationId) => {
    try {
      setAckLoadingId(allocationId);
      await assetApi.acknowledge(allocationId, { acknowledgementStatus: 'acknowledged' });
      await loadData();
    } catch (err) {
      console.error('Acknowledgement failed:', err);
      alert(err?.response?.data?.message || 'Failed to acknowledge asset allocation.');
    } finally {
      setAckLoadingId(null);
    }
  };

  // KPIs
  const totalAssets = assets.length;
  const inStockAssets = assets.filter((a) => a.status === 'in_stock').length;
  const allocatedAssets = assets.filter((a) => a.status === 'allocated').length;
  const pendingAcks = allocations.filter((al) => al.acknowledgementStatus === 'pending').length;
  const acknowledgedAcks = allocations.filter((al) => al.acknowledgementStatus === 'acknowledged').length;

  // By Category Breakdown
  const catMap = {};
  assets.forEach((a) => {
    const cat = a.AssetModel?.AssetCategory?.categoryName || 'Hardware';
    catMap[cat] = (catMap[cat] || 0) + 1;
  });
  const byCategory = Object.entries(catMap).map(([name, count]) => ({ name, count }));

  // By Location / Tech Hub Breakdown
  const hubMap = {};
  allocations.forEach((al) => {
    const loc = al.Employee?.workLocation || 'Bengaluru';
    const hub = loc.split(' ')[0]; // extract city
    hubMap[hub] = (hubMap[hub] || 0) + 1;
  });
  const byHub = Object.entries(hubMap).map(([label, value]) => ({
    label,
    value,
    displayValue: `${value} allocated`,
  }));

  // Filtered Assets / Allocations list
  const availableAssetsToAllocate = assets.filter((a) => a.status === 'in_stock');

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Assets"
        subtitle="Hardware provisioning, inventory management, and receipt acknowledgement."
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
              Refresh
            </Button>
            {isITOrAdmin && (
              <Button
                size="sm"
                icon={Plus}
                onClick={() => {
                  setAllocateError(null);
                  setAllocateModalOpen(true);
                }}
              >
                Allocate Hardware
              </Button>
            )}
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 'var(--sp-4)' }}>
        <KpiCard icon={Laptop} label="Total Assets" value={totalAssets} />
        <KpiCard icon={CheckCircle2} label="Allocated" value={allocatedAssets} />
        <KpiCard icon={Clock} label="In Stock" value={inStockAssets} />
        <KpiCard icon={Check} label="Acknowledged" value={acknowledgedAcks} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom: 14 }}>Inventory By Category</h2>
          {byCategory.length > 0 ? (
            <StackedBarChart
              data={byCategory}
              xKey="name"
              categories={[{ dataKey: 'count', name: 'Assets', color: 'var(--chart-1)' }]}
              height={140}
            />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No categories registered.</div>
          )}
        </Card>
        <Card $p="var(--sp-5)">
          <h2 className="section-title" style={{ marginBottom: 12 }}>Allocations By Tech Hub</h2>
          {byHub.length > 0 ? (
            <HorizontalBar items={byHub} colorVar="--chart-1" />
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No active allocations recorded.</div>
          )}
        </Card>
      </div>

      {/* Allocations & Hardware Registry */}
      <Card $p="var(--sp-5)">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'ALL', label: 'All Assets' },
              { id: 'IN_STOCK', label: `In Stock (${inStockAssets})` },
              { id: 'ALLOCATED', label: `Allocated (${allocatedAssets})` },
              { id: 'PENDING_ACK', label: `Pending Ack (${pendingAcks})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTab(f.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: '1.5px solid',
                  cursor: 'pointer',
                  transition: 'all var(--t-fast)',
                  borderColor: tab === f.id ? 'var(--sage-600)' : 'var(--border-default)',
                  background: tab === f.id ? 'var(--sage-100)' : 'transparent',
                  color: tab === f.id ? 'var(--sage-800)' : 'var(--text-muted)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Showing {tab === 'PENDING_ACK' ? allocations.length : assets.length} items
          </span>
        </div>

        {tab === 'PENDING_ACK' ? (
          /* Allocations Table */
          <AnimatedList style={{ display: 'grid', gap: 8 }}>
            {allocations
              .filter((al) => al.acknowledgementStatus === 'pending')
              .map((al) => {
                const isAssignedToMe = user?.employeeId && Number(user.employeeId) === Number(al.employeeId);
                const canAcknowledge = isAssignedToMe || isITOrAdmin;

                return (
                  <AnimatedItem key={al.allocationId}>
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
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--r-md)',
                          background: 'var(--sage-100)',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Laptop size={18} style={{ color: 'var(--sage-700)' }} />
                      </div>
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {al.Asset?.AssetModel?.modelName || 'Hardware Asset'} ({al.Asset?.assetTag})
                        </div>
                        <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                          <span>Recipient: {al.Employee?.firstName} {al.Employee?.lastName}</span>
                          <span>·</span>
                          <span>Serial: {al.Asset?.serialNumber}</span>
                          <span>·</span>
                          <span>Allocated: {new Date(al.allocatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge tone={ACK_TONE[al.acknowledgementStatus] || 'warning'}>
                        {al.acknowledgementStatus.toUpperCase()}
                      </Badge>
                      {canAcknowledge && (
                        <Button
                          size="xs"
                          variant="soft"
                          icon={CheckCircle2}
                          isLoading={ackLoadingId === al.allocationId}
                          onClick={() => handleAcknowledge(al.allocationId)}
                        >
                          Acknowledge Receipt
                        </Button>
                      )}
                    </div>
                  </AnimatedItem>
                );
              })}
          </AnimatedList>
        ) : (
          /* Assets List */
          <AnimatedList style={{ display: 'grid', gap: 8 }}>
            {assets
              .filter((a) => {
                if (tab === 'IN_STOCK') return a.status === 'in_stock';
                if (tab === 'ALLOCATED') return a.status === 'allocated';
                return true;
              })
              .map((a) => {
                const activeAlloc = a.AssetAllocations?.[0];
                const empName = activeAlloc?.Employee
                  ? `${activeAlloc.Employee.firstName} ${activeAlloc.Employee.lastName}`
                  : null;

                return (
                  <AnimatedItem key={a.assetId}>
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
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--r-md)',
                          background: 'var(--sage-100)',
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Laptop size={18} style={{ color: 'var(--sage-700)' }} />
                      </div>
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {a.AssetModel?.modelName || 'Hardware Asset'}
                        </div>
                        <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                          <span>Tag: {a.assetTag}</span>
                          <span>·</span>
                          <span>Serial: {a.serialNumber}</span>
                          <span>·</span>
                          <span>Category: {a.AssetModel?.AssetCategory?.categoryName || 'General'}</span>
                          {empName && (
                            <>
                              <span>·</span>
                              <span style={{ color: 'var(--sage-800)', fontWeight: 600 }}>Assigned to: {empName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <Badge tone={STATUS_TONE[a.status] || 'neutral'}>
                        {a.status.replace('_', ' ').toUpperCase()}
                      </Badge>

                      {activeAlloc && activeAlloc.acknowledgementStatus === 'pending' && (
                        <Badge tone="warning">ACK PENDING</Badge>
                      )}

                      {activeAlloc &&
                        activeAlloc.acknowledgementStatus === 'pending' &&
                        (user?.employeeId === activeAlloc.employeeId || isITOrAdmin) && (
                          <Button
                            size="xs"
                            variant="soft"
                            icon={CheckCircle2}
                            isLoading={ackLoadingId === activeAlloc.allocationId}
                            onClick={() => handleAcknowledge(activeAlloc.allocationId)}
                          >
                            Acknowledge
                          </Button>
                        )}
                    </div>
                  </AnimatedItem>
                );
              })}
          </AnimatedList>
        )}
      </Card>

      {/* Allocate Hardware Modal */}
      <Modal
        isOpen={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        title="Provision Hardware Asset"
        description="Assign in-stock equipment to an onboarded employee."
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button icon={CheckCircle2} disabled={allocateSubmitting} onClick={handleAllocateSubmit}>
              {allocateSubmitting ? 'Allocating...' : 'Allocate Equipment'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAllocateSubmit} style={{ display: 'grid', gap: 14 }}>
          {allocateError && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>
              {allocateError}
            </div>
          )}

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Select In-Stock Asset *</label>
            <select
              value={allocateForm.assetId}
              onChange={(e) => setAllocateForm({ ...allocateForm, assetId: e.target.value })}
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
              <option value="">Select Asset...</option>
              {availableAssetsToAllocate.map((a) => (
                <option key={a.assetId} value={a.assetId}>
                  {a.assetTag} — {a.AssetModel?.modelName} (SN: {a.serialNumber})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Target Employee *</label>
            <select
              value={allocateForm.employeeId}
              onChange={(e) => setAllocateForm({ ...allocateForm, employeeId: e.target.value })}
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
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.firstName} {emp.lastName} ({emp.workLocation || 'Bengaluru'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gap: 6 }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Provisioning Notes / Specs</label>
            <textarea
              rows={2}
              value={allocateForm.notes}
              onChange={(e) => setAllocateForm({ ...allocateForm, notes: e.target.value })}
              placeholder="e.g. Pre-loaded with standard engineering image & VPN certs"
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
        </form>
      </Modal>
    </div>
  );
}
