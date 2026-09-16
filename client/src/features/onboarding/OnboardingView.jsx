/**
 * OnboardingView.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Cards + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { StackedBarChart, RadialProgress } from '../../components/common/charts';
import { Plus, Filter, Calendar, ChevronRight, X, MapPin, Compass, Users } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const INITIAL_COHORTS = [
  { id: 1, name: 'Aarav Sharma',   role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru Hub',    startDate: 'Jan 12, 2026', progress: 72, phase: '60 Days: Ownership', status: 'On Track',          tone: 'success' },
  { id: 2, name: 'Sneha Kulkarni', role: 'Senior Product Designer',           dept: 'Product & UI/UX Design', hub: 'Pune Hub',         startDate: 'Jan 20, 2026', progress: 45, phase: '30 Days: Integration', status: 'Needs Review',      tone: 'warning' },
  { id: 3, name: 'Arjun Rao',      role: 'Cloud Infrastructure Specialist',   dept: 'Cloud & Infrastructure',  hub: 'Hyderabad Hub',   startDate: 'Feb 02, 2026', progress: 88, phase: '90 Days: Evaluation',  status: 'Ahead of Schedule', tone: 'success' },
  { id: 4, name: 'Ananya Iyer',    role: 'Lead Frontend Architect',           dept: 'Platform Engineering',    hub: 'Bengaluru Hub',   startDate: 'Feb 10, 2026', progress: 60, phase: '30 Days: Integration', status: 'On Track',          tone: 'success' },
  { id: 5, name: 'Kabir Mehta',    role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering',    hub: 'Gurugram Hub',    startDate: 'Feb 20, 2026', progress: 35, phase: 'Week 1: Foundations', status: 'On Track',          tone: 'info' },
  { id: 6, name: 'Aditya Sengupta',role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering',   hub: 'Remote Pan-India',startDate: 'Mar 01, 2026', progress: 15, phase: 'Day 1: Orientation',   status: 'Just Started',      tone: 'info' },
];

const PHASE_CHART = [
  { phase: 'Pre-board', count: 1 },
  { phase: 'Day 1',     count: 1 },
  { phase: 'Week 1',    count: 1 },
  { phase: '30 Days',   count: 2 },
  { phase: '60 Days',   count: 1 },
];

const UPCOMING_MILESTONES = [
  { title: 'Aarav — 60-Day Architecture Signoff', date: 'Due Sep 18', done: false },
  { title: 'Sneha — Design System Walkthrough', date: 'Due Sep 20', done: false },
  { title: 'Kabir — First Pull Request Merged', date: 'Done Sep 15', done: true },
  { title: 'Arjun — 90-Day Full Performance Review', date: 'Due Sep 25', done: false },
];

export default function OnboardingView() {
  const [cohorts, setCohorts] = useState(INITIAL_COHORTS);
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterHub, setFilterHub]   = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    role: 'Senior Software Engineer (SDE-II)',
    dept: 'Platform Engineering',
    hub: 'Bengaluru Hub',
    template: 'Engineering 90-Day Ramp-Up',
    startDate: new Date().toISOString().slice(0, 10)
  });

  const rowRef = useScrollReveal({ delay: 0.05 });
  const gridRef = useScrollReveal({ delay: 0.1 });

  const filtered = cohorts.filter(c => {
    if (filterDept !== 'ALL' && c.dept !== filterDept) return false;
    if (filterHub !== 'ALL' && !c.hub.includes(filterHub)) return false;
    return true;
  });

  const handleCreate = e => {
    e.preventDefault();
    if (!newPlan.name.trim()) return;
    setCohorts([
      { id: Date.now(), ...newPlan, progress: 0, phase: 'Pre-boarding', status: 'Just Started', tone: 'info' },
      ...cohorts
    ]);
    setIsModalOpen(false);
    setNewPlan({
      name: '',
      role: 'Senior Software Engineer (SDE-II)',
      dept: 'Platform Engineering',
      hub: 'Bengaluru Hub',
      template: 'Engineering 90-Day Ramp-Up',
      startDate: new Date().toISOString().slice(0, 10)
    });
  };

  const avgProgress = Math.round(filtered.reduce((s, c) => s + c.progress, 0) / (filtered.length || 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Onboarding Journeys"
        subtitle="Manage end-to-end 90-day onboarding pathways across all Indian engineering hubs."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" icon={Filter} onClick={() => setShowFilters(v => !v)}>
              Filters {(filterDept !== 'ALL' || filterHub !== 'ALL') && '●'}
            </Button>
            <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>Assign Plan</Button>
          </div>
        }
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Active Journeys" value={filtered.length * 16} delay={0.0} />
        <MetricPillBar label="Avg Cohort Progress" value={avgProgress} delay={0.1} />
        <MetricPillBar label="30-Day Check-in Rate" value={92} delay={0.2} />
        <MetricPillBar label="Needs Attention" value={18} delay={0.3} color="amber" />
      </div>

      {/* ── Visual Section: Phase StackedBar + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <Card style={{ padding: 'var(--sp-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 className="h3">Cohort Distribution by Phase</h3>
            <span className="caption" style={{ color: 'var(--primary)', fontWeight: 600 }}>{filtered.length} Active Candidates</span>
          </div>
          <StackedBarChart
            data={PHASE_CHART}
            xKey="phase"
            categories={[{ dataKey: 'count', name: 'Employees', color: 'var(--chart-green)' }]}
            height={130}
          />
        </Card>
        <DarkTaskCard title="Upcoming Milestones" tasks={UPCOMING_MILESTONES} />
      </div>

      {/* ── Filters (progressive disclosure) ── */}
      {showFilters && (
        <Card style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.8125rem', borderRadius: 'var(--r-full)', border: '1px solid var(--border-green)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="ALL">All Departments</option>
              <option value="Platform Engineering">Platform Engineering</option>
              <option value="Product & UI/UX Design">Product & UI/UX Design</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
            </select>
            <select
              value={filterHub}
              onChange={e => setFilterHub(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.8125rem', borderRadius: 'var(--r-full)', border: '1px solid var(--border-green)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="ALL">All Hubs</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Gurugram">Gurugram</option>
            </select>
            {(filterDept !== 'ALL' || filterHub !== 'ALL') && (
              <button
                onClick={() => { setFilterDept('ALL'); setFilterHub('ALL'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                <X size={12} /> Reset
              </button>
            )}
          </div>
        </Card>
      )}

      {/* ── Cohort Grid ── */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--sp-4)' }}>
        {filtered.map(c => (
          <Card key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar name={c.name} size={38} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{c.name}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>{c.role}</div>
                </div>
              </div>
              <Badge tone={c.tone}>{c.status}</Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <RadialProgress
                value={c.progress}
                size={74}
                strokeWidth={7}
                color="var(--chart-green)"
                label={`${c.progress}%`}
              />
              <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Hub</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} style={{ color: 'var(--primary)' }} /> {c.hub}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Milestone</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.75rem' }}>{c.phase}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}>
                    <Calendar size={11} /> {c.startDate}
                  </span>
                  <Button size="xs" variant="ghost">Details <ChevronRight size={11} /></Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Standard 90-Day Engineering Roadmap" icon={Compass}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { phase: 'Phase 0: Pre-Boarding', desc: 'EPFO & Aadhaar verification, hardware dispatch confirmation, welcome buddy intro.' },
              { phase: 'Phase 1: Day 1–7', desc: 'IT credentials handoff, POSH Act 2013 training, environment setup, manager 1:1.' },
              { phase: 'Phase 2: Days 8–30', desc: 'First starter ticket merged, codebase architecture briefing, peer pairing.' },
              { phase: 'Phase 3: Days 31–60', desc: 'Feature ownership, cross-functional syncs with product & design leads.' },
              { phase: 'Phase 4: Days 61–90', desc: 'Final performance appraisal, independent sprint delivery, permanent confirmation.' },
            ].map((r, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--primary)', marginBottom: 4 }}>{r.phase}</div>
                <div className="caption" style={{ color: 'var(--text-secondary)' }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Buddy & Mentor Network Overview" icon={Users}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { onboardee: 'Aarav Sharma', buddy: 'Vikram Malhotra', dept: 'Platform Eng', meeting: 'Bi-weekly Tuesdays' },
              { onboardee: 'Sneha Kulkarni', buddy: 'Aditi Joshi', dept: 'Design Systems', meeting: 'Weekly Thursdays' },
              { onboardee: 'Kabir Mehta', buddy: 'Rahul Verma', dept: 'Backend Core', meeting: 'Weekly Mondays' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{b.onboardee}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>Buddy: <strong style={{ color: 'var(--text-secondary)' }}>{b.buddy}</strong> ({b.dept})</div>
                </div>
                <Badge tone="info">{b.meeting}</Badge>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>

      {/* ── Assign Plan Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign New Onboarding Plan"
      >
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Employee Full Name</Label>
            <Input
              required
              placeholder="e.g. Rohan Sen"
              value={newPlan.name}
              onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select
              value={newPlan.dept}
              onChange={e => setNewPlan({ ...newPlan, dept: e.target.value })}
              options={[
                { value: 'Platform Engineering', label: 'Platform Engineering' },
                { value: 'Product & UI/UX Design', label: 'Product & UI/UX Design' },
                { value: 'Cloud & Infrastructure', label: 'Cloud & Infrastructure' },
                { value: 'People Operations', label: 'People Operations' },
              ]}
            />
          </div>
          <div>
            <Label>Job Role</Label>
            <Input
              required
              value={newPlan.role}
              onChange={e => setNewPlan({ ...newPlan, role: e.target.value })}
            />
          </div>
          <div>
            <Label>Tech Hub</Label>
            <Select
              value={newPlan.hub}
              onChange={e => setNewPlan({ ...newPlan, hub: e.target.value })}
              options={[
                { value: 'Bengaluru Hub', label: 'Bengaluru Hub' },
                { value: 'Hyderabad Hub', label: 'Hyderabad Hub' },
                { value: 'Pune Hub', label: 'Pune Hub' },
                { value: 'Gurugram Hub', label: 'Gurugram Hub' },
                { value: 'Remote Pan-India', label: 'Remote Pan-India' },
              ]}
            />
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={newPlan.startDate}
              onChange={e => setNewPlan({ ...newPlan, startDate: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 8 }}>
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create & Assign</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
