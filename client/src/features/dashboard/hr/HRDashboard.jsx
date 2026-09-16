import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader, StatCard } from '../../../components/common/ui';
import { MiniDonut, Sparkline, StackedBarChart, HorizontalBar } from '../../../components/common/charts';
import { Users, Clock, ShieldCheck, Award, Plus, Download, ChevronRight } from 'lucide-react';

const SPARK = [
  { w: 'W1', v: 12 }, { w: 'W2', v: 15 }, { w: 'W3', v: 11 }, { w: 'W4', v: 18 },
  { w: 'W5', v: 14 }, { w: 'W6', v: 20 }, { w: 'W7', v: 18 },
];

const PHASE_DATA = [
  { name: 'Pre-boarding', count: 2 },
  { name: 'Week 1',       count: 3 },
  { name: '30 Days',      count: 5 },
  { name: '60 Days',      count: 6 },
  { name: '90 Days',      count: 2 },
];

const HUB_DATA = [
  { label: 'Bengaluru',  value: 8,  displayValue: '8 employees' },
  { label: 'Hyderabad',  value: 4,  displayValue: '4 employees' },
  { label: 'Pune',       value: 3,  displayValue: '3 employees' },
  { label: 'Gurugram',   value: 2,  displayValue: '2 employees' },
  { label: 'Remote',     value: 1,  displayValue: '1 employee' },
];

