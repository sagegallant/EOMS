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
  Avatar,
  Input,
  Label,
  Select,
} from '../../components/common/ui';
import { MiniDonut, HorizontalBar, StackedBarChart } from '../../components/common/charts';
import {
  Laptop,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  RotateCcw,
  Check,
  Tag,
  Hash,
  Calendar,
  User,
  Cpu,
  Shield,
  Monitor,
  HardDrive,
  Sparkles,
  ArrowRight,
  ShieldCheck,
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

const PRESET_SPECS = [
  'Standard Engineering Stack (Node, Python, Docker, IDEs)',
  'Zero-Trust Corporate VPN & SSL Certificates Installed',
  'Hardware FIDO2 Security Token Paired & Registered',
  'Full-Disk Encryption (BitLocker/FileVault) Verified',
];

function getCategoryIcon(catName = '') {
  const c = (catName || '').toLowerCase();
  if (c.includes('laptop') || c.includes('workstation')) return Laptop;
  if (c.includes('display') || c.includes('monitor')) return Monitor;
  if (c.includes('token') || c.includes('security') || c.includes('yubi')) return Shield;
  return HardDrive;
}


export default function AssetsView() {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'ALLOCATED' | 'PENDING_ACK'

  // Add Asset Modal
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [addAssetForm, setAddAssetForm] = useState({
    modelId: '',
    assetTag: '',
    serialNumber: '',
    purchasedAt: '',
    warrantyExpiry: '',
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState(null);

  // Delete Asset Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

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
      let fetchedAssets = assetsRes.data || [];
      let fetchedAllocs = allocsRes.data || [];

      if (!isITOrAdmin && user?.employeeId) {
        fetchedAllocs = fetchedAllocs.filter(al => Number(al.employeeId) === Number(user.employeeId));
        const myAssetIds = new Set(fetchedAllocs.map(al => al.assetId));
        fetchedAssets = fetchedAssets.filter(a => myAssetIds.has(a.assetId));
      }

      setAssets(fetchedAssets);
      setAllocations(fetchedAllocs);

      if (isITOrAdmin) {
        try {
          const [empRes, modelsRes] = await Promise.all([
            employeeApi.list(),
            assetApi.getModels(),
          ]);
          setEmployees(empRes.data || []);
          setAvailableModels(modelsRes.data || []);
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

  const handleAddAssetSubmit = async (e) => {
    e.preventDefault();
    if (!addAssetForm.modelId || !addAssetForm.assetTag || !addAssetForm.serialNumber) {
      setAddError('Model, Asset Tag, and Serial Number are required.');
      return;
    }

    try {
      setAddSubmitting(true);
      setAddError(null);
      await assetApi.create({
        modelId: Number(addAssetForm.modelId),
        assetTag: addAssetForm.assetTag.trim(),
        serialNumber: addAssetForm.serialNumber.trim(),
        purchasedAt: addAssetForm.purchasedAt || undefined,
        warrantyExpiry: addAssetForm.warrantyExpiry || undefined,
      });
      setAddAssetModalOpen(false);
      setAddAssetForm({
        modelId: '',
        assetTag: '',
        serialNumber: '',
        purchasedAt: '',
        warrantyExpiry: '',
      });
      await loadData();
    } catch (err) {
      console.error('Failed to create asset:', err);
      setAddError(err?.response?.data?.message || 'Failed to register hardware asset.');
    } finally {
      setAddSubmitting(false);
    }
  };

  const handleDeleteClick = (asset) => {
    setDeleteError(null);
    setAssetToDelete(asset);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    try {
      setDeleteSubmitting(true);
      setDeleteError(null);
      await assetApi.delete(assetToDelete.assetId);
      setDeleteModalOpen(false);
      setAssetToDelete(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setDeleteError(err?.response?.data?.message || 'Failed to delete asset.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleModelSelect = (modelId) => {
    const selected = availableModels.find((m) => Number(m.modelId) === Number(modelId));
    let tagPrefix = 'AST-';
    if (selected) {
      const name = (selected.modelName || '').toLowerCase();
      if (name.includes('macbook')) tagPrefix = 'BLR-MBP-2026-';
      else if (name.includes('thinkpad')) tagPrefix = 'BLR-TP-2026-';
      else if (name.includes('ultrasharp')) tagPrefix = 'BLR-MON-2026-';
      else if (name.includes('yubi')) tagPrefix = 'SEC-KEY-2026-';
    }
    setAddAssetForm((prev) => ({
      ...prev,
      modelId,
      assetTag: prev.assetTag && !prev.assetTag.startsWith('BLR-') && !prev.assetTag.startsWith('SEC-') && !prev.assetTag.startsWith('AST-')
        ? prev.assetTag
        : tagPrefix,
    }));
  };

  const handleTogglePreset = (preset) => {
    setAllocateForm((prev) => {
      const existing = prev.notes || '';
      if (existing.includes(preset)) {
        const updated = existing
          .split(' | ')
          .filter((p) => p.trim() !== preset)
          .join(' | ');
        return { ...prev, notes: updated };
      } else {
        const updated = existing ? `${existing} | ${preset}` : preset;
        return { ...prev, notes: updated };
      }
    });
  };

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
  const selectedAssetToAllocate = availableAssetsToAllocate.find(
    (a) => Number(a.assetId) === Number(allocateForm.assetId)
  );
  const selectedEmployeeToAllocate = employees.find(
    (e) => Number(e.employeeId) === Number(allocateForm.employeeId)
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Assets"
        subtitle="Hardware provisioning, inventory management, and receipt acknowledgement."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadData} disabled={loading}>
              Refresh
            </Button>
            {isITOrAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    setAddError(null);
                    setAddAssetForm({
                      modelId: availableModels[0]?.modelId || '',
                      assetTag: '',
                      serialNumber: '',
                      purchasedAt: new Date().toISOString().split('T')[0],
                      warrantyExpiry: '',
                    });
                    setAddAssetModalOpen(true);
                  }}
                >
                  Add Asset
                </Button>
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
              </>
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

                      {isITOrAdmin && (
                        <Button
                          size="xs"
                          variant="dangerSoft"
                          icon={Trash2}
                          onClick={() => handleDeleteClick(a)}
                          title="Delete Asset"
                        >
                          Delete
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
        title="Provision Hardware to Employee"
        description="Deploy central in-stock inventory and initiate formal digital receipt acknowledgement."
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              icon={CheckCircle2}
              disabled={allocateSubmitting || availableAssetsToAllocate.length === 0}
              onClick={handleAllocateSubmit}
            >
              {allocateSubmitting ? 'Allocating...' : 'Allocate Equipment'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAllocateSubmit} style={{ display: 'grid', gap: 18 }}>
          {allocateError && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--danger-border)' }}>
              <AlertCircle size={16} />
              <span>{allocateError}</span>
            </div>
          )}

          {/* Section 1: In-Stock Asset */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Laptop size={14} style={{ color: 'var(--sage-700)' }} />
              <Label style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
                AVAILABLE HARDWARE ASSET *
              </Label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {availableAssetsToAllocate.length} in stock
              </span>
            </div>

            {availableAssetsToAllocate.length === 0 ? (
              <div style={{ padding: '14px', borderRadius: 'var(--r-md)', background: 'var(--warning-bg, #fef3c7)', border: '1px solid var(--warning-border, #fde68a)', color: 'var(--warning-text, #92400e)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={18} />
                <div>
                  No hardware assets currently in stock. Please use <strong>"Add Asset"</strong> first to catalog new equipment.
                </div>
              </div>
            ) : (
              <Select
                value={allocateForm.assetId}
                onChange={(e) => setAllocateForm({ ...allocateForm, assetId: e.target.value })}
                required
              >
                <option value="">Choose equipment from in-stock inventory…</option>
                {availableAssetsToAllocate.map((a) => (
                  <option key={a.assetId} value={a.assetId}>
                    [{a.assetTag}] {a.AssetModel?.modelName} (SN: {a.serialNumber})
                  </option>
                ))}
              </Select>
            )}

            {/* Selected Asset Preview Card */}
            {selectedAssetToAllocate && (
              <div
                style={{
                  marginTop: 10,
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--sage-50)',
                  border: '1px solid var(--sage-200)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--sage-900)' }}>
                    {selectedAssetToAllocate.AssetModel?.modelName}
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    <span>Tag: <strong>{selectedAssetToAllocate.assetTag}</strong></span>
                    <span>·</span>
                    <span>Serial: <strong>{selectedAssetToAllocate.serialNumber}</strong></span>
                    <span>·</span>
                    <span>{selectedAssetToAllocate.AssetModel?.AssetCategory?.categoryName || 'General'}</span>
                  </div>
                </div>
                <Badge tone="info">READY TO ALLOCATE</Badge>
              </div>
            )}
          </div>

          {/* Section 2: Target Recipient */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <User size={14} style={{ color: 'var(--sage-700)' }} />
              <Label style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
                TARGET RECIPIENT EMPLOYEE *
              </Label>
            </div>

            <Select
              value={allocateForm.employeeId}
              onChange={(e) => setAllocateForm({ ...allocateForm, employeeId: e.target.value })}
              required
            >
              <option value="">Select target employee…</option>
              {employees.map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.firstName} {emp.lastName} — {emp.Position?.jobTitle || 'Team Member'} ({emp.workLocation || 'Bengaluru'})
                </option>
              ))}
            </Select>

            {/* Selected Employee Preview Card */}
            {selectedEmployeeToAllocate && (
              <div
                style={{
                  marginTop: 10,
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Avatar
                  name={`${selectedEmployeeToAllocate.firstName} ${selectedEmployeeToAllocate.lastName}`}
                  size={36}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {selectedEmployeeToAllocate.firstName} {selectedEmployeeToAllocate.lastName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    {selectedEmployeeToAllocate.Position?.jobTitle || 'Team Member'} · {selectedEmployeeToAllocate.Position?.Department?.deptName || 'Department'} · {selectedEmployeeToAllocate.workLocation || 'Bengaluru'}
                  </div>
                </div>
                <Badge tone="sage">ACTIVE RECIPIENT</Badge>
              </div>
            )}
          </div>

          {/* Section 3: Provisioning Presets & Specs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Cpu size={14} style={{ color: 'var(--sage-700)' }} />
              <Label style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
                IMAGE CONFIGURATION & SECURITY PRESETS
              </Label>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {PRESET_SPECS.map((preset) => {
                const isSelected = (allocateForm.notes || '').includes(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleTogglePreset(preset)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--r-full)',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      transition: 'all var(--t-fast)',
                      borderColor: isSelected ? 'var(--sage-600)' : 'var(--border-default)',
                      background: isSelected ? 'var(--sage-100)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--sage-900)' : 'var(--text-secondary)',
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {preset}
                  </button>
                );
              })}
            </div>

            <textarea
              rows={2}
              value={allocateForm.notes}
              onChange={(e) => setAllocateForm({ ...allocateForm, notes: e.target.value })}
              placeholder="Custom provisioning specifications, VPN credentials, or serial handover notes…"
              style={{
                width: '100%',
                padding: '9px 13px',
                borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--border-default)',
                fontSize: '0.8125rem',
                fontFamily: 'inherit',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>

          {/* Policy Banner */}
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--r-md)',
              background: 'var(--sage-50)',
              border: '1px solid var(--sage-200)',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <ShieldCheck size={16} style={{ color: 'var(--sage-700)', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--sage-800)', lineHeight: 1.4 }}>
              <strong>Automated Receipt Workflow:</strong> Allocation immediately dispatches an in-app notification to the employee. The employee is prompted to verify hardware condition and digitally acknowledge custody upon physical delivery.
            </div>
          </div>
        </form>
      </Modal>

      {/* Register Hardware Asset Modal */}
      <Modal
        isOpen={addAssetModalOpen}
        onClose={() => setAddAssetModalOpen(false)}
        title="Register Hardware Asset"
        description="Catalog a newly procured hardware item into central corporate inventory."
        footer={
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setAddAssetModalOpen(false)}>
              Cancel
            </Button>
            <Button icon={Plus} disabled={addSubmitting} onClick={handleAddAssetSubmit}>
              {addSubmitting ? 'Registering...' : 'Register Hardware Asset'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddAssetSubmit} style={{ display: 'grid', gap: 18 }}>
          {addError && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--danger-border)' }}>
              <AlertCircle size={16} />
              <span>{addError}</span>
            </div>
          )}

          {/* Section 1: Catalog Model Selection Cards */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Cpu size={14} style={{ color: 'var(--sage-700)' }} />
              <Label style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
                SELECT CATALOG MODEL *
              </Label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {availableModels.map((m) => {
                const isSelected = Number(addAssetForm.modelId) === Number(m.modelId);
                const ModelIcon = getCategoryIcon(m.AssetCategory?.categoryName);
                return (
                  <div
                    key={m.modelId}
                    onClick={() => handleModelSelect(m.modelId)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--r-md)',
                      border: `1.5px solid ${isSelected ? 'var(--sage-700)' : 'var(--border-default)'}`,
                      background: isSelected ? 'var(--sage-50)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      transition: 'all var(--t-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 'var(--r-sm)',
                          background: isSelected ? 'var(--sage-100)' : 'var(--bg-subtle)',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <ModelIcon size={15} style={{ color: isSelected ? 'var(--sage-700)' : 'var(--text-muted)' }} />
                      </div>
                      <Badge tone={isSelected ? 'sage' : 'neutral'}>
                        {m.AssetCategory?.categoryName?.split(' ')[0] || 'Hardware'}
                      </Badge>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: isSelected ? 'var(--sage-900)' : 'var(--text-primary)', marginTop: 2 }}>
                      {m.modelName}
                    </div>

                    {m.specs && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 'auto' }}>
                        {m.specs}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Hardware Identification */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Tag size={14} style={{ color: 'var(--sage-700)' }} />
              <Label style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
                HARDWARE IDENTIFICATION *
              </Label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <Label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Tag size={12} /> Asset Tag / Inventory ID *
                </Label>
                <Input
                  type="text"
                  required
                  value={addAssetForm.assetTag}
                  onChange={(e) => setAddAssetForm({ ...addAssetForm, assetTag: e.target.value })}
                  placeholder="e.g. BLR-MBP-2026-115"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Internal IT barcode / tracking identifier
                </span>
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <Label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Hash size={12} /> Manufacturer Serial Number *
                </Label>
                <Input
                  type="text"
                  required
                  value={addAssetForm.serialNumber}
                  onChange={(e) => setAddAssetForm({ ...addAssetForm, serialNumber: e.target.value })}
                  placeholder="e.g. C02XYZ2026M3"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Factory OEM serial stamped on chassis
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Procurement & Warranty Lifecycle */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Calendar size={14} style={{ color: 'var(--sage-700)' }} />
              <Label style={{ fontSize: '0.75rem', fontWeight: 700, margin: 0, letterSpacing: '0.04em' }}>
                PROCUREMENT & WARRANTY DATES
              </Label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'grid', gap: 6 }}>
                <Label>Procurement Date</Label>
                <Input
                  type="date"
                  value={addAssetForm.purchasedAt}
                  onChange={(e) => setAddAssetForm({ ...addAssetForm, purchasedAt: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <Label>Warranty Expiry</Label>
                <Input
                  type="date"
                  value={addAssetForm.warrantyExpiry}
                  onChange={(e) => setAddAssetForm({ ...addAssetForm, warrantyExpiry: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>


      {/* Delete Hardware Asset Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAssetToDelete(null);
        }}
        title="Delete Hardware Asset"
        description="Verify equipment status before removing from central inventory."
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', width: '100%' }}>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setAssetToDelete(null);
              }}
            >
              Cancel
            </Button>
            {assetToDelete &&
            (assetToDelete.status === 'allocated' ||
              (assetToDelete.AssetAllocations || []).some((al) => !al.returnedAt)) ? (
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setAssetToDelete(null);
                }}
              >
                Close
              </Button>
            ) : (
              <Button
                variant="danger"
                icon={Trash2}
                disabled={deleteSubmitting}
                onClick={handleDeleteConfirm}
              >
                {deleteSubmitting ? 'Deleting...' : 'Delete Asset'}
              </Button>
            )}
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 14 }}>
          {deleteError && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg)', color: 'var(--danger)', fontSize: '0.8125rem' }}>
              {deleteError}
            </div>
          )}

          {assetToDelete &&
          (assetToDelete.status === 'allocated' ||
            (assetToDelete.AssetAllocations || []).some((al) => !al.returnedAt)) ? (
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '12px',
                borderRadius: 'var(--r-md)',
                background: 'var(--warning-bg, #fef3c7)',
                color: 'var(--warning-text, #92400e)',
                border: '1px solid var(--warning-border, #fde68a)',
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Active Allocation Protection</div>
                <div style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                  Cannot delete <strong>{assetToDelete.assetTag}</strong> ({assetToDelete.AssetModel?.modelName}) because it is currently allocated to an employee.
                  The hardware must be formally returned into stock before it can be deleted.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete hardware asset{' '}
              <strong>{assetToDelete?.assetTag}</strong> ({assetToDelete?.AssetModel?.modelName}, Serial: {assetToDelete?.serialNumber})?
              <br /><br />
              This will permanently remove the equipment from inventory and record this action in the audit log.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

