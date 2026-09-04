import { useState } from 'react';
import { Card, Button, Badge, Progress, Modal, Input, Select, Label } from '../../components/common/ui';
import { CheckSquare, Plus, Filter, Clock, AlertCircle, CheckCircle, Tag } from 'lucide-react';

const INITIAL_TASKS = [
  { id: 1, phase: 'Pre-boarding', title: 'Upload Government Identity Proof (Aadhaar & PAN Card)', category: 'Compliance', priority: 'Critical', minutes: 20, done: true, due: 'Completed' },
  { id: 2, phase: 'Pre-boarding', title: 'Complete EPFO Form 11 & UAN declaration for PF', category: 'Administrative', priority: 'High', minutes: 25, done: true, due: 'Completed' },
  { id: 3, phase: 'Pre-boarding', title: 'Submit Relieving Letter & Service Certificate from previous employer', category: 'Administrative', priority: 'High', minutes: 15, done: true, due: 'Completed' },
  { id: 4, phase: 'Pre-boarding', title: 'Confirm delivery address for corporate MacBook Pro kit (Bengaluru Hub)', category: 'IT Setup', priority: 'High', minutes: 10, done: true, due: 'Completed' },

  { id: 5, phase: 'Day 1: Orientation', title: 'Collect MacBook Pro 16" & complete IT asset handover sign-off', category: 'IT Setup', priority: 'Critical', minutes: 30, done: true, due: 'Completed' },
  { id: 6, phase: 'Day 1: Orientation', title: 'Activate Google Workspace & configure hardware YubiKey / 2FA', category: 'IT Setup', priority: 'Critical', minutes: 25, done: true, due: 'Completed' },
  { id: 7, phase: 'Day 1: Orientation', title: 'Attend Virtual Welcome by People Operations (HR) team', category: 'Administrative', priority: 'High', minutes: 60, done: true, due: 'Completed' },
  { id: 8, phase: 'Day 1: Orientation', title: 'Acknowledge POSH Act 2013 Policy & ICC Committee details', category: 'Compliance', priority: 'Critical', minutes: 30, done: true, due: 'Completed' },

  { id: 9, phase: 'Week 1: Foundations', title: 'Meet Engineering Director (Vikram Malhotra) for 1:1 goal setting', category: '1:1 Meeting', priority: 'High', minutes: 45, done: true, due: 'Completed' },
  { id: 10, phase: 'Week 1: Foundations', title: 'Connect with designated Technical Buddy (Karthik Krishnan)', category: 'Administrative', priority: 'Medium', minutes: 30, done: true, due: 'Completed' },
  { id: 11, phase: 'Week 1: Foundations', title: 'Complete Information Security & DPDP Compliance Module', category: 'Training', priority: 'Critical', minutes: 60, done: true, due: 'Completed' },
  { id: 12, phase: 'Week 1: Foundations', title: 'Configure local Docker environment, Node.js & GitHub SSH keys', category: 'IT Setup', priority: 'High', minutes: 90, done: true, due: 'Completed' },

  { id: 13, phase: '30 Days: Integration', title: 'Submit first code pull request & obtain team review sign-off', category: 'Training', priority: 'High', minutes: 120, done: false, due: 'Due tomorrow' },
  { id: 14, phase: '30 Days: Integration', title: 'Complete POSH Sensitization Interactive Course & Certification Quiz', category: 'Compliance', priority: 'Critical', minutes: 45, done: false, due: 'Due in 3 days' },
  { id: 15, phase: '30 Days: Integration', title: 'Conduct 30-Day Check-in & Feedback Survey with Manager', category: '1:1 Meeting', priority: 'High', minutes: 45, done: false, due: 'Due Mar 25' },

  { id: 16, phase: '60 Days: Project Ownership', title: 'Lead technical feature sprint and participate in on-call shadow', category: 'Training', priority: 'Medium', minutes: 180, done: false, due: 'Due Apr 15' },
  { id: 17, phase: '60 Days: Project Ownership', title: '60-Day Milestone Sign-off with Department Manager', category: '1:1 Meeting', priority: 'High', minutes: 45, done: false, due: 'Due Apr 20' },

  { id: 18, phase: '90 Days: Final Evaluation', title: '90-Day Comprehensive Performance & Milestone Evaluation', category: '1:1 Meeting', priority: 'Critical', minutes: 60, done: false, due: 'Due May 10' },
  { id: 19, phase: '90 Days: Final Evaluation', title: 'Formal transition from Onboarding to Full Active Contributor status', category: 'Administrative', priority: 'High', minutes: 30, done: false, due: 'Due May 12' },
];

const PHASES = ['All Phases', 'Pre-boarding', 'Day 1: Orientation', 'Week 1: Foundations', '30 Days: Integration', '60 Days: Project Ownership', '90 Days: Final Evaluation'];

