import { useState } from 'react';
import { Card, Button, Badge, Progress, StatCard, Avatar, Modal, Input, Select, Label } from '../../../components/common/ui';
import { Users, Clock, ShieldCheck, Award, Plus, Download, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_COHORT = [
  { name: 'Aarav Sharma', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru', progress: 72, phase: '60 Days', status: 'On Track', tone: 'success' },
  { name: 'Sneha Kulkarni', role: 'Senior Product Designer', dept: 'Product & UI/UX Design', hub: 'Pune', progress: 45, phase: '30 Days', status: 'Needs Review', tone: 'warning' },
  { name: 'Arjun Rao', role: 'Cloud Infrastructure Specialist', dept: 'Cloud & Infrastructure', hub: 'Hyderabad', progress: 88, phase: '90 Days', status: 'On Track', tone: 'success' },
  { name: 'Ananya Iyer', role: 'Lead Frontend Architect', dept: 'Platform Engineering', hub: 'Bengaluru', progress: 60, phase: '30 Days', status: 'On Track', tone: 'success' },
  { name: 'Kabir Mehta', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Gurugram', progress: 35, phase: 'Week 1', status: 'Just Started', tone: 'info' },
];

export default function HRDashboard() {
  const [cohort, setCohort] = useState(INITIAL_COHORT);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectingEmp, setInspectingEmp] = useState(null);
  const [newHire, setNewHire] = useState({
    name: '',
    role: 'Senior Software Engineer (SDE-II)',
    dept: 'Platform Engineering',
    hub: 'Bengaluru',
  });
  const navigate = useNavigate();

  const handleExport = () => {
    const csvData = 'Name,Role,Department,Hub,Progress,Phase,Status\n' +
      cohort.map(c => `${c.name},${c.role},${c.dept},${c.hub},${c.progress}%,${c.phase},${c.status}`).join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EOMS_HR_Cohort_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddHire = e => {
    e.preventDefault();
    if (!newHire.name.trim()) return;
    const item = {
      name: newHire.name,
      role: newHire.role,
      dept: newHire.dept,
      hub: newHire.hub,
      progress: 0,
      phase: 'Day 1',
      status: 'Just Started',
      tone: 'info',
    };
    setCohort([item, ...cohort]);
    setIsModalOpen(false);
    setNewHire({ name: '', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru' });
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)' }} className="animate-fade-in">
      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">People Operations &amp; HR Overview</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Real-time status of India-wide employee onboarding cohorts, statutory compliance, and milestone SLAs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" icon={Download} onClick={handleExport}>
            Export Cohort (CSV)
          </Button>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            + Onboard New Employee
          </Button>
        </div>
      </header>

      {/* ── 4 Executive KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
        <StatCard
          icon={Users}
          label="Active Onboardees"
          value="18"
          hint="4 starting this week in Bengaluru"
          tone="primary"
        />
        <StatCard
          icon={Clock}
          label="Avg. Time to 100%"
          value="38 Days"
          hint="Target SLA is ≤ 45 days"
          trend="-7d vs Target"
          tone="success"
        />
        <StatCard
          icon={ShieldCheck}
          label="Pending Indian Verifications"
          value="3"
          hint="Aadhaar / EPFO verification queue"
          tone="warning"
        />
        <StatCard
          icon={Award}
          label="POSH &amp; Statutory Compliance"
          value="98.2%"
          hint="+2.4% from last month"
          tone="success"
        />
      </div>

      {/* ── Current Cohort Card ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="h2">Current Onboarding Cohort</h2>
            <p className="meta">Employees currently in their 30-60-90 day milestone progression</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding')}>
            View All Cohorts →
          </Button>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {cohort.map(emp => (
            <div
              key={emp.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderRadius: 'var(--r-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xs)',
                flexWrap: 'wrap',
              }}
            >
              <Avatar name={emp.name} size={42} />
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                <div className="meta">{emp.role} · {emp.dept} ({emp.hub})</div>
              </div>
              <div style={{ width: 150 }}>
                <Progress value={emp.progress} size="sm" showValue={false} />
                <div className="meta" style={{ marginTop: 3, textAlign: 'right' }}>
                  {emp.progress}% ({emp.phase})
                </div>
              </div>
              <Badge tone={emp.tone}>{emp.status}</Badge>
              <Button variant="soft" size="xs" onClick={() => setInspectingEmp(emp)}>
                Inspect
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Onboard New Employee Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard New Employee"
        description="Initiate an employee onboarding journey with assigned Indian statutory tasks."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddHire}>Enroll &amp; Start Onboarding</Button>
          </>
        }
      >
        <form onSubmit={handleAddHire} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Full Name</Label>
            <Input
              required
              placeholder="e.g. Ramesh Chandra"
              value={newHire.name}
              onChange={e => setNewHire({ ...newHire, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select
              value={newHire.dept}
              onChange={e => setNewHire({ ...newHire, dept: e.target.value })}
            >
              <option value="Platform Engineering">Platform Engineering</option>
              <option value="Product & UI/UX Design">Product & UI/UX Design</option>
              <option value="Cloud & Infrastructure">Cloud & Infrastructure Operations</option>
              <option value="People Operations (HR)">People Operations (HR)</option>
              <option value="Finance & Payroll">Finance & Payroll</option>
            </Select>
          </div>
          <div>
            <Label>Job Role</Label>
            <Input
              required
              placeholder="e.g. Senior Software Engineer (SDE-II)"
              value={newHire.role}
              onChange={e => setNewHire({ ...newHire, role: e.target.value })}
            />
          </div>
          <div>
            <Label>Indian Tech Hub</Label>
            <Select
              value={newHire.hub}
              onChange={e => setNewHire({ ...newHire, hub: e.target.value })}
            >
              <option value="Bengaluru">Bengaluru - Bellandur Tech Corridor</option>
              <option value="Hyderabad">Hyderabad - HITEC City</option>
              <option value="Pune">Pune - Hinjawadi</option>
              <option value="Gurugram">Gurugram - Cyber City</option>
              <option value="Remote">Remote - Pan India</option>
            </Select>
          </div>
        </form>
      </Modal>

      {/* ── Inspect Modal ── */}
      {inspectingEmp && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingEmp(null)}
          title={`Cohort Inspection: ${inspectingEmp.name}`}
          description={`${inspectingEmp.role} · ${inspectingEmp.dept} (${inspectingEmp.hub})`}
          footer={<Button onClick={() => setInspectingEmp(null)}>Done</Button>}
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', display: 'grid', gap: 8, fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Phase:</span>
                <strong>{inspectingEmp.phase}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Completion Rate:</span>
                <strong style={{ color: 'var(--primary)' }}>{inspectingEmp.progress}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>SLA Status:</span>
                <Badge tone={inspectingEmp.tone}>{inspectingEmp.status}</Badge>
              </div>
            </div>
            <Progress value={inspectingEmp.progress} label="Progress toward Day 90 full autonomy" />
          </div>
        </Modal>
      )}
    </div>
  );
}