const INITIAL_COHORT = [
  { name: 'Aarav Sharma',   role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru', progress: 72, phase: '60 Days', status: 'On Track',     tone: 'success' },
  { name: 'Sneha Kulkarni', role: 'Senior Product Designer',           dept: 'Product & UI/UX Design', hub: 'Pune',      progress: 45, phase: '30 Days', status: 'Needs Review', tone: 'warning' },
  { name: 'Arjun Rao',      role: 'Cloud Infrastructure Specialist',   dept: 'Cloud & Infrastructure',  hub: 'Hyderabad', progress: 88, phase: '90 Days', status: 'On Track',     tone: 'success' },
  { name: 'Ananya Iyer',    role: 'Lead Frontend Architect',           dept: 'Platform Engineering',     hub: 'Bengaluru', progress: 60, phase: '30 Days', status: 'On Track',     tone: 'success' },
  { name: 'Kabir Mehta',    role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering',     hub: 'Gurugram',  progress: 35, phase: 'Week 1', status: 'Just Started', tone: 'info' },
];

export default function HRDashboard() {
  const [cohort, setCohort] = useState(INITIAL_COHORT);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHire, setNewHire] = useState({ name: '', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru' });
  const navigate = useNavigate();

  const handleExport = () => {
    const csv = 'Name,Role,Department,Hub,Progress,Phase,Status\n' +
      cohort.map(c => `${c.name},${c.role},${c.dept},${c.hub},${c.progress}%,${c.phase},${c.status}`).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: `EOMS_HR_Cohort_${new Date().toISOString().slice(0,10)}.csv` });
    a.click();
  };

  const handleAdd = e => {
    e.preventDefault();
    if (!newHire.name.trim()) return;
    setCohort([{ name: newHire.name, role: newHire.role, dept: newHire.dept, hub: newHire.hub, progress: 0, phase: 'Day 1', status: 'Just Started', tone: 'info' }, ...cohort]);
    setIsModalOpen(false);
    setNewHire({ name: '', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru' });
  };

  const visible = showAll ? cohort : cohort.slice(0, 3);

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="People Operations"
        subtitle="India-wide onboarding cohort status and statutory compliance."
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExport}>Export CSV</Button>
            <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>Onboard</Button>
          </div>
        }
      />

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)' }}>
        {/* Active onboardees with sparkline */}
        <Card style={{ padding: 'var(--sp-4)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Active Onboardees</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>18</div>
              <div className="meta" style={{ marginTop: 4, color: 'var(--text-muted)' }}>4 starting this week</div>
            </div>
            <div style={{ width: 80, flexShrink: 0 }}>
              <Sparkline data={SPARK} dataKey="v" color="var(--chart-blue)" height={36} />
            </div>
          </div>
        </Card>

        {/* Avg time with donut */}
        <Card style={{ padding: 'var(--sp-4)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Avg. Time to 100%</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MiniDonut value={38} total={45} label="38d" sublabel="/ 45d" size={64} color="var(--chart-emerald)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>38 days</div>
              <div className="meta" style={{ color: 'var(--success-text)', marginTop: 2 }}>-7d vs SLA target</div>
            </div>
          </div>
        </Card>

        {/* Compliance donut */}
        <Card style={{ padding: 'var(--sp-4)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>POSH & Statutory</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MiniDonut value={98.2} total={100} label="98%" size={64} color="var(--chart-emerald)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>98.2%</div>
              <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2 }}>+2.4% from last month</div>
            </div>
          </div>
        </Card>

        {/* Pending verifications */}
        <Card style={{ padding: 'var(--sp-4)' }}>
          <p className="meta" style={{ fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Pending Verifications</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MiniDonut value={3} total={18} label="3" size={64} color="var(--warning)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>3</div>
              <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2 }}>Aadhaar / EPFO queue</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
        <Card>
          <h2 className="h3" style={{ marginBottom: 16 }}>Cohort by Phase</h2>
          <StackedBarChart
            data={PHASE_DATA}
            xKey="name"
            categories={[{ dataKey: 'count', name: 'Employees', color: 'var(--chart-blue)' }]}
            height={160}
          />
        </Card>
        <Card>
          <h2 className="h3" style={{ marginBottom: 16 }}>Distribution by Hub</h2>
          <HorizontalBar items={HUB_DATA} colorVar="--chart-violet" />
        </Card>
      </div>

      {/* ── Current Cohort ── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <h2 className="h3">Current Cohort</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding')}>View all <ChevronRight size={14} /></Button>
        </div>
        <AnimatedList style={{ display: 'grid', gap: 8 }}>
          {visible.map(emp => (
            <AnimatedItem key={emp.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                <Avatar name={emp.name} size={36} />
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                  <div className="meta" style={{ color: 'var(--text-muted)' }}>{emp.dept} · {emp.hub}</div>
                </div>
                <div style={{ width: 120 }}>
                  <div style={{ height: 3, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${emp.progress}%`, background: 'var(--primary)', borderRadius: 'inherit', transition: 'width 600ms var(--ease)' }} />
                  </div>
                  <div className="meta" style={{ marginTop: 3, textAlign: 'right', color: 'var(--text-muted)' }}>{emp.progress}%</div>
                </div>
                <Badge tone={emp.tone}>{emp.status}</Badge>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedList>
        {cohort.length > 3 && (
          <button onClick={() => setShowAll(v => !v)}
            style={{ marginTop: 10, width: '100%', padding: '7px', borderRadius: 'var(--r-md)', border: '1px dashed var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer', transition: 'all var(--t-fast)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            {showAll ? '↑ Collapse' : `+ ${cohort.length - 3} more employees`}
          </button>
        )}
      </Card>

      {/* ── Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard New Employee" description="Initiate a 30-60-90 day onboarding journey."
        footer={<><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={handleAdd}>Enroll & Start</Button></>}>
        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 14 }}>
          <div><Label>Full Name</Label><Input required placeholder="e.g. Ramesh Chandra" value={newHire.name} onChange={e => setNewHire({ ...newHire, name: e.target.value })} /></div>
          <div><Label>Department</Label>
            <Select value={newHire.dept} onChange={e => setNewHire({ ...newHire, dept: e.target.value })}>
              <option>Platform Engineering</option><option>Product & UI/UX Design</option>
              <option>Cloud & Infrastructure</option><option>People Operations (HR)</option><option>Finance & Payroll</option>
            </Select>
          </div>
          <div><Label>Job Role</Label><Input required placeholder="e.g. Senior Software Engineer (SDE-II)" value={newHire.role} onChange={e => setNewHire({ ...newHire, role: e.target.value })} /></div>
          <div><Label>Tech Hub</Label>
            <Select value={newHire.hub} onChange={e => setNewHire({ ...newHire, hub: e.target.value })}>
              <option>Bengaluru</option><option>Hyderabad</option><option>Pune</option><option>Gurugram</option><option>Remote</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
