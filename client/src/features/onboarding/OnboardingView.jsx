import { useState, useEffect } from 'react';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader, SegmentedProgress } from '../../components/common/ui';
import { StackedBarChart, RadialProgress } from '../../components/common/charts';
import { Plus, Filter, Calendar, ChevronRight, X, Compass, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { onboardingApi } from '../../api/onboarding';
import { employeeApi } from '../../api/employees';
import { useAuthStore } from '../../store/authStore';

export default function OnboardingView() {
  const [plans, setPlans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');
  const [isModalOpen, setModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [newPlan, setNewPlan] = useState({
    employeeId: '',
    templateId: '',
    startDate: new Date().toISOString().slice(0, 10),
    targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const { user } = useAuthStore();
  const canAssign = user?.roles?.some(r => ['HR_ADMIN', 'HR_SPECIALIST', 'SYSTEM_ADMIN'].includes(r));

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, empRes, tmplRes, deptRes] = await Promise.all([
        onboardingApi.listPlans(),
        employeeApi.list().catch(() => ({ data: [] })),
        onboardingApi.listTemplates().catch(() => ({ data: [] })),
        employeeApi.getDepartments().catch(() => ({ data: [] })),
      ]);

      setPlans(plansRes.data || []);
      setEmployees(empRes.data || []);
      setTemplates(tmplRes.data || []);
      setDepartments(deptRes.data || []);

      if (empRes.data?.length > 0 && !newPlan.employeeId) {
        setNewPlan(p => ({
          ...p,
          employeeId: empRes.data[0].employeeId,
          templateId: tmplRes.data?.[0]?.templateId || '',
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load onboarding cohorts from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      await onboardingApi.createPlan({
        employeeId: Number(newPlan.employeeId),
        templateId: newPlan.templateId ? Number(newPlan.templateId) : undefined,
        startDate: newPlan.startDate,
        targetCompletionDate: newPlan.targetCompletionDate,
      });

      setModal(false);
      await loadData();
    } catch (err) {
      setModalError(err.response?.data?.message || err.message || 'Failed to assign onboarding plan');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = plans.filter(p => {
    if (filterDept === 'ALL') return true;
    const dept = p.Employee?.Position?.Department?.deptName || '';
    return dept === filterDept;
  });

  const avg = plans.length > 0
    ? Math.round(plans.reduce((s, p) => s + (p.progressPercent || 0), 0) / plans.length)
    : 0;

  // Segment phase distribution derived from actual plan progress
  const preboardingCount = plans.filter(p => (p.progressPercent || 0) < 15).length;
  const week1Count = plans.filter(p => (p.progressPercent || 0) >= 15 && (p.progressPercent || 0) < 40).length;
  const month1Count = plans.filter(p => (p.progressPercent || 0) >= 40 && (p.progressPercent || 0) < 70).length;
  const month2Count = plans.filter(p => (p.progressPercent || 0) >= 70 && (p.progressPercent || 0) < 100).length;
  const completedCount = plans.filter(p => (p.progressPercent || 0) === 100).length;

  const total = plans.length || 1;
  const cohortSegments = [
    { label: 'Pre-board (<15%)', value: Math.round((preboardingCount / total) * 100), color: 'var(--sage-200)' },
    { label: 'Week 1 (15-39%)',  value: Math.round((week1Count / total) * 100), color: 'var(--sage-400)' },
    { label: '30 Days (40-69%)', value: Math.round((month1Count / total) * 100), color: 'var(--sage-600)' },
    { label: '60 Days (70-99%)', value: Math.round((month2Count / total) * 100), color: 'var(--sage-700)' },
    { label: 'Completed',        value: Math.round((completedCount / total) * 100), color: 'var(--sage-900)' },
  ];

  const phaseData = [
    { phase: 'Pre-board', count: preboardingCount },
    { phase: 'Week 1',    count: week1Count },
    { phase: '30 Days',   count: month1Count },
    { phase: '60 Days',   count: month2Count },
    { phase: 'Completed', count: completedCount },
  ];

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader
        title="Onboarding Plans"
        subtitle={`${filtered.length} active cohorts · ${avg}% live average progress`}
        action={
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadData} isLoading={loading}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" icon={Filter} onClick={() => setShowFilters(v => !v)}>
              Filter {filterDept !== 'ALL' && '●'}
            </Button>
            {canAssign && (
              <Button size="sm" icon={Plus} onClick={() => setModal(true)}>
                Assign Plan
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

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Cohort by Onboarding Velocity</h2>
        <SegmentedProgress segments={cohortSegments} />
      </Card>

      <Card $p="var(--sp-5)">
        <h2 className="section-title" style={{ marginBottom:14 }}>Active Phase Distribution</h2>
        <StackedBarChart
          data={phaseData}
          xKey="phase"
          categories={[{ dataKey:'count', name:'Employees', color:'var(--chart-1)' }]}
          height={130}
        />
      </Card>

      {showFilters && (
        <Card $p="var(--sp-3) var(--sp-4)" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
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
          {filterDept !== 'ALL' && (
            <button
              onClick={() => setFilterDept('ALL')}
              style={{ display:'flex', alignItems:'center', gap:3, fontSize:'0.8125rem', color:'var(--danger)', background:'none', border:'none', cursor:'pointer' }}
            >
              <X size={12}/> Clear
            </button>
          )}
        </Card>
      )}

      {loading ? (
        <Card $p="var(--sp-6)" style={{ textAlign:'center', color:'var(--text-muted)' }}>
          <div className="caption">Loading onboarding cohorts from database…</div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card $p="var(--sp-6)" style={{ textAlign:'center', color:'var(--text-muted)' }}>
          <Compass size={32} style={{ margin:'0 auto 12px', opacity:0.4 }} />
          <h3 className="h3">No onboarding plans found</h3>
          <p className="caption" style={{ marginTop:4 }}>All registered plans will appear here once provisioned.</p>
        </Card>
      ) : (
        <AnimatedList style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(310px,1fr))', gap:'var(--sp-4)' }}>
          {filtered.map(p => {
            const empName = p.Employee ? `${p.Employee.firstName} ${p.Employee.lastName}` : 'Employee';
            const role = p.Employee?.Position?.jobTitle || 'Team Member';
            const dept = p.Employee?.Position?.Department?.deptName || 'Platform';
            const hub = p.Employee?.workLocation || 'Bengaluru';
            const progress = p.progressPercent || 0;
            const statusLabel = progress === 100 ? 'Completed' : progress >= 50 ? 'On Track' : 'In Progress';
            const statusTone = progress === 100 ? 'sage' : progress >= 50 ? 'sage' : 'warning';

            return (
              <AnimatedItem key={p.planId}>
                <Card $hoverable style={{ display:'grid', gap:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <Avatar name={empName} size={38} />
                      <div>
                        <div className="h3">{empName}</div>
                        <div className="meta">{role}</div>
                      </div>
                    </div>
                    <Badge tone={statusTone}>{statusLabel}</Badge>
                  </div>

                  <div style={{ display:'flex', gap:14, alignItems:'center' }}>
                    <RadialProgress
                      value={progress}
                      size={72}
                      strokeWidth={6}
                      color={progress === 100 ? 'var(--chart-1)' : progress >= 50 ? 'var(--chart-1)' : 'var(--warning)'}
                      label={`${progress}%`}
                    />
                    <div style={{ fontSize:'0.8125rem', display:'grid', gap:5, flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ color:'var(--text-muted)' }}>Department</span>
                        <span style={{ fontWeight:500 }}>{dept}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ color:'var(--text-muted)' }}>Tech Hub</span>
                        <span style={{ fontWeight:500 }}>{hub}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}>
                          <Calendar size={11}/> {p.startDate || '2026-09-01'}
                        </span>
                        <span className="caption" style={{ fontWeight:600, color:'var(--sage-700)' }}>
                          Target: {p.targetCompletionDate || '30 days'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      )}

      {/* Assign Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModal(false)}
        title="Assign Enterprise Onboarding Plan"
        description="Select an employee and curriculum template to initialize their onboarding roadmap."
      >
        <form onSubmit={handleCreatePlan} style={{ display:'grid', gap:14 }}>
          {modalError && (
            <div style={{ padding:'8px 12px', borderRadius:'var(--r-md)', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', color:'var(--danger)', fontSize:'0.8125rem' }}>
              {modalError}
            </div>
          )}

          <div>
            <Label>Select Employee</Label>
            <Select
              value={newPlan.employeeId}
              onChange={e => setNewPlan(p => ({ ...p, employeeId: e.target.value }))}
            >
              {employees.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.firstName} {emp.lastName} ({emp.workEmail})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Onboarding Template Cohort</Label>
            <Select
              value={newPlan.templateId}
              onChange={e => setNewPlan(p => ({ ...p, templateId: e.target.value }))}
            >
              {templates.map(tmpl => (
                <option key={tmpl.templateId} value={tmpl.templateId}>
                  {tmpl.templateName}
                </option>
              ))}
            </Select>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={newPlan.startDate}
                onChange={e => setNewPlan(p => ({ ...p, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Target Date</Label>
              <Input
                type="date"
                required
                value={newPlan.targetCompletionDate}
                onChange={e => setNewPlan(p => ({ ...p, targetCompletionDate: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Initialize Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
