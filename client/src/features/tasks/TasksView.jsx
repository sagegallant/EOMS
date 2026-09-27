import { useState, useEffect } from 'react';
import { Card, Button, Badge, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { MiniDonut, HorizontalBar } from '../../components/common/charts';
import { CheckCircle2, Clock, AlertCircle, Laptop, BookOpen, FileText, CheckSquare, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { taskApi } from '../../api/tasks';
import { employeeApi } from '../../api/employees';
import { useAuthStore } from '../../store/authStore';

const PRIO_TONE = { high: 'danger', medium: 'warning', low: 'neutral', HIGH: 'danger', MEDIUM: 'warning', LOW: 'neutral' };

export default function TasksView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [showDone, setShowDone] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [effectiveEmployeeId, setEffectiveEmployeeId] = useState(null);

  const { user } = useAuthStore();

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      let empId = user?.employeeId;

      // If user is admin/manager without an employeeId attached, resolve the first active employee or Aarav Sharma
      if (!empId) {
        const empRes = await employeeApi.list();
        if (empRes.data?.length > 0) {
          empId = empRes.data[0].employeeId;
        }
      }

      setEffectiveEmployeeId(empId);

      const res = await taskApi.list(empId ? { employeeId: empId } : {});
      setTasks(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load tasks from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const toggleTask = async (task) => {
    if (!effectiveEmployeeId || updatingId) return;

    const currentProgress = task.TaskProgresses?.find(p => p.employeeId === effectiveEmployeeId);
    const isDone = currentProgress?.status === 'completed';
    const nextStatus = isDone ? 'in_progress' : 'completed';

    setUpdatingId(task.taskId);
    try {
      await taskApi.updateProgress(task.taskId, {
        employeeId: effectiveEmployeeId,
        status: nextStatus,
        notes: `Updated from web portal by ${user?.username || 'user'}`,
      });

      // Update local state directly & revalidate
      setTasks(prev =>
        prev.map(t => {
          if (t.taskId !== task.taskId) return t;
          const updatedProgresses = t.TaskProgresses ? [...t.TaskProgresses] : [];
          const idx = updatedProgresses.findIndex(p => p.employeeId === effectiveEmployeeId);
          if (idx >= 0) {
            updatedProgresses[idx] = { ...updatedProgresses[idx], status: nextStatus };
          } else {
            updatedProgresses.push({ employeeId: effectiveEmployeeId, status: nextStatus });
          }
          return { ...t, TaskProgresses: updatedProgresses };
        })
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task progress on server.');
    } finally {
      setUpdatingId(null);
    }
  };

  const isTaskCompleted = (t) => {
    const p = t.TaskProgresses?.find(tp => tp.employeeId === effectiveEmployeeId);
    return p?.status === 'completed';
  };

  const pending = tasks.filter(t => !isTaskCompleted(t));
  const completed = tasks.filter(t => isTaskCompleted(t));

  const filtered = tasks.filter(t => {
    const done = isTaskCompleted(t);
    if (!showDone && done) return false;
    if (filter !== 'ALL' && t.category !== filter) return false;
    return true;
  });

  // Dynamic category metrics
  const categoryCounts = {};
  tasks.forEach(t => {
    const cat = t.category || 'general';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const catBars = Object.entries(categoryCounts).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1).replace('_', ' '),
    value,
    displayValue: `${value} ${value === 1 ? 'task' : 'tasks'}`,
  }));

  const uniqueCategories = ['ALL', ...new Set(tasks.map(t => t.category).filter(Boolean))];

  return (
    <div style={{ display:'grid', gap:'var(--sp-5)' }}>
      <PageHeader
        title="Checklist & Tasks"
        subtitle={`${pending.length} pending · ${completed.length} completed · Server calculated progress`}
        action={
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={loadTasks} isLoading={loading}>
            Refresh
          </Button>
        }
      />

      {error && (
        <Card $p="var(--sp-4)" style={{ background:'var(--danger-bg)', borderColor:'var(--danger-border)', color:'var(--danger)', display:'flex', alignItems:'center', gap:10 }}>
          <AlertCircle size={18} />
          <span style={{ fontSize:'0.875rem' }}>{error}</span>
          <Button size="xs" variant="secondary" onClick={loadTasks} style={{ marginLeft:'auto' }}>Retry</Button>
        </Card>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'var(--sp-4)' }}>
        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:12 }}>Completion Velocity</div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <MiniDonut
              value={completed.length}
              total={tasks.length || 1}
              label={`${completed.length}`}
              sublabel={`/ ${tasks.length}`}
              size={72}
              color="var(--chart-1)"
            />
            <div style={{ fontSize:'0.8125rem', display:'grid', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', gap:16 }}>
                <span style={{ color:'var(--text-muted)' }}>Completed</span>
                <span style={{ fontWeight:700, color:'var(--sage-700)', fontFeatureSettings:'"tnum" 1' }}>{completed.length}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', gap:16 }}>
                <span style={{ color:'var(--text-muted)' }}>Pending</span>
                <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{pending.length}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card $p="var(--sp-4)">
          <div className="label-caps" style={{ marginBottom:10 }}>By Category</div>
          {catBars.length > 0 ? (
            <HorizontalBar items={catBars.slice(0, 4)} colorVar="--chart-1" />
          ) : (
            <p className="caption" style={{ color:'var(--text-muted)', paddingTop:12 }}>No categories available.</p>
          )}
        </Card>
      </div>

      <Card $p="var(--sp-5)">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {uniqueCategories.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding:'4px 11px',
                  borderRadius:'var(--r-full)',
                  fontSize:'0.75rem',
                  fontWeight:600,
                  border:'1.5px solid',
                  cursor:'pointer',
                  transition:'all var(--t-fast)',
                  borderColor: filter === f ? 'var(--sage-600)' : 'var(--border-default)',
                  background: filter === f ? 'var(--sage-100)' : 'transparent',
                  color: filter === f ? 'var(--sage-800)' : 'var(--text-muted)',
                }}
              >
                {f === 'ALL' ? 'All' : f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowDone(v => !v)}
            className="meta"
            style={{ color:'var(--text-muted)', cursor:'pointer', background:'none', border:'none', textDecoration:'underline' }}
          >
            {showDone ? 'Hide Completed' : `Show Completed (${completed.length})`}
          </button>
        </div>

        {loading ? (
          <div style={{ padding:'24px 0', textAlign:'center', color:'var(--text-muted)' }}>
            <div className="caption">Loading tasks from database…</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:'32px 0', textAlign:'center', color:'var(--text-muted)' }}>
            <CheckSquare size={32} style={{ margin:'0 auto 8px', opacity:0.4 }} />
            <div className="h3">No tasks matching filter</div>
            <div className="caption" style={{ marginTop:4 }}>All current checklist items in this view are completed!</div>
          </div>
        ) : (
          <AnimatedList style={{ display:'grid', gap:6 }}>
            {filtered.map(task => {
              const done = isTaskCompleted(task);
              const isUpdating = updatingId === task.taskId;

              return (
                <AnimatedItem key={task.taskId}>
                  <div
                    onClick={() => toggleTask(task)}
                    style={{
                      display:'flex',
                      alignItems:'center',
                      gap:12,
                      padding:'10px 14px',
                      borderRadius:'var(--r-md)',
                      border:'1px solid var(--border-subtle)',
                      opacity: done ? 0.6 : 1,
                      cursor: isUpdating ? 'wait' : 'pointer',
                      transition:'all var(--t-fast)',
                      background:'var(--bg-surface)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--sage-300)';
                      e.currentTarget.style.background = 'var(--sage-50)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'var(--bg-surface)';
                    }}
                  >
                    <div
                      style={{
                        width:20,
                        height:20,
                        borderRadius:4,
                        border:`2px solid ${done ? 'var(--sage-600)' : 'var(--border-default)'}`,
                        background: done ? 'var(--sage-600)' : 'transparent',
                        display:'grid',
                        placeItems:'center',
                        flexShrink:0,
                        transition:'all var(--t-fast)',
                      }}
                    >
                      {done && (
                        <svg width="11" height="11" viewBox="0 0 11 11">
                          <path d="M2 5.5L4.5 8L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div
                        style={{
                          fontSize:'0.875rem',
                          fontWeight: done ? 400 : 500,
                          color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: done ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </div>
                      <div className="meta">
                        {task.category?.replace('_', ' ')} · {task.estimatedMinutes || 30} mins
                        {task.description && ` · ${task.description.slice(0, 60)}…`}
                      </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Badge tone={PRIO_TONE[task.priority] || 'neutral'}>
                        {task.priority || 'medium'}
                      </Badge>
                      <span className="meta" style={{ display:'flex', alignItems:'center', gap:3 }}>
                        <Clock size={11} /> Phase {task.Checklist?.phaseOrder || 1}
                      </span>
                    </div>
                  </div>
                </AnimatedItem>
              );
            })}
          </AnimatedList>
        )}
      </Card>
    </div>
  );
}
