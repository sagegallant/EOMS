import { useState } from 'react';
import { Card, Button, Badge, Progress, Avatar, Modal, Input, Select, Label } from '../../components/common/ui';
import { Compass, Plus, Filter, Calendar, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const INITIAL_COHORTS = [
  {
    id: 1,
    name: 'Aarav Sharma',
    role: 'Senior Software Engineer (SDE-II)',
    dept: 'Platform Engineering',
    hub: 'Bengaluru (Hybrid)',
    startDate: 'Jan 12, 2026',
    targetDate: 'Apr 12, 2026',
    progress: 72,
    phase: '60 Days: Project Ownership',
    status: 'On Track',
    tone: 'success',
  },
  {
    id: 2,
    name: 'Sneha Kulkarni',
    role: 'Senior Product Designer',
    dept: 'Product & UI/UX Design',
    hub: 'Pune (Hybrid)',
    startDate: 'Jan 20, 2026',
    targetDate: 'Apr 20, 2026',
    progress: 45,
    phase: '30 Days: Integration',
    status: 'Needs Review',
    tone: 'warning',
  },
  {
    id: 3,
    name: 'Arjun Rao',
    role: 'Cloud Infrastructure Specialist',
    dept: 'Cloud & Infrastructure',
    hub: 'Hyderabad (On-site)',
    startDate: 'Feb 02, 2026',
    targetDate: 'May 02, 2026',
    progress: 88,
    phase: '90 Days: Final Evaluation',
    status: 'Ahead of Schedule',
    tone: 'success',
  },
  {
    id: 4,
    name: 'Ananya Iyer',
    role: 'Lead Frontend Architect',
    dept: 'Platform Engineering',
    hub: 'Bengaluru (Hybrid)',
    startDate: 'Feb 10, 2026',
    targetDate: 'May 10, 2026',
    progress: 60,
    phase: '30 Days: Integration',
    status: 'On Track',
    tone: 'success',
  },
  {
    id: 5,
    name: 'Kabir Mehta',
    role: 'Senior Software Engineer (SDE-II)',
    dept: 'Platform Engineering',
    hub: 'Gurugram (Hybrid)',
    startDate: 'Feb 20, 2026',
    targetDate: 'May 20, 2026',
    progress: 35,
    phase: 'Week 1: Team & Foundations',
    status: 'On Track',
    tone: 'info',
  },
  {
    id: 6,
    name: 'Aditya Sengupta',
    role: 'Senior Software Engineer (SDE-II)',
    dept: 'Platform Engineering',
    hub: 'Remote (Pan-India)',
    startDate: 'Mar 01, 2026',
    targetDate: 'Jun 01, 2026',
    progress: 15,
    phase: 'Day 1: Orientation',
    status: 'Just Started',
    tone: 'info',
  },
];

export default function OnboardingView() {
  const [cohorts, setCohorts] = useState(INITIAL_COHORTS);
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterHub, setFilterHub] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    role: 'Senior Software Engineer (SDE-II)',
    dept: 'Platform Engineering',
    hub: 'Bengaluru (Hybrid)',
    template: 'Engineering 90-Day Ramp-Up (India Tech Hubs)',
    startDate: new Date().toISOString().slice(0, 10),
  });

  const filtered = cohorts.filter(c => {
    if (filterDept !== 'ALL' && c.dept !== filterDept) return false;
    if (filterHub !== 'ALL' && !c.hub.includes(filterHub)) return false;
    return true;
  });

  const handleCreatePlan = e => {
    e.preventDefault();
    if (!newPlan.name.trim()) return;

    const item = {
      id: Date.now(),
      name: newPlan.name,
      role: newPlan.role,
      dept: newPlan.dept,
      hub: newPlan.hub,
      startDate: newPlan.startDate,
      targetDate: '90 Days from start',
      progress: 0,
      phase: 'Pre-boarding',
      status: 'Just Started',
      tone: 'info',
    };

    setCohorts([item, ...cohorts]);
    setIsModalOpen(false);
    setNewPlan({
      name: '',
      role: 'Senior Software Engineer (SDE-II)',
      dept: 'Platform Engineering',
      hub: 'Bengaluru (Hybrid)',
      template: 'Engineering 90-Day Ramp-Up (India Tech Hubs)',
      startDate: new Date().toISOString().slice(0, 10),
    });
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Onboarding Cohorts &amp; Journeys</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Monitor and guide new team members across 30, 60, and 90-day milestone phases across India Tech Hubs.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Assign Onboarding Plan
        </Button>
      </header>

      {/* ── Filters & Stats Bar ── */}
      <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Filter size={15} /> Filters:
            </div>
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Departments</option>
              <option value="Platform Engineering">Platform Engineering</option>
              <option value="Product & UI/UX Design">Product & UI/UX Design</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
            </select>

            <select
              value={filterHub}
              onChange={e => setFilterHub(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--r-sm)',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Tech Hubs</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Gurugram">Gurugram</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Active Cohort: <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong></span>
            <span>Avg Progress: <strong style={{ color: 'var(--primary)' }}>
              {Math.round(filtered.reduce((a, c) => a + c.progress, 0) / (filtered.length || 1))}%
            </strong></span>
          </div>
        </div>
      </Card>

      {/* ── Cohort Cards Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--sp-4)' }}>
        {filtered.map(c => (
          <Card key={c.id} $hoverable style={{ display: 'grid', gap: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar name={c.name} size={44} />
                <div>
                  <h3 className="h3">{c.name}</h3>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>{c.role}</div>
                </div>
              </div>
              <Badge tone={c.tone}>{c.status}</Badge>
            </div>

            <div style={{ fontSize: '0.8125rem', display: 'grid', gap: 6, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.dept}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Office Location:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.hub}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Phase:</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{c.phase}</span>
              </div>
            </div>

            <div>
              <Progress value={c.progress} label="Onboarding Progress" size="md" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
              <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} /> Started {c.startDate}
              </div>
              <Button size="xs" variant="soft">
                View Journey <ArrowRight size={13} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Assign Plan Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign New Onboarding Plan"
        description="Enroll a new team member into an Indian tech hub onboarding cohort."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePlan}>Create &amp; Assign Plan</Button>
          </>
        }
      >
        <form onSubmit={handleCreatePlan} style={{ display: 'grid', gap: 14 }}>
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
            >
              <option value="Platform Engineering">Platform Engineering</option>
              <option value="Product & UI/UX Design">Product & UI/UX Design</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure Operations</option>
              <option value="People Operations">People Operations (HR)</option>
              <option value="Finance & Payroll">Finance & Payroll</option>
            </Select>
          </div>
          <div>
            <Label>Job Role</Label>
            <Input
              required
              placeholder="e.g. Senior Software Engineer (SDE-II)"
              value={newPlan.role}
              onChange={e => setNewPlan({ ...newPlan, role: e.target.value })}
            />
          </div>
          <div>
            <Label>Tech Hub Location</Label>
            <Select
              value={newPlan.hub}
              onChange={e => setNewPlan({ ...newPlan, hub: e.target.value })}
            >
              <option value="Bengaluru (Hybrid)">Bengaluru - Bellandur Tech Hub</option>
              <option value="Hyderabad (On-site)">Hyderabad - HITEC City</option>
              <option value="Pune (Hybrid)">Pune - Hinjawadi Phase 1</option>
              <option value="Gurugram (Hybrid)">Gurugram - Cyber City</option>
              <option value="Mumbai (On-site)">Mumbai - BKC</option>
              <option value="Remote (Pan-India)">Remote (Pan-India)</option>
            </Select>
          </div>
          <div>
            <Label>Onboarding Template</Label>
            <Select
              value={newPlan.template}
              onChange={e => setNewPlan({ ...newPlan, template: e.target.value })}
            >
              <option value="Engineering 90-Day Ramp-Up (India Tech Hubs)">Engineering 90-Day Ramp-Up (India Tech Hubs)</option>
              <option value="General Corporate & Business Operations">General Corporate & Business Operations</option>
              <option value="Product Design & UX Immersion">Product Design & UX Immersion</option>
            </Select>
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={newPlan.startDate}
              onChange={e => setNewPlan({ ...newPlan, startDate: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
