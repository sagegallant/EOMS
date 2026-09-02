import { useState } from 'react';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, AnimatedList, AnimatedItem, PageHeader } from '../../components/common/ui';
import { HorizontalBar, MiniDonut } from '../../components/common/charts';
import { Plus, Search, Filter, X, Mail, MapPin } from 'lucide-react';

const EMPLOYEES = [
  { id: 1, name: 'Aarav Sharma',   role: 'SDE-II',                    dept: 'Platform Engineering', hub: 'Bengaluru', email: 'aarav.sharma@eoms.in',     progress: 72, status: 'On Track',     tone: 'success' },
  { id: 2, name: 'Sneha Kulkarni', role: 'Senior Product Designer',    dept: 'Product & UI/UX',      hub: 'Pune',       email: 'sneha.kulkarni@eoms.in',   progress: 45, status: 'Needs Review', tone: 'warning' },
  { id: 3, name: 'Arjun Rao',      role: 'Cloud Infra Specialist',     dept: 'Cloud & Infra',        hub: 'Hyderabad',  email: 'arjun.rao@eoms.in',        progress: 88, status: 'On Track',     tone: 'success' },
  { id: 4, name: 'Ananya Iyer',    role: 'Lead Frontend Architect',    dept: 'Platform Engineering', hub: 'Bengaluru',  email: 'ananya.iyer@eoms.in',      progress: 60, status: 'On Track',     tone: 'success' },
  { id: 5, name: 'Kabir Mehta',    role: 'SDE-II',                    dept: 'Platform Engineering', hub: 'Gurugram',   email: 'kabir.mehta@eoms.in',      progress: 35, status: 'Just Started', tone: 'info' },
  { id: 6, name: 'Tanvi Reddy',    role: 'Talent Partner',            dept: 'People Ops',            hub: 'Hyderabad',  email: 'tanvi.reddy@eoms.in',      progress: 55, status: 'On Track',     tone: 'success' },
  { id: 7, name: 'Pooja Desai',    role: 'Product Operations Lead',   dept: 'Product & UI/UX',      hub: 'Mumbai',     email: 'pooja.desai@eoms.in',      progress: 20, status: 'Just Started', tone: 'info' },
];