export default function TasksView() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selectedPhase, setSelectedPhase] = useState('All Phases');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    phase: 'Week 1: Foundations',
    category: 'IT Setup',
    priority: 'High',
    minutes: 30,
    due: 'Due in 5 days',
  });

  const toggleTask = id => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, done: !t.done, due: !t.done ? 'Completed just now' : 'Pending' } : t)));
  };

  const handleAddTask = e => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const taskItem = {
      id: Date.now(),
      title: newTask.title,
      phase: newTask.phase,
      category: newTask.category,
      priority: newTask.priority,
      minutes: Number(newTask.minutes),
      done: false,
      due: newTask.due,
    };

    setTasks([...tasks, taskItem]);
    setIsModalOpen(false);
    setNewTask({
      title: '',
      phase: 'Week 1: Foundations',
      category: 'IT Setup',
      priority: 'High',
      minutes: 30,
      due: 'Due in 5 days',
    });
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedPhase !== 'All Phases' && t.phase !== selectedPhase) return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.done).length;
  const overallProgress = Math.round((completedCount / tasks.length) * 100);

  const getPriorityTone = priority => {
    if (priority === 'Critical') return 'danger';
    if (priority === 'High') return 'warning';
    if (priority === 'Medium') return 'info';
    return 'neutral';
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Tasks &amp; Phased Checklists</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Interactive 30-60-90 day milestone progression. Check off items as you complete them.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          + Add Custom Task
        </Button>
      </header>

      {/* ── Progress Card ── */}
      <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span className="caption" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Checklist Completion</span>
            <div className="h2" style={{ marginTop: 2 }}>{completedCount} of {tasks.length} tasks completed ({overallProgress}%)</div>
          </div>
          <Badge tone={overallProgress >= 70 ? 'success' : 'info'} showDot>
            {overallProgress >= 70 ? 'On Track for 90-Day Target' : 'Action Items Pending'}
          </Badge>
        </div>
        <Progress value={overallProgress} size="lg" showValue={false} />
      </Card>

      {/* ── Filter Tabs ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {PHASES.map(p => (
          <button
            key={p}
            onClick={() => setSelectedPhase(p)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--r-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all var(--t-fast) var(--ease)',
              background: selectedPhase === p ? 'var(--primary)' : 'var(--bg-surface)',
              color: selectedPhase === p ? '#FFFFFF' : 'var(--text-secondary)',
              border: `1px solid ${selectedPhase === p ? 'var(--primary)' : 'var(--border-subtle)'}`,
              boxShadow: selectedPhase === p ? '0 2px 4px rgba(79,70,229,0.25)' : 'var(--shadow-xs)',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── Tasks List ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <h2 className="h2">{selectedPhase} ({filteredTasks.length} items)</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="caption" style={{ color: 'var(--text-muted)' }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '0.78rem',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Categories</option>
              <option value="Compliance">Compliance</option>
              <option value="IT Setup">IT Setup</option>
              <option value="Training">Training</option>
              <option value="1:1 Meeting">1:1 Meeting</option>
              <option value="Administrative">Administrative</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {filteredTasks.map(t => (
            <div
              key={t.id}
              onClick={() => toggleTask(t.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                background: t.done ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                border: `1px solid ${t.done ? 'var(--border-subtle)' : 'var(--border-default)'}`,
                boxShadow: t.done ? 'none' : 'var(--shadow-xs)',
                cursor: 'pointer',
                transition: 'all var(--t-fast) var(--ease)',
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => toggleTask(t.id)}
                onClick={e => e.stopPropagation()}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: 'var(--primary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />

              {/* Title & metadata */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: t.done ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: t.done ? 'line-through' : 'none',
                  }}
                >
                  {t.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={12} /> {t.category}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> ~{t.minutes} mins
                  </span>
                  <span>{t.due}</span>
                </div>
              </div>

              {/* Badges */}
              <Badge tone={getPriorityTone(t.priority)} showDot={false}>
                {t.priority}
              </Badge>

              <Badge tone={t.done ? 'success' : 'neutral'}>
                {t.done ? 'Completed' : 'To Do'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Add Custom Task Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Custom Checklist Task"
        description="Append a new actionable task to an onboarding phase."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask}>Add to Checklist</Button>
          </>
        }
      >
        <form onSubmit={handleAddTask} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Task Title</Label>
            <Input
              required
              placeholder="e.g. Schedule deep-dive on microservices with tech lead"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Checklist Phase</Label>
            <Select
              value={newTask.phase}
              onChange={e => setNewTask({ ...newTask, phase: e.target.value })}
            >
              {PHASES.filter(p => p !== 'All Phases').map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={newTask.category}
              onChange={e => setNewTask({ ...newTask, category: e.target.value })}
            >
              <option value="IT Setup">IT Setup</option>
              <option value="Compliance">Compliance</option>
              <option value="Training">Training</option>
              <option value="1:1 Meeting">1:1 Meeting</option>
              <option value="Administrative">Administrative</option>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select
              value={newTask.priority}
              onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </Select>
          </div>
          <div>
            <Label>Estimated Duration (Minutes)</Label>
            <Input
              type="number"
              value={newTask.minutes}
              onChange={e => setNewTask({ ...newTask, minutes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
