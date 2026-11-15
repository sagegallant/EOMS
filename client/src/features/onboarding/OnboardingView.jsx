import { useState, useEffect } from 'react';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader, SegmentedProgress } from '../../components/common/ui';
import { StackedBarChart, RadialProgress } from '../../components/common/charts';
import {
  Plus,
  Filter,
  Calendar,
  ChevronRight,
  X,
  Compass,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  User,
  Users,
  ListTodo,
  Check,
} from 'lucide-react';
import { onboardingApi } from '../../api/onboarding';
import { employeeApi } from '../../api/employees';
import { taskApi } from '../../api/tasks';
import { useAuthStore } from '../../store/authStore';

const PRIORITY_THEMES = {
  critical: { bg: 'var(--priority-critical-bg, #FEF2F2)', border: 'var(--priority-critical-border, #FECACA)', text: 'var(--priority-critical-text, #B91C1C)', dot: '#DC2626', label: 'Critical' },
  high:     { bg: 'var(--priority-high-bg, #FFFBEB)',     border: 'var(--priority-high-border, #FDE68A)',     text: 'var(--priority-high-text, #B45309)',     dot: '#D97706', label: 'High' },
  medium:   { bg: 'var(--priority-medium-bg, #EFF6FF)',   border: 'var(--priority-medium-border, #BFDBFE)',   text: 'var(--priority-medium-text, #2563EB)',   dot: '#2563EB', label: 'Medium' },
  low:      { bg: 'var(--priority-low-bg, #F3F4F6)',      border: 'var(--priority-low-border, #E5E7EB)',      text: 'var(--priority-low-text, #4B5563)',      dot: '#9CA3AF', label: 'Low' },
};

function PriorityChip({ priority = 'medium', size = 'sm' }) {
  const p = (priority || 'medium').toLowerCase();
  const theme = PRIORITY_THEMES[p] || PRIORITY_THEMES.medium;
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        borderRadius: 'var(--r-full)',
        padding: isSm ? '2px 8px' : '4px 10px',
        fontSize: isSm ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        letterSpacing: '0.01em',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.dot, flexShrink: 0 }} />
      {theme.label}
    </span>
  );
}

const CATEGORY_NAMES = {
  administrative: 'Administrative',
  it_setup: 'IT Setup',
  training: 'Training & Ramp-up',
  compliance: 'Compliance',
  manager_meeting: 'Manager 1-on-1',
};

