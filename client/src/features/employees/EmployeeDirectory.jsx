import { useState, useEffect } from 'react';
import { Card, Button, Badge, Avatar, AnimatedList, AnimatedItem, PageHeader, Modal, Input, Label, Select } from '../../components/common/ui';
import { HorizontalBar, MiniDonut } from '../../components/common/charts';
import { Plus, Search, Filter, X, MapPin, AlertCircle, RefreshCw, UserCheck, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../api/employees';
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

  // Add Employee Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    positionId: '',
    hireDate: new Date().toISOString().slice(0, 10),
    workLocation: 'Bengaluru (Hybrid)',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRel: 'Spouse',
  });

  const { user } = useAuthStore();
  const canAdd = user?.roles?.some(r => ['HR_ADMIN', 'HR_SPECIALIST', 'SYSTEM_ADMIN'].includes(r));

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [empRes, deptRes, posRes] = await Promise.all([
        employeeApi.list(),
        employeeApi.getDepartments().catch(() => ({ data: [] })),
        employeeApi.getPositions().catch(() => ({ data: [] })),
      ]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setPositions(posRes.data || []);
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

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await employeeApi.create({
        firstName: newEmp.firstName.trim(),
        lastName: newEmp.lastName.trim(),
        workEmail: newEmp.workEmail.trim(),
        positionId: Number(newEmp.positionId),
        hireDate: newEmp.hireDate,
        workLocation: newEmp.workLocation,
        emergencyContact: newEmp.emergencyName ? {
          name: newEmp.emergencyName,
          phone: newEmp.emergencyPhone,
          relationship: newEmp.emergencyRel,
        } : undefined,
      });

      setIsModalOpen(false);
      setNewEmp({
        firstName: '',
        lastName: '',
        workEmail: '',
        positionId: positions[0]?.positionId || '',
        hireDate: new Date().toISOString().slice(0, 10),
        workLocation: 'Bengaluru (Hybrid)',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRel: 'Spouse',
      });
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
    const role = (e.Position?.jobTitle || '').toLowerCase();
    const dept = e.Position?.Department?.deptName || '';

    if (q && !fullName.includes(q) && !role.includes(q) && !e.workEmail.toLowerCase().includes(q)) return false;
    if (filterDept !== 'ALL' && dept !== filterDept) return false;
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
        subtitle={`${filtered.length} of ${employees.length} corporate employees enrolled`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadData} isLoading={loading}>
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
          <Button size="xs" variant="secondary" onClick={loadData} style={{ marginLeft:'auto' }}>Retry</Button>
        </Card>
      )}

      {/* Aggregate KPI Overview */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-4)' }}>
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

        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:10 }}>By Department</div>
          {deptBars.length > 0 ? (
            <HorizontalBar items={deptBars.slice(0, 4)} colorVar="--chart-1" />
          ) : (
            <p className="caption" style={{ color:'var(--text-muted)', paddingTop:12 }}>No departments mapped.</p>
          )}
        </Card>
      </div>

      {/* Search + Filter */}
      <Card $p="var(--sp-3) var(--sp-4)" style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 220px' }}>
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
          <p className="caption" style={{ marginTop:4 }}>Try modifying your search or department filter.</p>
        </Card>
      ) : (
        <AnimatedList style={{ display:'grid', gap:6 }}>
          {filtered.map(emp => {
            const fullName = `${emp.firstName} ${emp.lastName}`;
            const jobTitle = emp.Position?.jobTitle || 'Team Member';
            const deptName = emp.Position?.Department?.deptName || 'General';
            const progress = emp.OnboardingPlan?.progressPercent ?? 0;
            const statusTone = progress >= 75 ? 'sage' : progress >= 30 ? 'info' : 'warning';
            const statusLabel = progress === 100 ? 'Completed' : progress >= 50 ? 'On Track' : 'In Progress';

            return (
              <AnimatedItem key={emp.employeeId}>
                <div
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:'var(--r-md)', border:'1px solid var(--border-subtle)', background:'var(--bg-surface)', transition:'all var(--t-fast)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--sage-50)'; e.currentTarget.style.borderColor = 'var(--sage-200)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                >
                  <Avatar name={fullName} size={38} />
                  <div style={{ flex:'1 1 200px', minWidth:0 }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--text-primary)' }}>{fullName}</div>
                    <div className="meta">{jobTitle} · {deptName}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    <MapPin size={11} /> {emp.workLocation || 'Bengaluru'}
                  </div>
                  <div style={{ width:95 }}>
                    <div style={{ height:4, borderRadius:'var(--r-full)', background:'var(--sage-100)', overflow:'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ height:'100%', borderRadius:'inherit', background:'var(--sage-600)' }}
                      />
                    </div>
                    <div className="meta" style={{ marginTop:2, textAlign:'right', fontWeight:600, color:'var(--sage-700)', fontFeatureSettings:'"tnum" 1' }}>
                      {progress}%
                    </div>
                  </div>
                  <Badge tone={statusTone}>{statusLabel}</Badge>
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      )}

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

          <div>
            <Label>Work Email</Label>
            <Input
              type="email"
              required
              placeholder="ananya.verma@eoms.in"
              value={newEmp.workEmail}
              onChange={e => setNewEmp(p => ({ ...p, workEmail: e.target.value }))}
            />
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
            <Label>Joining / Hire Date</Label>
            <Input
              type="date"
              required
              value={newEmp.hireDate}
              onChange={e => setNewEmp(p => ({ ...p, hireDate: e.target.value }))}
            />
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
