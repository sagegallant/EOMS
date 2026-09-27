import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CircularArc, DarkPanel, DarkTaskItem, Badge, Button, Avatar, useCountUp, MiniCalendar } from '../../../components/common/ui';
import { VerticalBarChart } from '../../../components/common/charts';
import { CheckCircle2, Clock, Laptop, BookOpen, FileText, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../store/authStore';
import { onboardingApi } from '../../../api/onboarding';
import { taskApi } from '../../../api/tasks';
import { employeeApi } from '../../../api/employees';

const WEEKLY = [
  { day: 'Mon', value: 2 },
  { day: 'Tue', value: 4 },
  { day: 'Wed', value: 1 },
  { day: 'Thu', value: 3 },
  { day: 'Fri', value: 5 },
  { day: 'Sat', value: 0 },
  { day: 'Sun', value: 2 },
];

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let empId = user?.employeeId;

      if (!empId) {
        // Fallback for demo: load first employee
        const allEmps = await employeeApi.list();
        if (allEmps.data?.length > 0) {
          empId = allEmps.data[0].employeeId;
        }
      }

      if (empId) {
        const [empDetails, planRes, taskRes] = await Promise.all([
          employeeApi.getById(empId).catch(() => null),
          onboardingApi.getPlanByEmployeeId(empId).catch(() => null),
          taskApi.list({ employeeId: empId }).catch(() => ({ data: [] })),
        ]);

        if (empDetails?.data) setEmployee(empDetails.data);
        if (planRes?.data) setPlan(planRes.data);
        setTasks(taskRes?.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load employee onboarding details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleToggleTask = async (task) => {
    const empId = employee?.employeeId || user?.employeeId;
    if (!empId || updatingTaskId) return;

    const currentProgress = task.TaskProgresses?.find(p => p.employeeId === empId);
    const isDone = currentProgress?.status === 'completed';
    const nextStatus = isDone ? 'in_progress' : 'completed';

    setUpdatingTaskId(task.taskId);
    try {
      const res = await taskApi.updateProgress(task.taskId, {
        employeeId: empId,
        status: nextStatus,
        notes: `Toggled from Employee Dashboard by ${user?.username || 'user'}`,
      });

      // Update task in local state
      setTasks(prev =>
        prev.map(t => {
          if (t.taskId !== task.taskId) return t;
          const updatedProgresses = t.TaskProgresses ? [...t.TaskProgresses] : [];
          const idx = updatedProgresses.findIndex(p => p.employeeId === empId);
          if (idx >= 0) {
            updatedProgresses[idx] = { ...updatedProgresses[idx], status: nextStatus };
          } else {
            updatedProgresses.push({ employeeId: empId, status: nextStatus });
          }
          return { ...t, TaskProgresses: updatedProgresses };
        })
      );

      // Update plan progress from backend response
      if (res.plan) {
        setPlan(prev => prev ? { ...prev, progressPercent: res.plan.progressPercent, status: res.plan.status } : prev);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const progress = plan?.progressPercent ?? 0;
  const empName = employee ? `${employee.firstName} ${employee.lastName}` : (user?.fullName || user?.username || 'Employee');
  const jobTitle = employee?.Position?.jobTitle || 'Team Member';
  const deptName = employee?.Position?.Department?.deptName || 'Platform Engineering';
  const workLocation = employee?.workLocation || 'Bengaluru (Hybrid)';

  const completedTasks = tasks.filter(t => t.TaskProgresses?.some(p => (p.employeeId === employee?.employeeId || p.employeeId === user?.employeeId) && p.status === 'completed'));

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      {/* ── Greeting header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.02em' }}>
            Welcome back, {employee?.firstName || user?.firstName || user?.username || 'Team Member'} 👋
          </h1>
          <p className="caption" style={{ marginTop:4 }}>
            {deptName} · {workLocation} · Onboarding Hub
          </p>
        </div>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadData} isLoading={loading}>
          Refresh
        </Button>
      </div>

      {error && (
        <Card $p="var(--sp-4)" style={{ background:'var(--danger-bg)', borderColor:'var(--danger-border)', color:'var(--danger)', display:'flex', alignItems:'center', gap:10 }}>
          <AlertCircle size={18} />
          <span style={{ fontSize:'0.875rem' }}>{error}</span>
          <Button size="xs" variant="secondary" onClick={loadData} style={{ marginLeft:'auto' }}>Retry</Button>
        </Card>
      )}

      {/* ── Main 3-col: Hero + Chart + Dark panel ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr 1fr', gap:'var(--sp-4)' }}>

        {/* Employee hero card */}
        <Card $p="0" style={{ overflow:'hidden', borderRadius:'var(--r-xl)' }}>
          <div style={{ background:'linear-gradient(150deg, var(--sage-700) 0%, var(--sage-400) 100%)', padding:'var(--sp-5)', display:'flex', flexDirection:'column', gap:12 }}>
            <Avatar name={empName} size={56} />
            <div>
              <div style={{ fontSize:'1.125rem', fontWeight:700, color:'#fff' }}>{empName}</div>
              <div style={{ fontSize:'0.8125rem', color:'rgba(255,255,255,0.75)', marginTop:2 }}>{jobTitle}</div>
              <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.55)', marginTop:1 }}>{deptName} · {workLocation}</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.18)', borderRadius:'var(--r-full)', padding:'6px 14px', display:'inline-flex', alignItems:'center', gap:8, backdropFilter:'blur(4px)', width:'fit-content' }}>
              <span style={{ color:'#fff', fontSize:'0.875rem', fontWeight:700 }}>
                {plan?.startDate ? `Started ${plan.startDate}` : 'Onboarding Active'}
              </span>
            </div>
          </div>
          <div style={{ padding:'var(--sp-4)', display:'flex', justifyContent:'center' }}>
            <CircularArc
              value={progress}
              max={100}
              size={130}
              strokeWidth={10}
              color="var(--sage-600)"
              centerContent={
                <div style={{ textAlign:'center' }}>
                  <div className="kpi-md">{progress}%</div>
                  <div className="meta">journey</div>
                </div>
              }
            />
          </div>
        </Card>

        {/* Weekly activity chart */}
        <Card $p="var(--sp-5)">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
            <div>
              <h2 className="section-title">Onboarding Tasks Completed</h2>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:4 }}>
                <span className="kpi-lg">{completedTasks.length}</span>
                <span className="caption">of {tasks.length} total tasks</span>
              </div>
            </div>
            <Badge tone={progress >= 50 ? 'sage' : 'warning'}>
              {progress >= 50 ? 'On Track' : 'In Progress'}
            </Badge>
          </div>
          <VerticalBarChart data={WEEKLY} xKey="day" dataKey="value" height={150} activeIndex={4} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            <div style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="meta">Completed</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-primary)' }}>{completedTasks.length}</div>
                <div className="meta">{tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</div>
              </div>
            </div>
            <div style={{ background:'var(--sage-50)', borderRadius:'var(--r-md)', padding:'8px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="meta">Target Date</span>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--text-primary)' }}>
                  {plan?.targetCompletionDate || '30 days'}
                </div>
                <div className="meta">SLA</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Dark task panel with live toggle */}
        <DarkPanel title="My Action Items" counter={`${completedTasks.length}/${tasks.length}`} subtitle="Click to complete">
          {tasks.slice(0, 5).map((t) => {
            const isDone = t.TaskProgresses?.some(p => (p.employeeId === employee?.employeeId || p.employeeId === user?.employeeId) && p.status === 'completed');
            return (
              <DarkTaskItem
                key={t.taskId}
                title={t.title}
                subtitle={`${t.category || 'General'} · ${t.estimatedMinutes || 30}m`}
                done={isDone}
                icon={BookOpen}
                onClick={() => handleToggleTask(t)}
              />
            );
          })}
          <button
            onClick={() => navigate('/tasks')}
            style={{ marginTop:14, width:'100%', padding:'8px', borderRadius:'var(--r-md)', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:'0.8125rem', cursor:'pointer', transition:'all var(--t-fast)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
          >
            All checklist tasks ({tasks.length}) ↗
          </button>
        </DarkPanel>
      </div>

      {/* ── Direct links ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'var(--sp-4)' }}>
        <Card $hoverable onClick={() => navigate('/documents')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:14, padding:'var(--sp-4)' }}>
          <div style={{ width:40, height:40, borderRadius:'var(--r-lg)', background:'var(--sage-100)', color:'var(--sage-800)', display:'grid', placeItems:'center' }}>
            <FileText size={20} />
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.9375rem' }}>Statutory Documents</div>
            <div className="meta">Upload PAN, Aadhaar, Bank Details</div>
          </div>
        </Card>

        <Card $hoverable onClick={() => navigate('/assets')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:14, padding:'var(--sp-4)' }}>
          <div style={{ width:40, height:40, borderRadius:'var(--r-lg)', background:'var(--sage-100)', color:'var(--sage-800)', display:'grid', placeItems:'center' }}>
            <Laptop size={20} />
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.9375rem' }}>Hardware Provisioning</div>
            <div className="meta">Acknowledge assigned workstation</div>
          </div>
        </Card>

        <Card $hoverable onClick={() => navigate('/training')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:14, padding:'var(--sp-4)' }}>
          <div style={{ width:40, height:40, borderRadius:'var(--r-lg)', background:'var(--sage-100)', color:'var(--sage-800)', display:'grid', placeItems:'center' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.9375rem' }}>Compliance Training</div>
            <div className="meta">POSH Act 2013, DPDP &amp; GDPR</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