function getHighestPendingPriority(plan) {
  if (!plan?.Checklists || !Array.isArray(plan.Checklists)) return null;
  const prioritiesOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  let highest = null;
  let highestVal = 0;

  for (const checklist of plan.Checklists) {
    if (!checklist.Tasks || !Array.isArray(checklist.Tasks)) continue;
    for (const task of checklist.Tasks) {
      const progresses = task.TaskProgresses || (task.TaskProgress ? (Array.isArray(task.TaskProgress) ? task.TaskProgress : [task.TaskProgress]) : []);
      const empProgress = progresses.find(p => p.employeeId === plan.employeeId) || progresses[0];
      const isCompleted = empProgress?.status === 'completed';

      if (!isCompleted) {
        const pKey = (task.priority || 'medium').toLowerCase();
        const pVal = prioritiesOrder[pKey] || 1;
        if (pVal > highestVal) {
          highestVal = pVal;
          highest = pKey;
        }
      }
    }
  }
  return highest;
}

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

  // Selected plan for roadmap details modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [taskActionError, setTaskActionError] = useState('');

  const [newTask, setNewTask] = useState({
    checklistId: '',
    title: '',
    description: '',
    category: 'administrative',
    priority: 'high',
    estimatedMinutes: 30,
  });

  const [newPlan, setNewPlan] = useState({
    employeeId: '',
    templateId: '',
    priority: 'high',
    startDate: new Date().toISOString().slice(0, 10),
    targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const { user } = useAuthStore();
  const canAssign = user?.roles?.some(r =>
    ['HR_ADMIN', 'HR_SPECIALIST', 'SYSTEM_ADMIN', 'DEPARTMENT_MANAGER', 'MANAGER'].includes(r)
  );

  const loadData = async (activePlanId = null) => {
    setLoading(true);
    setError(null);
    try {
      const [plansRes, empRes, tmplRes, deptRes] = await Promise.all([
        onboardingApi.listPlans(),
        employeeApi.list().catch(() => ({ data: [] })),
        onboardingApi.listTemplates().catch(() => ({ data: [] })),
        employeeApi.getDepartments().catch(() => ({ data: [] })),
      ]);

      const validPlans = (plansRes.data || []).filter(p => p && p.Employee);
      setPlans(validPlans);
      setEmployees(empRes.data || []);
      setTemplates(tmplRes.data || []);
      setDepartments(deptRes.data || []);

      const targetId = activePlanId !== null ? activePlanId : selectedPlan?.planId;
      if (targetId) {
        const refreshed = validPlans.find(p => p.planId === targetId);
        if (refreshed) {
          setSelectedPlan(refreshed);
        }
      }

      const assignedIds = new Set(validPlans.map(p => p.employeeId || p.Employee?.employeeId));
      const unassignedFirst = [...(empRes.data || [])].sort((a, b) => {
        const aHas = assignedIds.has(a.employeeId);
        const bHas = assignedIds.has(b.employeeId);
        if (aHas === bHas) return 0;
        return aHas ? 1 : -1;
      });

      if (unassignedFirst.length > 0 && !newPlan.employeeId) {
        setNewPlan(p => ({
          ...p,
          employeeId: unassignedFirst[0].employeeId,
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

  const handleOpenRoadmap = (plan) => {
    setSelectedPlan(plan);
    setShowAddTask(false);
    setTaskActionError('');
    if (plan.Checklists && plan.Checklists.length > 0) {
      setNewTask(prev => ({
        ...prev,
        checklistId: plan.Checklists[0].checklistId,
      }));
    }
  };

  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    if (!selectedPlan) return;
    const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
    setUpdatingTaskId(taskId);
    setTaskActionError('');
    try {
      await taskApi.updateProgress(taskId, {
        employeeId: selectedPlan.employeeId,
        status: newStatus,
      });
      await loadData(selectedPlan.planId);
    } catch (err) {
      setTaskActionError(err.response?.data?.message || err.message || 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleCreatePriorityTask = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !newTask.checklistId || !newTask.title.trim()) return;
    setCreatingTask(true);
    setTaskActionError('');
    try {
      await taskApi.create({
        checklistId: Number(newTask.checklistId),
        title: newTask.title.trim(),
        description: newTask.description?.trim() || null,
        category: newTask.category || 'administrative',
        priority: newTask.priority || 'high',
        estimatedMinutes: Number(newTask.estimatedMinutes) || 30,
        employeeId: selectedPlan.employeeId,
      });

      setNewTask({
        checklistId: selectedPlan.Checklists?.[0]?.checklistId || '',
        title: '',
        description: '',
        category: 'administrative',
        priority: 'high',
        estimatedMinutes: 30,
      });
      setShowAddTask(false);
      await loadData(selectedPlan.planId);
    } catch (err) {
      setTaskActionError(err.response?.data?.message || err.message || 'Failed to add task to roadmap');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);
    try {
      await onboardingApi.createPlan({
        employeeId: Number(newPlan.employeeId),
        templateId: newPlan.templateId ? Number(newPlan.templateId) : undefined,
        priority: newPlan.priority || 'high',
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

  const assignedEmployeeIds = new Set(plans.map(p => p.employeeId || p.Employee?.employeeId));
  const isSelectedEmpAssigned = assignedEmployeeIds.has(Number(newPlan.employeeId));

  const sortedEmployees = [...employees].sort((a, b) => {
    const aHas = assignedEmployeeIds.has(a.employeeId);
    const bHas = assignedEmployeeIds.has(b.employeeId);
    if (aHas === bHas) return a.firstName.localeCompare(b.firstName);
    return aHas ? 1 : -1;
  });

  const filtered = plans.filter(p => {
    if (!p.Employee) return false;
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

  // Derive task statistics for selected plan in roadmap modal
  let selectedPlanTotalTasks = 0;
  let selectedPlanCompletedTasks = 0;
  if (selectedPlan?.Checklists) {
    selectedPlan.Checklists.forEach(ch => {
      if (ch.Tasks) {
        ch.Tasks.forEach(tk => {
          selectedPlanTotalTasks++;
          const progresses = tk.TaskProgresses || (tk.TaskProgress ? (Array.isArray(tk.TaskProgress) ? tk.TaskProgress : [tk.TaskProgress]) : []);
          const prog = progresses.find(p => p.employeeId === selectedPlan.employeeId) || progresses[0];
          if (prog?.status === 'completed') {
            selectedPlanCompletedTasks++;
          }
        });
      }
    });
  }

  const sortedChecklists = [...(selectedPlan?.Checklists || [])].sort(
    (a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0)
  );

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader
        title="Onboarding Plans"
        subtitle={`${filtered.length} active cohorts · ${avg}% live average progress`}
        action={
          <div style={{ display:'flex', gap:8 }}>
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => loadData()} isLoading={loading}>
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
          <Button size="xs" variant="secondary" onClick={() => loadData()} style={{ marginLeft:'auto' }}>Retry</Button>
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
        <AnimatedList style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:'var(--sp-4)' }}>
          {filtered.map(p => {
            const empName = p.Employee ? `${p.Employee.firstName} ${p.Employee.lastName}` : 'Employee';
            const role = p.Employee?.Position?.jobTitle || 'Team Member';
            const dept = p.Employee?.Position?.Department?.deptName || 'Platform';
            const hub = p.Employee?.workLocation || 'Bengaluru';
            const progress = p.progressPercent || 0;
            const statusLabel = progress === 100 ? 'Completed' : progress >= 50 ? 'On Track' : 'In Progress';
            const statusTone = progress === 100 ? 'sage' : progress >= 50 ? 'sage' : 'warning';
            const highestPriority = getHighestPendingPriority(p);
            const curriculumName = p.OnboardingTemplate?.templateName || 'Enterprise Ramp-Up';
            const managerName = p.Employee?.Manager ? `${p.Employee.Manager.firstName} ${p.Employee.Manager.lastName}` : null;
            const buddyName = p.Employee?.Buddy ? `${p.Employee.Buddy.firstName} ${p.Employee.Buddy.lastName}` : null;

            return (
              <AnimatedItem key={p.planId}>
                <Card
                  $hoverable
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenRoadmap(p)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenRoadmap(p);
                    }
                  }}
                  style={{
                    display:'grid',
                    gap:12,
                    cursor:'pointer',
                    transition:'transform var(--t-fast) var(--ease), box-shadow var(--t-fast) var(--ease), border-color var(--t-fast) var(--ease)',
                  }}
                >
                  {/* Top: Avatar, Name, Role & Status */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <Avatar name={empName} size={40} />
                      <div>
                        <div className="h3">{empName}</div>
                        <div className="meta">{role}</div>
                      </div>
                    </div>
                    <Badge tone={statusTone}>{statusLabel}</Badge>
                  </div>

                  {/* Curriculum Title Pill */}
                  <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--sage-100)', color:'var(--sage-900)', padding:'3px 10px', borderRadius:'var(--r-full)', fontSize:'0.75rem', fontWeight:600, width:'fit-content' }}>
                    <BookOpen size={12} style={{ color:'var(--sage-700)' }} />
                    <span>{curriculumName}</span>
                  </div>

                  {/* Middle: Progress Gauge & Metadata */}
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

                  {/* Priority & Tasks Indicator */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:4, borderTop:'1px dashed var(--border-subtle)', fontSize:'0.75rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span className="caption" style={{ color:'var(--text-muted)', fontWeight:500 }}>Pending Priority:</span>
                      {highestPriority ? (
                        <PriorityChip priority={highestPriority} size="sm" />
                      ) : (
                        <span style={{ color:'var(--success-text)', fontWeight:600 }}>✓ All Completed</span>
                      )}
                    </div>
                  </div>

                  {/* Reporting Manager & Onboarding Buddy Badges */}
                  {(managerName || buddyName) && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, fontSize:'0.75rem' }}>
                      {managerName && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--bg-subtle)', color:'var(--text-secondary)', padding:'2px 8px', borderRadius:'var(--r-md)' }}>
                          <User size={11} style={{ color:'var(--sage-700)' }} />
                          <span><strong>Mgr:</strong> {managerName}</span>
                        </span>
                      )}
                      {buddyName && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'var(--bg-subtle)', color:'var(--text-secondary)', padding:'2px 8px', borderRadius:'var(--r-md)' }}>
                          <Users size={11} style={{ color:'var(--sage-700)' }} />
                          <span><strong>Buddy:</strong> {buddyName}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer Interactive Hint */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:6, borderTop:'1px solid var(--border-subtle)', color:'var(--sage-700)', fontSize:'0.75rem', fontWeight:600 }}>
                    <span>View Full Roadmap & Tasks</span>
                    <ChevronRight size={14} />
                  </div>
                </Card>
              </AnimatedItem>
            );
          })}
        </AnimatedList>
      )}

      {/* Plan Roadmap Detail Modal */}
      <Modal
        isOpen={Boolean(selectedPlan)}
        onClose={() => {
          setSelectedPlan(null);
          setShowAddTask(false);
          setTaskActionError('');
        }}
        title="Onboarding Roadmap & Curriculum"
        description={selectedPlan?.Employee ? `Curriculum milestones and execution tasks for ${selectedPlan.Employee.firstName} ${selectedPlan.Employee.lastName}` : ''}
        maxWidth={780}
      >
        {selectedPlan && (
          <div style={{ display:'grid', gap:18 }}>
            {taskActionError && (
              <div style={{ padding:'8px 12px', borderRadius:'var(--r-md)', background:'var(--danger-bg)', border:'1px solid var(--danger-border)', color:'var(--danger)', fontSize:'0.8125rem' }}>
                {taskActionError}
              </div>
            )}

            {/* Employee Profile Header & Progress Summary */}
            <Card $p="var(--sp-4)" style={{ background:'var(--sage-50)', borderColor:'var(--border-subtle)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <Avatar name={`${selectedPlan.Employee?.firstName} ${selectedPlan.Employee?.lastName}`} size={48} />
                  <div>
                    <div className="h2">{selectedPlan.Employee?.firstName} {selectedPlan.Employee?.lastName}</div>
                    <div className="meta" style={{ color:'var(--text-secondary)' }}>{selectedPlan.Employee?.workEmail}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:6 }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:600, background:'#fff', padding:'2px 8px', borderRadius:'var(--r-sm)', border:'1px solid var(--border-subtle)' }}>
                        {selectedPlan.Employee?.Position?.jobTitle || 'Team Member'}
                      </span>
                      <span style={{ fontSize:'0.75rem', fontWeight:600, background:'#fff', padding:'2px 8px', borderRadius:'var(--r-sm)', border:'1px solid var(--border-subtle)' }}>
                        {selectedPlan.Employee?.Position?.Department?.deptName || 'Platform'}
                      </span>
                      <span style={{ fontSize:'0.75rem', fontWeight:600, background:'#fff', padding:'2px 8px', borderRadius:'var(--r-sm)', border:'1px solid var(--border-subtle)' }}>
                        📍 {selectedPlan.Employee?.workLocation || 'Bengaluru Hub'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <RadialProgress
                    value={selectedPlan.progressPercent || 0}
                    size={68}
                    strokeWidth={6}
                    color={(selectedPlan.progressPercent || 0) === 100 ? 'var(--chart-1)' : 'var(--chart-1)'}
                    label={`${selectedPlan.progressPercent || 0}%`}
                  />
                  <div style={{ fontSize:'0.8125rem' }}>
                    <div style={{ fontWeight:700, color:'var(--text-primary)' }}>
                      {selectedPlanCompletedTasks} of {selectedPlanTotalTasks} Tasks Done
                    </div>
                    <div className="caption" style={{ color:'var(--text-muted)', marginTop:2 }}>
                      Start: {selectedPlan.startDate || 'N/A'}
                    </div>
                    <div className="caption" style={{ color:'var(--sage-700)', fontWeight:600 }}>
                      Target: {selectedPlan.targetCompletionDate || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Manager & Buddy Assignment Bar */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:12, paddingTop:10, borderTop:'1px dashed var(--border-subtle)', fontSize:'0.8125rem' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                  <User size={14} style={{ color:'var(--sage-700)' }} />
                  <span style={{ color:'var(--text-muted)' }}>Reporting Manager:</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>
                    {selectedPlan.Employee?.Manager ? `${selectedPlan.Employee.Manager.firstName} ${selectedPlan.Employee.Manager.lastName}` : 'Unassigned'}
                  </span>
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                  <Users size={14} style={{ color:'var(--sage-700)' }} />
                  <span style={{ color:'var(--text-muted)' }}>Onboarding Buddy:</span>
                  <span style={{ fontWeight:600, color:'var(--text-primary)' }}>
                    {selectedPlan.Employee?.Buddy ? `${selectedPlan.Employee.Buddy.firstName} ${selectedPlan.Employee.Buddy.lastName}` : 'Unassigned'}
                  </span>
                </div>
                <div style={{ marginLeft:'auto', display:'inline-flex', alignItems:'center', gap:6 }}>
                  <BookOpen size={14} style={{ color:'var(--sage-700)' }} />
                  <span style={{ color:'var(--text-muted)' }}>Curriculum:</span>
                  <span style={{ fontWeight:600, color:'var(--sage-900)' }}>
                    {selectedPlan.OnboardingTemplate?.templateName || 'Enterprise Ramp-Up'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Checklists & Tasks Section Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h3 className="h3">Curriculum Phased Milestones</h3>
                <p className="caption" style={{ color:'var(--text-muted)' }}>
                  Interactive checklist roadmap. Toggle tasks to recalculate live progress.
                </p>
              </div>
              {canAssign && (
                <Button
                  size="sm"
                  variant={showAddTask ? 'secondary' : 'primary'}
                  icon={showAddTask ? X : Plus}
                  onClick={() => setShowAddTask(v => !v)}
                >
                  {showAddTask ? 'Close Add Task' : 'Add Priority Task'}
                </Button>
              )}
            </div>

            {/* Inline Priority Task Creator */}
            {showAddTask && (
              <Card $p="var(--sp-4)" style={{ border:'1.5px solid var(--border-default)', background:'var(--bg-surface)' }}>
                <div style={{ fontWeight:600, fontSize:'0.875rem', marginBottom:10, color:'var(--sage-900)' }}>
                  Add Task to {selectedPlan.Employee?.firstName}'s Roadmap
                </div>
                <form onSubmit={handleCreatePriorityTask} style={{ display:'grid', gap:10 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:10 }}>
                    <div>
                      <Label>Task Title *</Label>
                      <Input
                        required
                        placeholder="e.g. Schedule Architecture Deep-Dive with Lead"
                        value={newTask.title}
                        onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Phase Milestone *</Label>
                      <Select
                        value={newTask.checklistId}
                        onChange={e => setNewTask(t => ({ ...t, checklistId: e.target.value }))}
                      >
                        {sortedChecklists.map(ch => (
                          <option key={ch.checklistId} value={ch.checklistId}>
                            {ch.phaseName || `Phase ${ch.phaseOrder}`}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description / Instructions</Label>
                    <Input
                      placeholder="Optional guidance or reference links for this task"
                      value={newTask.description}
                      onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))}
                    />
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                    <div>
                      <Label>Priority Level</Label>
                      <Select
                        value={newTask.priority}
                        onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}
                      >
                        <option value="critical">Critical Priority 🔴</option>
                        <option value="high">High Priority 🟡</option>
                        <option value="medium">Medium Priority 🔵</option>
                        <option value="low">Low Priority ⚪</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={newTask.category}
                        onChange={e => setNewTask(t => ({ ...t, category: e.target.value }))}
                      >
                        <option value="administrative">Administrative</option>
                        <option value="it_setup">IT Setup</option>
                        <option value="training">Training & Ramp-up</option>
                        <option value="compliance">Compliance</option>
                        <option value="manager_meeting">Manager 1-on-1</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Est. Minutes</Label>
                      <Input
                        type="number"
                        min="5"
                        max="480"
                        value={newTask.estimatedMinutes}
                        onChange={e => setNewTask(t => ({ ...t, estimatedMinutes: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:4 }}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddTask(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" isLoading={creatingTask}>
                      Save Task to Phase
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Checklists & Tasks List */}
            {sortedChecklists.length === 0 ? (
              <div style={{ textAlign:'center', padding:'var(--sp-5)', color:'var(--text-muted)', background:'var(--bg-subtle)', borderRadius:'var(--r-lg)' }}>
                <ListTodo size={28} style={{ margin:'0 auto 8px', opacity:0.5 }} />
                <div style={{ fontWeight:600 }}>No checklist phases found</div>
                <div className="caption">Use 'Add Priority Task' or reassign a curriculum template to provision phases.</div>
              </div>
            ) : (
              <div style={{ display:'grid', gap:14 }}>
                {sortedChecklists.map((checklist, cIdx) => {
                  const tasks = [...(checklist.Tasks || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                  const phaseCompleted = tasks.filter(tk => {
                    const progresses = tk.TaskProgresses || (tk.TaskProgress ? (Array.isArray(tk.TaskProgress) ? tk.TaskProgress : [tk.TaskProgress]) : []);
                    const prog = progresses.find(p => p.employeeId === selectedPlan.employeeId) || progresses[0];
                    return prog?.status === 'completed';
                  }).length;

                  return (
                    <Card key={checklist.checklistId || cIdx} $p="var(--sp-4)" style={{ display:'grid', gap:10 }}>
                      {/* Phase Header */}
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border-subtle)', paddingBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontSize:'0.75rem', fontWeight:700, background:'var(--sage-700)', color:'#fff', padding:'2px 7px', borderRadius:'var(--r-sm)' }}>
                            Phase {checklist.phaseOrder || cIdx + 1}
                          </span>
                          <span style={{ fontWeight:600, fontSize:'0.9375rem', color:'var(--text-primary)' }}>
                            {checklist.phaseName || 'Milestone Phase'}
                          </span>
                        </div>
                        <span style={{ fontSize:'0.8125rem', fontWeight:600, color: phaseCompleted === tasks.length && tasks.length > 0 ? 'var(--success-text)' : 'var(--text-muted)' }}>
                          {phaseCompleted} / {tasks.length} Completed
                        </span>
                      </div>

                      {/* Phase Tasks */}
                      {tasks.length === 0 ? (
                        <div className="caption" style={{ color:'var(--text-muted)', fontStyle:'italic', padding:'4px 0' }}>
                          No tasks in this milestone.
                        </div>
                      ) : (
                        <div style={{ display:'grid', gap:8 }}>
                          {tasks.map(task => {
                            const progresses = task.TaskProgresses || (task.TaskProgress ? (Array.isArray(task.TaskProgress) ? task.TaskProgress : [task.TaskProgress]) : []);
                            const prog = progresses.find(p => p.employeeId === selectedPlan.employeeId) || progresses[0];
                            const isDone = prog?.status === 'completed';
                            const isUpdating = updatingTaskId === task.taskId;

                            return (
                              <div
                                key={task.taskId}
                                style={{
                                  display:'flex',
                                  alignItems:'center',
                                  justifyContent:'space-between',
                                  gap:12,
                                  padding:'8px 12px',
                                  borderRadius:'var(--r-md)',
                                  background: isDone ? 'var(--sage-50)' : 'var(--bg-surface)',
                                  border: `1px solid ${isDone ? 'var(--sage-200)' : 'var(--border-subtle)'}`,
                                  transition:'background var(--t-fast)',
                                }}
                              >
                                {/* Checkbox & Task Title */}
                                <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleTaskStatus(task.taskId, isDone ? 'completed' : 'not_started')}
                                    disabled={isUpdating}
                                    style={{
                                      background:'none',
                                      border:'none',
                                      padding:0,
                                      cursor: isUpdating ? 'wait' : 'pointer',
                                      display:'grid',
                                      placeItems:'center',
                                      color: isDone ? 'var(--success)' : 'var(--border-strong)',
                                    }}
                                    title={isDone ? 'Mark task as pending' : 'Mark task as completed'}
                                  >
                                    {isDone ? <CheckCircle2 size={19} /> : <Circle size={19} />}
                                  </button>

                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div
                                      style={{
                                        fontSize:'0.875rem',
                                        fontWeight:500,
                                        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                        textDecoration: isDone ? 'line-through' : 'none',
                                        wordBreak:'break-word',
                                      }}
                                    >
                                      {task.title}
                                    </div>
                                    {task.description && (
                                      <div className="caption" style={{ color:'var(--text-muted)', marginTop:2 }}>
                                        {task.description}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Metadata: Category, Priority, Duration */}
                                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                                  <span
                                    style={{
                                      fontSize:'0.6875rem',
                                      fontWeight:500,
                                      background:'var(--bg-subtle)',
                                      color:'var(--text-secondary)',
                                      padding:'2px 7px',
                                      borderRadius:'var(--r-sm)',
                                    }}
                                  >
                                    {CATEGORY_NAMES[task.category] || task.category}
                                  </span>

                                  <PriorityChip priority={task.priority} size="sm" />

                                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:3 }}>
                                    <Clock size={11} />
                                    {task.estimatedMinutes || 30}m
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

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
              {sortedEmployees.map(emp => {
                const hasPlan = assignedEmployeeIds.has(emp.employeeId);
                return (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.firstName} {emp.lastName} ({emp.workEmail}) {hasPlan ? '— [Active Plan]' : '⚡ [Awaiting Plan]'}
                  </option>
                );
              })}
            </Select>
          </div>

          {isSelectedEmpAssigned && (
            <div style={{ padding:'8px 12px', borderRadius:'var(--r-md)', background:'var(--info-bg, #EFF6FF)', border:'1px solid var(--info-border, #BFDBFE)', color:'var(--info, #2563EB)', fontSize:'0.8125rem' }}>
              ℹ️ This employee already has an active onboarding plan. Submitting will extend their roadmap with this curriculum and append additional priority tasks.
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
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
            <div>
              <Label>Task Priority Level</Label>
              <Select
                value={newPlan.priority || 'high'}
                onChange={e => setNewPlan(p => ({ ...p, priority: e.target.value }))}
              >
                <option value="critical">Critical Priority 🔴</option>
                <option value="high">High Priority 🟡</option>
                <option value="medium">Medium Priority 🔵</option>
                <option value="low">Low Priority ⚪</option>
              </Select>
            </div>
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
              {isSelectedEmpAssigned ? 'Extend Roadmap & Assign Tasks' : 'Initialize Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
