import { useState, useEffect } from 'react';
import { Card, Button, Badge, Avatar, AnimatedList, AnimatedItem, PageHeader, Modal, Input, Label, Select } from '../../components/common/ui';
import { HorizontalBar, MiniDonut } from '../../components/common/charts';
import {
  Plus,
  Search,
  Filter,
  X,
  MapPin,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Briefcase,
  Eye,
  EyeOff,
  UserX,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Laptop,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../api/employees';
import { assetApi } from '../../api/assets';
import { useAuthStore } from '../../store/authStore';


export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('active'); // 'active' | 'inactive' | 'all'

  // Add Employee Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    password: '',
    positionId: '',
    managerId: '',
    buddyId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    workLocation: 'Bengaluru (Hybrid)',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRel: 'Spouse',
  });

  // Action states for Deactivate & Delete
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('SYSTEM_ADMIN');
  const isITAdmin = user?.roles?.includes('IT_ADMIN');
  const isITOnly = isITAdmin && !isAdmin;
  const canAdd = user?.roles?.some(r => ['HR_ADMIN', 'HR_SPECIALIST', 'SYSTEM_ADMIN'].includes(r));

  const [allocations, setAllocations] = useState([]);
  const [filterAllocatedOnly, setFilterAllocatedOnly] = useState(isITOnly);

  const loadData = async (statusOverride = filterStatus) => {
    setLoading(true);
    setError(null);
    try {
      const calls = [
        employeeApi.list({ status: statusOverride }),
        employeeApi.getDepartments().catch(() => ({ data: [] })),
        employeeApi.getPositions().catch(() => ({ data: [] })),
      ];
      if (isITAdmin) {
        calls.push(assetApi.listAllocations({ activeOnly: 'true' }).catch(() => ({ data: [] })));
      }
      const [empRes, deptRes, posRes, allocRes] = await Promise.all(calls);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setPositions(posRes.data || []);
      if (allocRes) {
        setAllocations(allocRes.data || []);
      }
      if (posRes.data?.length > 0 && !newEmp.positionId) {
        setNewEmp(prev => ({ ...prev, positionId: posRes.data[0].positionId }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load employee directory.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const handleStatusFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    loadData(newStatus);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newEmp.password || newEmp.password.length < 8) {
      setFormError('Initial password is required and must be at least 8 characters long.');
      return;
    }
    setSubmitting(true);
    try {
      await employeeApi.create({
        firstName: newEmp.firstName.trim(),
        lastName: newEmp.lastName.trim(),
        workEmail: newEmp.workEmail.trim(),
        password: newEmp.password,
        positionId: Number(newEmp.positionId),
        managerId: newEmp.managerId ? Number(newEmp.managerId) : undefined,
        buddyId: newEmp.buddyId ? Number(newEmp.buddyId) : undefined,
        hireDate: newEmp.hireDate,
        workLocation: newEmp.workLocation,
        emergencyContact: newEmp.emergencyName ? {
          name: newEmp.emergencyName,
          phone: newEmp.emergencyPhone,
          relationship: newEmp.emergencyRel,
        } : undefined,
      });

      setIsModalOpen(false);
      setShowPassword(false);
      setNewEmp({
        firstName: '',
        lastName: '',
        workEmail: '',
        password: '',
        positionId: positions[0]?.positionId || '',
        managerId: '',
        buddyId: '',
        hireDate: new Date().toISOString().slice(0, 10),
        workLocation: 'Bengaluru (Hybrid)',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRel: 'Spouse',
      });
      setFilterStatus('active');
      await loadData('active');
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setActionLoading(true);
    setActionError('');
    try {
      await employeeApi.deactivate(deactivateTarget.employeeId);
      setDeactivateTarget(null);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to deactivate employee.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async (emp) => {
    setActionLoading(true);
    try {
      await employeeApi.reactivate(emp.employeeId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to reactivate employee.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    setActionError('');
    try {
      await employeeApi.delete(deleteTarget.employeeId);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete employee.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter logic
  const managers = employees.filter(emp => {
    const roles = emp.SystemUser?.Roles?.map(r => r.roleName) || [];
    const title = (emp.Position?.jobTitle || '').toLowerCase();
    const grade = (emp.Position?.jobGrade || '').toUpperCase();
    const isManagerRole = roles.some(r =>
      ['DEPARTMENT_MANAGER', 'MANAGER', 'SYSTEM_ADMIN', 'HR_ADMIN'].includes(r)
    );
    const isManagerTitle = title.includes('manager') || title.includes('director') || title.includes('head') || title.includes('lead') || title.includes('vp');
    const isManagerGrade = grade.startsWith('M');
    return isManagerRole || isManagerTitle || isManagerGrade;
  });

  // Allocation mapping for IT role
  const allocationsByEmployee = {};
  allocations.forEach((al) => {
    if (!al.returnedAt) {
      const empId = Number(al.employeeId);
      if (!allocationsByEmployee[empId]) {
        allocationsByEmployee[empId] = [];
      }
      allocationsByEmployee[empId].push(al);
    }
  });

  const employeesWithHardwareCount = employees.filter(
    (e) => (allocationsByEmployee[Number(e.employeeId)] || []).length > 0
  ).length;

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const role = (e.Position?.jobTitle || e.Position?.title || '').toLowerCase();
    const dept = e.Position?.Department?.deptName || '';

    if (q && !fullName.includes(q) && !role.includes(q) && !e.workEmail?.toLowerCase().includes(q)) return false;
    if (filterDept !== 'ALL' && dept !== filterDept) return false;
    if (isITAdmin && filterAllocatedOnly && !(allocationsByEmployee[Number(e.employeeId)]?.length > 0)) return false;
    return true;
  });


  // Dynamic Metrics derived from real data
  const onTrackCount = employees.filter(e => (e.OnboardingPlan?.progressPercent || 0) >= 50).length;
  const justStartedCount = employees.filter(e => (e.OnboardingPlan?.progressPercent || 0) < 50 && (e.OnboardingPlan?.progressPercent || 0) > 0).length;
  const notStartedCount = employees.filter(e => (e.OnboardingPlan?.progressPercent || 0) === 0).length;

  // Department distribution
  const deptCounts = {};
  employees.forEach(e => {
    const dName = e.Position?.Department?.deptName || 'Unassigned';
    deptCounts[dName] = (deptCounts[dName] || 0) + 1;
  });
  const deptBars = Object.entries(deptCounts).map(([label, count]) => ({
    label,
    value: count,
    displayValue: `${count} ${count === 1 ? 'employee' : 'employees'}`,
  }));

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader
        title="Employee Directory"
        subtitle={`${filtered.length} of ${employees.length} corporate employees listed`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => loadData()} isLoading={loading}>
              Refresh
            </Button>
            {canAdd && (
              <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
                Add Employee
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <Card $p="var(--sp-4)" style={{ background:'var(--danger-bg)', borderColor:'var(--danger-border)', color:'var(--danger)', display:'flex', alignItems:'center', gap:10 }}>
          <AlertCircle size={18} />
          <span style={{ fontSize:'0.875rem' }}>{error}</span>
          <Button size="xs" variant="secondary" onClick={() => loadData()} style={{ marginLeft:'auto' }}>Retry</Button>
        </Card>
      )}

      {/* Aggregate KPI Overview */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-4)' }}>
        {isITOnly ? (
          <Card $p="var(--sp-4)">
            <div className="label-caps" style={{ marginBottom:12 }}>Hardware Provisioning Coverage</div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <MiniDonut
                value={employeesWithHardwareCount}
                total={employees.length || 1}
                label={`${employeesWithHardwareCount}`}
                sublabel="allocated"
                size={72}
                color="var(--chart-1)"
              />
              <div style={{ fontSize:'0.8125rem', display:'grid', gap:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>Employees Allocated</span>
                  <span style={{ fontWeight:700, color:'var(--sage-700)' }}>{employeesWithHardwareCount}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>Pending Equipment</span>
                  <span style={{ fontWeight:700, color:'var(--warning-text)' }}>{Math.max(0, employees.length - employeesWithHardwareCount)}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>Active Devices</span>
                  <span style={{ fontWeight:700 }}>{allocations.length}</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card $p="var(--sp-4)">
            <div className="label-caps" style={{ marginBottom:12 }}>Onboarding Velocity</div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <MiniDonut
                value={onTrackCount}
                total={employees.length || 1}
                label={`${onTrackCount}`}
                sublabel="on track"
                size={72}
                color="var(--chart-1)"
              />
              <div style={{ fontSize:'0.8125rem', display:'grid', gap:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>On Track (≥50%)</span>
                  <span style={{ fontWeight:700, color:'var(--sage-700)' }}>{onTrackCount}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>In Progress (&lt;50%)</span>
                  <span style={{ fontWeight:700, color:'var(--warning-text)' }}>{justStartedCount}</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <span style={{ color:'var(--text-muted)' }}>Not Started</span>
                  <span style={{ fontWeight:700 }}>{notStartedCount}</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:10 }}>By Department</div>
          {deptBars.length > 0 ? (
            <HorizontalBar items={deptBars.slice(0, 4)} colorVar="--chart-1" />
          ) : (
            <p className="caption" style={{ color:'var(--text-muted)', paddingTop:12 }}>No departments mapped.</p>
          )}
        </Card>
      </div>

      {/* Search + Filter Toolbar */}
      <Card $p="var(--sp-3) var(--sp-4)" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 200px' }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by employee name, job title, email…"
            style={{ width:'100%', padding:'7px 10px 7px 30px', fontSize:'0.8125rem', borderRadius:'var(--r-full)', border:'1.5px solid var(--border-default)', background:'var(--sage-50)', color:'var(--text-primary)', outline:'none', transition:'border-color var(--t-fast)' }}
            onFocus={e => e.target.style.borderColor='var(--sage-500)'}
            onBlur={e => e.target.style.borderColor='var(--border-default)'}
          />
        </div>

        {/* Status Segmented Filter */}
        <div style={{ display:'flex', alignItems:'center', gap:4, background:'var(--sage-100)', padding:3, borderRadius:'var(--r-full)' }}>
          {[
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'all', label: 'All' },
          ].map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStatusFilterChange(s.id)}
              style={{
                padding:'4px 12px',
                fontSize:'0.75rem',
                fontWeight:600,
                borderRadius:'var(--r-full)',
                border:'none',
                cursor:'pointer',
                background: filterStatus === s.id ? '#fff' : 'transparent',
                color: filterStatus === s.id ? 'var(--sage-900)' : 'var(--text-secondary)',
                boxShadow: filterStatus === s.id ? 'var(--shadow-xs)' : 'none',
                transition:'all var(--t-fast)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isITAdmin && (
          <button
            type="button"
            onClick={() => setFilterAllocatedOnly(v => !v)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--r-full)',
              border: '1.5px solid',
              borderColor: filterAllocatedOnly ? 'var(--sage-600)' : 'var(--border-default)',
              background: filterAllocatedOnly ? 'var(--sage-100)' : 'transparent',
              color: filterAllocatedOnly ? 'var(--sage-900)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--t-fast)',
            }}
          >
            <Laptop size={12} />
            {filterAllocatedOnly ? 'Allocated Only' : 'All Hardware Status'}
          </button>
        )}

        <Button variant="ghost" size="sm" icon={Filter} onClick={() => setShowFilters(v => !v)}>
          Filter {filterDept !== 'ALL' && '●'}
        </Button>

        {showFilters && (
          <select
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
            style={{ padding:'5px 10px', fontSize:'0.8125rem', borderRadius:'var(--r-md)', border:'1px solid var(--border-default)', background:'var(--bg-surface)', color:'var(--text-primary)' }}
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d.deptId} value={d.deptName}>{d.deptName}</option>
            ))}
          </select>
        )}

        {filterDept !== 'ALL' && (
          <button
            onClick={() => setFilterDept('ALL')}
            style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.8125rem', color:'var(--danger)', background:'none', border:'none', cursor:'pointer' }}
          >
            <X size={12}/> Clear
          </button>
        )}
      </Card>

      {/* Employee List */}
      {loading ? (
        <Card $p="var(--sp-6)" style={{ textAlign:'center', color:'var(--text-muted)' }}>
          <div className="caption">Loading live employee directory from database…</div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card $p="var(--sp-6)" style={{ textAlign:'center', color:'var(--text-muted)' }}>
          <Briefcase size={32} style={{ margin:'0 auto 12px', opacity:0.4 }} />
          <h3 className="h3">No employees found</h3>
          <p className="caption" style={{ marginTop:4 }}>Try modifying your search or status/department filters.</p>
        </Card>
      ) : (
        <AnimatedList style={{ display:'grid', gap:6 }}>
          {filtered.map(emp => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            const jobTitle = emp.Position?.jobTitle || emp.Position?.title || 'Team Member';
            const deptName = emp.Position?.Department?.deptName || 'General';
            const progress = emp.OnboardingPlan?.progressPercent ?? 0;

            const isInactive = emp.status === 'terminated' || emp.SystemUser?.isActive === false || emp.SystemUser?.is_active === 0 || emp.is_active === 0;
            const isSelf = emp.userId === user?.userId || emp.employeeId === user?.employeeId || (user?.username && emp.SystemUser?.username === user.username);

            let statusTone = 'info';
            let statusLabel = 'In Progress';
            if (isInactive) {
              statusTone = 'neutral';
              statusLabel = 'Inactive';
            } else if (emp.status === 'active') {
              statusTone = 'success';
              statusLabel = 'Active';
            } else if (progress === 100) {
              statusTone = 'sage';
              statusLabel = 'Completed';
            } else if (progress >= 50) {
              statusTone = 'sage';
              statusLabel = 'On Track';
            }

            return (
              <AnimatedItem key={emp.employeeId}>
                <div
                  style={{
                    display:'flex',
                    alignItems:'center',
                    gap:12,
                    padding:'10px 14px',
                    borderRadius:'var(--r-md)',
                    border:`1px solid ${isInactive ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                    background: isInactive ? 'var(--bg-sunken)' : 'var(--bg-surface)',
                    opacity: isInactive ? 0.8 : 1,
                    transition:'all var(--t-fast)',
                  }}
                  onMouseEnter={e => {
                    if (!isInactive) {
                      e.currentTarget.style.background = 'var(--sage-50)';
                      e.currentTarget.style.borderColor = 'var(--sage-200)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isInactive) {
                      e.currentTarget.style.background = 'var(--bg-surface)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }
                  }}
                >
                  <Avatar name={fullName} size={38} />

                  <div style={{ flex:'1 1 180px', minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem', color: isInactive ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {fullName} {isSelf && <span style={{ fontSize:'0.6875rem', color:'var(--sage-700)', fontWeight:700 }}>(You)</span>}
                    </div>
                    <div className="meta">{jobTitle} · {deptName}</div>
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:2, minWidth:130, fontSize:'0.75rem', color:'var(--text-secondary)' }}>
                    <span>Manager: <strong>{emp.Manager ? `${emp.Manager.firstName} ${emp.Manager.lastName}` : 'Unassigned'}</strong></span>
                    <span>Buddy: <strong>{emp.Buddy ? `${emp.Buddy.firstName} ${emp.Buddy.lastName}` : 'Unassigned'}</strong></span>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'var(--text-muted)', minWidth:110 }}>
                    <MapPin size={11} /> {emp.workLocation || 'Bengaluru'}
                  </div>

                  {isITAdmin ? (
                    <div style={{ minWidth: 160, maxWidth: 280 }}>
                      {allocationsByEmployee[Number(emp.employeeId)]?.length > 0 ? (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                          {allocationsByEmployee[Number(emp.employeeId)].map((al) => (
                            <span
                              key={al.allocationId}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '2px 8px',
                                borderRadius: 'var(--r-sm)',
                                background: 'var(--sage-100)',
                                color: 'var(--sage-900)',
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                border: '1px solid var(--sage-300)',
                              }}
                              title={`Tag: ${al.Asset?.assetTag || 'N/A'} | Serial: ${al.Asset?.serialNumber || 'N/A'}`}
                            >
                              <Laptop size={11} style={{ color: 'var(--sage-700)' }} />
                              {al.Asset?.AssetModel?.modelName
                                ? al.Asset.AssetModel.modelName.split(' ')[0]
                                : 'Hardware'}{' '}
                              ({al.Asset?.assetTag})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No equipment
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: 85 }}>
                      <div style={{ height: 4, borderRadius: 'var(--r-full)', background: 'var(--sage-100)', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          style={{ height: '100%', borderRadius: 'inherit', background: isInactive ? 'var(--text-muted)' : 'var(--sage-600)' }}
                        />
                      </div>
                      <div className="meta" style={{ marginTop: 2, textAlign: 'right', fontWeight: 600, color: isInactive ? 'var(--text-muted)' : 'var(--sage-700)', fontFeatureSettings: '"tnum" 1' }}>
                        {progress}%
                      </div>
                    </div>
                  )}


                  <Badge tone={statusTone}>{statusLabel}</Badge>

                  {/* Actions Column: Restricted exclusively to SYSTEM_ADMIN */}
                  {isAdmin && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:4 }}>
                      {isInactive ? (
                        <button
                          type="button"
                          onClick={() => handleReactivate(emp)}
                          title="Reactivate employee account"
                          disabled={isSelf || actionLoading}
                          style={{
                            width:30,
                            height:30,
                            borderRadius:'var(--r-md)',
                            border:'1px solid var(--border-default)',
                            background:'var(--bg-surface)',
                            color:'var(--sage-700)',
                            display:'grid',
                            placeItems:'center',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            opacity: isSelf ? 0.35 : 1,
                            transition:'all var(--t-fast)',
                          }}
                        >
                          <RotateCcw size={13} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeactivateTarget(emp)}
                          title={isSelf ? 'Cannot deactivate your own administrator account' : 'Deactivate employee'}
                          disabled={isSelf || actionLoading}
                          style={{
                            width:30,
                            height:30,
                            borderRadius:'var(--r-md)',
                            border:'1px solid var(--border-default)',
                            background:'var(--bg-surface)',
                            color:'var(--warning-text)',
                            display:'grid',
                            placeItems:'center',
                            cursor: isSelf ? 'not-allowed' : 'pointer',
                            opacity: isSelf ? 0.35 : 1,
                            transition:'all var(--t-fast)',
                          }}
                        >
                          <UserX size={13} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(emp)}
                        title={isSelf ? 'Cannot delete your own administrator account' : 'Permanently delete employee'}
                        disabled={isSelf || actionLoading}
                        style={{
                          width:30,
                          height:30,
                          borderRadius:'var(--r-md)',
                          border:'1px solid var(--danger-border)',
                          background:'var(--danger-bg)',
                          color:'var(--danger)',
                          display:'grid',
                          placeItems:'center',
                          cursor: isSelf ? 'not-allowed' : 'pointer',
                          opacity: isSelf ? 0.35 : 1,
                          transition:'all var(--t-fast)',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      )}

      {/* Deactivate Confirmation Modal */}
      <Modal
        isOpen={Boolean(deactivateTarget)}
        onClose={() => { setDeactivateTarget(null); setActionError(''); }}
        title="Deactivate Employee Account"
        description={deactivateTarget ? `Offboard and revoke platform access for ${deactivateTarget.firstName} ${deactivateTarget.lastName}.` : ''}
        maxWidth={480}
      >
        <div style={{ display:'grid', gap:14 }}>
          <div style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:'var(--r-md)', background:'var(--warning-bg)', border:'1px solid var(--warning-border)', color:'var(--warning-text)', fontSize:'0.8125rem', alignItems:'flex-start' }}>
            <AlertCircle size={18} style={{ flexShrink:0, marginTop:1 }} />
            <div>
              <strong>Deactivation Effects:</strong>
              <ul style={{ margin:'6px 0 0 16px', padding:0 }}>
                <li>Marks status as <strong>Terminated</strong> and records exit date.</li>
                <li>Immediately revokes login and MFA authentication to EOMS.</li>
                <li>Safely preserves historical documents, audit logs, and training records.</li>
              </ul>
            </div>
          </div>

          {actionError && (
            <div style={{ padding:'8px 12px', borderRadius:'var(--r-md)', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', color:'var(--danger)', fontSize:'0.8125rem' }}>
              {actionError}
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:6 }}>
            <Button variant="ghost" size="sm" onClick={() => { setDeactivateTarget(null); setActionError(''); }}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={UserX}
              isLoading={actionLoading}
              onClick={handleConfirmDeactivate}
              style={{ color:'var(--warning-text)', borderColor:'var(--warning-border)' }}
            >
              Confirm Deactivation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permanent Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => { setDeleteTarget(null); setActionError(''); }}
        title="Permanently Delete Employee"
        description={deleteTarget ? `Expunge employee record for ${deleteTarget.firstName} ${deleteTarget.lastName}.` : ''}
        maxWidth={480}
      >
        <div style={{ display:'grid', gap:14 }}>
          <div style={{ display:'flex', gap:12, padding:'12px 14px', borderRadius:'var(--r-md)', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', color:'var(--danger)', fontSize:'0.8125rem', alignItems:'flex-start' }}>
            <AlertCircle size={18} style={{ flexShrink:0, marginTop:1 }} />
            <div>
              <strong>Danger: Irreversible Action</strong>
              <p style={{ marginTop:4 }}>
                This will permanently remove <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong> and all associated user credentials, onboarding plans, documents, and allocations from the database.
              </p>
            </div>
          </div>

          {actionError && (
            <div style={{ padding:'8px 12px', borderRadius:'var(--r-md)', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', color:'var(--danger)', fontSize:'0.8125rem' }}>
              {actionError}
            </div>
          )}

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:6 }}>
            <Button variant="ghost" size="sm" onClick={() => { setDeleteTarget(null); setActionError(''); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              isLoading={actionLoading}
              onClick={handleConfirmDelete}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Employee"
        description="Creates an employee profile, credentials, and auto-initializes their 90-day onboarding journey."
        maxWidth={520}
      >
        <form onSubmit={handleCreateEmployee} style={{ display:'grid', gap:14 }}>
          {formError && (
            <div style={{ padding:'8px 12px', borderRadius:'var(--r-md)', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', color:'var(--danger)', fontSize:'0.8125rem' }}>
              {formError}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <Label>First Name</Label>
              <Input
                required
                placeholder="e.g. Ananya"
                value={newEmp.firstName}
                onChange={e => setNewEmp(p => ({ ...p, firstName: e.target.value }))}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                required
                placeholder="e.g. Verma"
                value={newEmp.lastName}
                onChange={e => setNewEmp(p => ({ ...p, lastName: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <Label>Work Email *</Label>
              <Input
                type="email"
                required
                placeholder="ananya.verma@eoms.in"
                value={newEmp.workEmail}
                onChange={e => setNewEmp(p => ({ ...p, workEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label>Initial Password *</Label>
              <div style={{ position:'relative' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  value={newEmp.password}
                  onChange={e => setNewEmp(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'grid',
                    placeItems: 'center',
                    padding: 4,
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <Label>Job Position</Label>
              <Select
                value={newEmp.positionId}
                onChange={e => setNewEmp(p => ({ ...p, positionId: e.target.value }))}
              >
                {positions.map(pos => (
                  <option key={pos.positionId} value={pos.positionId}>
                    {pos.jobTitle}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Work Location</Label>
              <Select
                value={newEmp.workLocation}
                onChange={e => setNewEmp(p => ({ ...p, workLocation: e.target.value }))}
              >
                <option value="Bengaluru (Hybrid)">Bengaluru (Hybrid)</option>
                <option value="Hyderabad (Hybrid)">Hyderabad (Hybrid)</option>
                <option value="Pune (On-site)">Pune (On-site)</option>
                <option value="Gurugram (On-site)">Gurugram (On-site)</option>
                <option value="Remote (India)">Remote (India)</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>Joining / Hire Date *</Label>
            <Input
              type="date"
              required
              value={newEmp.hireDate}
              onChange={e => setNewEmp(p => ({ ...p, hireDate: e.target.value }))}
            />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <Label>Reporting Manager</Label>
              <Select
                value={newEmp.managerId}
                onChange={e => setNewEmp(p => ({ ...p, managerId: e.target.value }))}
              >
                <option value="">Select Manager (Optional)...</option>
                {managers.map(mgr => (
                  <option key={mgr.employeeId} value={mgr.employeeId}>
                    {mgr.firstName} {mgr.lastName} ({mgr.Position?.jobTitle || 'Department Manager'})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Onboarding Buddy</Label>
              <Select
                value={newEmp.buddyId}
                onChange={e => setNewEmp(p => ({ ...p, buddyId: e.target.value }))}
              >
                <option value="">Select Buddy (Optional)...</option>
                {employees.map(emp => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.firstName} {emp.lastName} ({emp.Position?.jobTitle || 'Team Member'})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div style={{ borderTop:'1px solid var(--border-subtle)', paddingTop:12 }}>
            <div className="label-caps" style={{ marginBottom:8 }}>Emergency Contact (Optional)</div>
            <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:10 }}>
              <Input
                placeholder="Contact Name"
                value={newEmp.emergencyName}
                onChange={e => setNewEmp(p => ({ ...p, emergencyName: e.target.value }))}
              />
              <Input
                placeholder="+91 98765 43210"
                value={newEmp.emergencyPhone}
                onChange={e => setNewEmp(p => ({ ...p, emergencyPhone: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting} icon={UserCheck}>
              Register Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