const DEPT_BARS = [
  { label: 'Platform Engineering', value: 3, displayValue: '3 employees' },
  { label: 'Product & UI/UX',      value: 2, displayValue: '2 employees' },
  { label: 'Cloud & Infra',        value: 1, displayValue: '1 employee' },
  { label: 'People Ops',           value: 1, displayValue: '1 employee' },
];

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');
  const [isModalOpen, setModal] = useState(false);
  const [newEmp, setNew] = useState({ name: '', role: '', dept: 'Platform Engineering', hub: 'Bengaluru', email: '' });

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    if (q && !e.name.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q)) return false;
    if (filterDept !== 'ALL' && e.dept !== filterDept) return false;
    return true;
  });

  const onTrack = employees.filter(e => e.status === 'On Track' || e.status === 'Ahead of Schedule').length;

  const handleAdd = ev => {
    ev.preventDefault();
    if (!newEmp.name.trim()) return;
    setEmployees([{ id: Date.now(), ...newEmp, progress: 0, status: 'Just Started', tone: 'info' }, ...employees]);
    setModal(false);
    setNew({ name: '', role: '', dept: 'Platform Engineering', hub: 'Bengaluru', email: '' });
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <PageHeader
        title="Employee Directory"
        subtitle={`${filtered.length} of ${employees.length} employees`}
        action={<Button size="sm" icon={Plus} onClick={() => setModal(true)}>Add Employee</Button>}
      />

      {/* ── Summary Charts (Bento Grid) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--sp-5)' }}>
        <Card $hoverable style={{ gridColumn: 'span 5', padding: 'var(--sp-5)' }}>
          <p className="meta" style={{ fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-4)' }}>Onboarding Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <MiniDonut value={onTrack} total={employees.length} label={`${onTrack}`} sublabel="on track" size={96} color="var(--chart-emerald)" />
            <div style={{ fontSize: '0.9375rem', display: 'grid', gap: 10, flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}><span style={{ color: 'var(--text-secondary)' }}>On Track</span><span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{onTrack}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}><span style={{ color: 'var(--text-secondary)' }}>Needs Review</span><span style={{ fontWeight: 600, color: 'var(--warning-text)' }}>{employees.filter(e => e.status === 'Needs Review').length}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}><span style={{ color: 'var(--text-secondary)' }}>Just Started</span><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{employees.filter(e => e.status === 'Just Started').length}</span></div>
            </div>
          </div>
        </Card>
        <Card $hoverable style={{ gridColumn: 'span 7', padding: 'var(--sp-5)' }}>
          <p className="meta" style={{ fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--sp-4)' }}>By Department</p>
          <HorizontalBar items={DEPT_BARS} colorVar="--chart-blue" />
        </Card>
      </div>

      {/* ── Search + Filter ── */}
      <Card style={{ padding: 'var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or role…"
              style={{ width: '100%', padding: '8px 12px 8px 34px', fontSize: '0.875rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', outline: 'none' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')} />
          </div>
          <Button variant="ghost" size="sm" icon={Filter} onClick={() => setShowFilters(v => !v)}>
            Filter {filterDept !== 'ALL' && '●'}
          </Button>
          {showFilters && (
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.875rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
              <option value="ALL">All Departments</option>
              <option>Platform Engineering</option><option>Product & UI/UX</option>
              <option>Cloud & Infra</option><option>People Ops</option>
            </select>
          )}
          {filterDept !== 'ALL' && (
            <button onClick={() => setFilterDept('ALL')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </Card>

      {/* ── Directory list ── */}
      <AnimatedList style={{ display: 'grid', gap: 8 }}>
        {filtered.map(emp => (
          <AnimatedItem key={emp.id}>
            <Card $hoverable style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Avatar name={emp.name} size={44} />
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                <div className="meta" style={{ color: 'var(--text-muted)', marginTop: 2, fontWeight: 500 }}>{emp.role} · {emp.dept}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                <MapPin size={13} />{emp.hub}
              </div>
              <div style={{ width: 100 }}>
                <div style={{ height: 4, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${emp.progress}%`, background: 'var(--primary)', borderRadius: 'inherit', transition: 'width 600ms var(--ease)' }} />
                </div>
                <div className="meta" style={{ marginTop: 4, textAlign: 'right', fontWeight: 500 }}>{emp.progress}%</div>
              </div>
              <Badge tone={emp.tone}>{emp.status}</Badge>
            </Card>
          </AnimatedItem>
        ))}
      </AnimatedList>

      <Modal isOpen={isModalOpen} onClose={() => setModal(false)} title="Add Employee"
        footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button><Button onClick={handleAdd}>Add Employee</Button></>}>
        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 14 }}>
          <div><Label>Full Name</Label><Input required placeholder="e.g. Karthik Krishnan" value={newEmp.name} onChange={e => setNew({ ...newEmp, name: e.target.value })} /></div>
          <div><Label>Job Role</Label><Input required placeholder="e.g. QA Automation Engineer" value={newEmp.role} onChange={e => setNew({ ...newEmp, role: e.target.value })} /></div>
          <div><Label>Department</Label>
            <Select value={newEmp.dept} onChange={e => setNew({ ...newEmp, dept: e.target.value })}>
              <option>Platform Engineering</option><option>Product & UI/UX</option>
              <option>Cloud & Infra</option><option>People Ops</option><option>Finance & Payroll</option>
            </Select>
          </div>
          <div><Label>Tech Hub</Label>
            <Select value={newEmp.hub} onChange={e => setNew({ ...newEmp, hub: e.target.value })}>
              <option>Bengaluru</option><option>Hyderabad</option><option>Pune</option><option>Gurugram</option><option>Mumbai</option><option>Remote</option>
            </Select>
          </div>
          <div><Label>Email</Label><Input type="email" placeholder="firstname.lastname@eoms.in" value={newEmp.email} onChange={e => setNew({ ...newEmp, email: e.target.value })} /></div>
        </form>
      </Modal>
    </div>
  );
}
