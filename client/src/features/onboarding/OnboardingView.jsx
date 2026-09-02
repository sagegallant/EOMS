import { useState } from 'react';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { StackedBarChart, RadialProgress } from '../../components/common/charts';
import { Plus, Filter, Calendar, ChevronRight, X } from 'lucide-react';

const INITIAL_COHORTS = [
  { id: 1, name: 'Aarav Sharma',   role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru (Hybrid)',    startDate: 'Jan 12, 2026', progress: 72, phase: '60 Days: Project Ownership', status: 'On Track',          tone: 'success' },
  { id: 2, name: 'Sneha Kulkarni', role: 'Senior Product Designer',           dept: 'Product & UI/UX Design', hub: 'Pune (Hybrid)',        startDate: 'Jan 20, 2026', progress: 45, phase: '30 Days: Integration',        status: 'Needs Review',      tone: 'warning' },
  { id: 3, name: 'Arjun Rao',      role: 'Cloud Infrastructure Specialist',   dept: 'Cloud & Infrastructure',  hub: 'Hyderabad (On-site)',  startDate: 'Feb 02, 2026', progress: 88, phase: '90 Days: Final Evaluation',  status: 'Ahead of Schedule', tone: 'success' },
  { id: 4, name: 'Ananya Iyer',    role: 'Lead Frontend Architect',           dept: 'Platform Engineering',    hub: 'Bengaluru (Hybrid)',   startDate: 'Feb 10, 2026', progress: 60, phase: '30 Days: Integration',        status: 'On Track',          tone: 'success' },
  { id: 5, name: 'Kabir Mehta',    role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering',    hub: 'Gurugram (Hybrid)',    startDate: 'Feb 20, 2026', progress: 35, phase: 'Week 1: Team & Foundations', status: 'On Track',          tone: 'info' },
  { id: 6, name: 'Aditya Sengupta',role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering',   hub: 'Remote (Pan-India)',   startDate: 'Mar 01, 2026', progress: 15, phase: 'Day 1: Orientation',          status: 'Just Started',      tone: 'info' },
];

const PHASE_CHART = [
  { name: 'Pre-boarding', count: 1 },
  { name: 'Week 1',       count: 2 },
  { name: '30 Days',      count: 2 },
  { name: '60 Days',      count: 1 },
  { name: '90 Days',      count: 1 },
];

export default function OnboardingView() {
  const [cohorts, setCohorts] = useState(INITIAL_COHORTS);
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterHub, setFilterHub]   = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru (Hybrid)', template: 'Engineering 90-Day Ramp-Up', startDate: new Date().toISOString().slice(0, 10) });

  const filtered = cohorts.filter(c => {
    if (filterDept !== 'ALL' && c.dept !== filterDept) return false;
    if (filterHub !== 'ALL' && !c.hub.includes(filterHub)) return false;
    return true;
  });

  const handleCreate = e => {
    e.preventDefault();
    if (!newPlan.name.trim()) return;
    setCohorts([{ id: Date.now(), ...newPlan, progress: 0, phase: 'Pre-boarding', status: 'Just Started', tone: 'info', targetDate: '90 Days from start' }, ...cohorts]);
    setIsModalOpen(false);
    setNewPlan({ name: '', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru (Hybrid)', template: 'Engineering 90-Day Ramp-Up', startDate: new Date().toISOString().slice(0, 10) });
  };

  const avgProgress = Math.round(filtered.reduce((s, c) => s + c.progress, 0) / (filtered.length || 1));

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Onboarding"
        subtitle={`${filtered.length} employees · ${avgProgress}% avg progress`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" icon={Filter} onClick={() => setShowFilters(v => !v)}>
              Filter {(filterDept !== 'ALL' || filterHub !== 'ALL') && '●'}
            </Button>
            <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>Assign Plan</Button>
          </div>
        }
      />

      {/* Phase chart */}
      <Card $hoverable style={{ padding: 'var(--sp-5)' }}>
        <h2 className="h3" style={{ marginBottom: 'var(--sp-4)' }}>Cohort by Phase</h2>
        <StackedBarChart data={PHASE_CHART} xKey="name" categories={[{ dataKey: 'count', name: 'Employees', color: 'var(--chart-blue)' }]} height={140} />
      </Card>

      {/* Filters (progressive disclosure) */}
      {showFilters && (
        <Card style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              style={{ padding: '5px 10px', fontSize: '0.8125rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
              <option value="ALL">All Departments</option>
              <option value="Platform Engineering">Platform Engineering</option>
              <option value="Product & UI/UX Design">Product & UI/UX Design</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
            </select>
            <select value={filterHub} onChange={e => setFilterHub(e.target.value)}
              style={{ padding: '5px 10px', fontSize: '0.8125rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
              <option value="ALL">All Hubs</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Gurugram">Gurugram</option>
            </select>
            {(filterDept !== 'ALL' || filterHub !== 'ALL') && (
              <button onClick={() => { setFilterDept('ALL'); setFilterHub('ALL'); }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Cohort grid */}
      <AnimatedList style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--sp-5)' }}>
        {filtered.map(c => (
          <AnimatedItem key={c.id}>
            <Card $hoverable style={{ display: 'grid', gap: 'var(--sp-4)', padding: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Avatar name={c.name} size={40} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{c.name}</div>
                    <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{c.role}</div>
                  </div>
                </div>
                <Badge tone={c.tone}>{c.status}</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <RadialProgress value={c.progress} size={80} strokeWidth={8} color={c.tone === 'warning' ? 'var(--warning)' : c.tone === 'info' ? 'var(--chart-sky)' : 'var(--chart-emerald)'} label={`${c.progress}%`} />
                <div style={{ fontSize: '0.875rem', display: 'grid', gap: 8, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Hub</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.hub.split(' ')[0]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Phase</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.8125rem' }}>{c.phase.split(':')[0]}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}><Calendar size={13} /> {c.startDate}</span>
                    <Button size="xs" variant="ghost">View <ChevronRight size={13} /></Button>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedItem>
        ))}
      </AnimatedList>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Onboarding Plan"
        footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={handleCreate}>Create & Assign</Button></>}>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 14 }}>
          <div><Label>Employee Full Name</Label><Input required placeholder="e.g. Rohan Sen" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} /></div>
          <div><Label>Department</Label>
            <Select value={newPlan.dept} onChange={e => setNewPlan({ ...newPlan, dept: e.target.value })}>
              <option>Platform Engineering</option><option>Product & UI/UX Design</option>
              <option>Cloud & Infrastructure</option><option>People Operations</option><option>Finance & Payroll</option>
            </Select>
          </div>
          <div><Label>Job Role</Label><Input required value={newPlan.role} onChange={e => setNewPlan({ ...newPlan, role: e.target.value })} /></div>
          <div><Label>Tech Hub</Label>
            <Select value={newPlan.hub} onChange={e => setNewPlan({ ...newPlan, hub: e.target.value })}>
              <option>Bengaluru (Hybrid)</option><option>Hyderabad (On-site)</option>
              <option>Pune (Hybrid)</option><option>Gurugram (Hybrid)</option><option>Remote (Pan-India)</option>
            </Select>
          </div>
          <div><Label>Start Date</Label><Input type="date" value={newPlan.startDate} onChange={e => setNewPlan({ ...newPlan, startDate: e.target.value })} /></div>
        </form>
      </Modal>
    </div>
  );
}
