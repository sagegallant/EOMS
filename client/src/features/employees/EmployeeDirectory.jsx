/**
 * EmployeeDirectory.jsx — v2.1
 * Crextio-inspired layout: PageHeader + MetricPillBars + Charts/Dark card + Filtered Directory + Collapsibles
 */
import { useState } from 'react';
import { Card, Button, Badge, Avatar, Modal, Input, Select, Label, PageHeader, MetricPillBar, DarkTaskCard, CollapsibleRow } from '../../components/common/ui';
import { HorizontalBar, MiniDonut } from '../../components/common/charts';
import { Plus, Search, Filter, X, Mail, MapPin, Building2, CheckCircle2, Users } from 'lucide-react';
import { useScrollReveal } from '../../utils/animations';

const EMPLOYEES = [
  { id: 1, name: 'Aarav Sharma',   role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru Hub',  email: 'aarav.sharma@eoms.in',     progress: 72, status: 'On Track',     tone: 'success' },
  { id: 2, name: 'Sneha Kulkarni', role: 'Senior Product Designer',          dept: 'Product & UI/UX',      hub: 'Pune Hub',       email: 'sneha.kulkarni@eoms.in',   progress: 45, status: 'Needs Review', tone: 'warning' },
  { id: 3, name: 'Arjun Rao',      role: 'Cloud Infrastructure Specialist',   dept: 'Cloud & Infra',        hub: 'Hyderabad Hub',  email: 'arjun.rao@eoms.in',        progress: 88, status: 'On Track',     tone: 'success' },
  { id: 4, name: 'Ananya Iyer',    role: 'Lead Frontend Architect',           dept: 'Platform Engineering', hub: 'Bengaluru Hub',  email: 'ananya.iyer@eoms.in',      progress: 60, status: 'On Track',     tone: 'success' },
  { id: 5, name: 'Kabir Mehta',    role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Gurugram Hub',   email: 'kabir.mehta@eoms.in',      progress: 35, status: 'Just Started', tone: 'info' },
  { id: 6, name: 'Tanvi Reddy',    role: 'Senior Talent Partner',            dept: 'People Ops',           hub: 'Hyderabad Hub',  email: 'tanvi.reddy@eoms.in',      progress: 55, status: 'On Track',     tone: 'success' },
  { id: 7, name: 'Pooja Desai',    role: 'Product Operations Lead',           dept: 'Product & UI/UX',      hub: 'Mumbai Hub',     email: 'pooja.desai@eoms.in',      progress: 20, status: 'Just Started', tone: 'info' },
  { id: 8, name: 'Aditya Sengupta',role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', hub: 'Bengaluru Hub',  email: 'aditya.sengupta@eoms.in',  progress: 15, status: 'Just Started', tone: 'info' },
];

const DEPT_BARS = [
  { label: 'Platform Engineering', value: 4, displayValue: '4 staff' },
  { label: 'Product & UI/UX',      value: 2, displayValue: '2 staff' },
  { label: 'Cloud & Infra',        value: 1, displayValue: '1 staff' },
  { label: 'People Ops',           value: 1, displayValue: '1 staff' },
];

const COHORT_ACTIONS = [
  { title: 'Schedule 30-Day Sync — Sneha', date: 'Due Tomorrow', done: false },
  { title: 'EPFO Form 11 Verification — Kabir', date: 'Due Sep 18', done: false },
  { title: 'Welcome Kit Dispatch — Aditya', date: 'Due Sep 19', done: false },
  { title: 'Aarav Sharma POSH Certification', date: 'Verified', done: true },
];

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterDept, setFilterDept] = useState('ALL');
  const [isModalOpen, setModal] = useState(false);
  const [newEmp, setNew] = useState({
    name: '',
    role: '',
    dept: 'Platform Engineering',
    hub: 'Bengaluru Hub',
    email: ''
  });

  const rowRef = useScrollReveal({ delay: 0.05 });
  const gridRef = useScrollReveal({ delay: 0.1 });

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    if (q && !e.name.toLowerCase().includes(q) && !e.role.toLowerCase().includes(q) && !e.hub.toLowerCase().includes(q)) return false;
    if (filterDept !== 'ALL' && e.dept !== filterDept) return false;
    return true;
  });

  const onTrack = employees.filter(e => e.status === 'On Track' || e.status === 'Ahead of Schedule').length;
  const onTrackPct = Math.round((onTrack / employees.length) * 100);

  const handleAdd = ev => {
    ev.preventDefault();
    if (!newEmp.name.trim()) return;
    setEmployees([
      { id: Date.now(), ...newEmp, progress: 0, status: 'Just Started', tone: 'info' },
      ...employees
    ]);
    setModal(false);
    setNew({ name: '', role: '', dept: 'Platform Engineering', hub: 'Bengaluru Hub', email: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      {/* ── Page Header ── */}
      <PageHeader
        title="People Directory"
        subtitle="Active personnel roster across Indian technology development centers and remote locations."
        action={
          <Button size="sm" icon={Plus} onClick={() => setModal(true)}>
            Add Employee
          </Button>
        }
      />

      {/* ── Metric Pill Bars Row ── */}
      <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="Active Workforce"   value={employees.length * 12} delay={0.0} />
        <MetricPillBar label="Cohort On-Track"    value={onTrackPct} delay={0.1} />
        <MetricPillBar label="Aadhaar / PAN Done" value={88} delay={0.2} />
        <MetricPillBar label="Needs Review"       value={15} delay={0.3} color="amber" />
      </div>

      {/* ── Visual Section: Donut + Bars + DarkTaskCard ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
          <Card style={{ padding: 'var(--sp-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 12 }}>Onboarding Health</p>
            <MiniDonut
              value={onTrack}
              total={employees.length}
              label={`${onTrackPct}%`}
              sublabel="on track"
              size={84}
              color="var(--chart-green)"
            />
          </Card>
          <Card style={{ padding: 'var(--sp-4)' }}>
            <p className="meta" style={{ color: 'var(--text-faint)', marginBottom: 10 }}>Staff by Department</p>
            <HorizontalBar items={DEPT_BARS} colorVar="--chart-green" />
          </Card>
        </div>
        <DarkTaskCard title="Cohort Action Items" tasks={COHORT_ACTIONS} />
      </div>

      {/* ── Search & Filter Controls ── */}
      <Card style={{ padding: 'var(--sp-3) var(--sp-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, or city hub…"
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
          </div>
          <Button variant="outline" size="sm" icon={Filter} onClick={() => setShowFilters(v => !v)}>
            Filters {filterDept !== 'ALL' && '●'}
          </Button>
          {showFilters && (
            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--border-green)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="ALL">All Departments</option>
              <option value="Platform Engineering">Platform Engineering</option>
              <option value="Product & UI/UX">Product & UI/UX</option>
              <option value="Cloud & Infra">Cloud & Infra</option>
              <option value="People Ops">People Ops</option>
            </select>
          )}
          {(filterDept !== 'ALL' || search) && (
            <button
              onClick={() => { setFilterDept('ALL'); setSearch(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>
      </Card>

      {/* ── Employee Grid ── */}
      <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--sp-4)' }}>
        {filtered.map(emp => (
          <Card key={emp.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', padding: 'var(--sp-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar name={emp.name} size={38} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{emp.name}</div>
                  <div className="caption" style={{ color: 'var(--text-muted)' }}>{emp.role}</div>
                </div>
              </div>
              <Badge tone={emp.tone}>{emp.status}</Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem', marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Department</span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{emp.dept}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Development Hub</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={11} /> {emp.hub}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Work Email</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'monospace' }}>{emp.email}</span>
              </div>
            </div>

            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Onboarding Ramp-Up</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{emp.progress}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 'var(--r-full)', background: 'var(--bg-sunken)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${emp.progress}%`, background: 'var(--chart-green)', borderRadius: 'inherit' }} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Bottom Collapsibles ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Pan-India Technology Hub Facilities & Access Details" icon={Building2}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { hub: 'Bengaluru Tech Hub (Bellandur)', address: 'Ecospace Business Park, Outer Ring Road', lead: 'Priya Patel (HR Lead)', badge: 'RFID NFC Access' },
              { hub: 'Hyderabad Innovation Center (HITEC)', address: 'Cyber Towers, Madhapur, Hyderabad', lead: 'Arjun Rao (Infra Lead)', badge: 'Biometric Iris' },
              { hub: 'Pune Design & Product Lab (Hinjawadi)', address: 'Quadron Business Park, Hinjawadi Phase 2', lead: 'Sneha Kulkarni (Design Lead)', badge: 'Smart Card Access' },
            ].map((h, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{h.hub}</div>
                <div className="caption" style={{ color: 'var(--text-muted)', marginTop: 2 }}>{h.address}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{h.lead}</span>
                  <Badge tone="neutral">{h.badge}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleRow>

        <CollapsibleRow title="Statutory Indian Benefits & Payroll Linkages" icon={Users}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { benefit: 'Employee Provident Fund (EPF)', coverage: '12% matching contribution under EPFO statutory guidelines.' },
              { benefit: 'Group Medical Insurance (GMC)', coverage: '₹10 Lakh family floater covering employee, spouse, children & parents.' },
              { benefit: 'Gratuity & NPS Tax Exemption', coverage: 'Payment of Gratuity Act 1972 & Corporate National Pension Scheme Tier-1.' },
            ].map((b, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{b.benefit}</div>
                <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: 3 }}>{b.coverage}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
      </div>

      {/* ── Add Employee Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModal(false)}
        title="Add New Personnel Record"
      >
        <form onSubmit={handleAdd} style={{ display: 'grid', gap: 14 }}>
          <div>
            <Label>Full Legal Name</Label>
            <Input
              required
              placeholder="e.g. Divya Nair"
              value={newEmp.name}
              onChange={e => setNew({ ...newEmp, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Job Role</Label>
            <Input
              required
              placeholder="e.g. SDE-II Backend"
              value={newEmp.role}
              onChange={e => setNew({ ...newEmp, role: e.target.value })}
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select
              value={newEmp.dept}
              onChange={e => setNew({ ...newEmp, dept: e.target.value })}
              options={[
                { value: 'Platform Engineering', label: 'Platform Engineering' },
                { value: 'Product & UI/UX', label: 'Product & UI/UX' },
                { value: 'Cloud & Infra', label: 'Cloud & Infra' },
                { value: 'People Ops', label: 'People Ops' },
              ]}
            />
          </div>
          <div>
            <Label>Work Center / City Hub</Label>
            <Select
              value={newEmp.hub}
              onChange={e => setNew({ ...newEmp, hub: e.target.value })}
              options={[
                { value: 'Bengaluru Hub', label: 'Bengaluru Hub' },
                { value: 'Hyderabad Hub', label: 'Hyderabad Hub' },
                { value: 'Pune Hub', label: 'Pune Hub' },
                { value: 'Gurugram Hub', label: 'Gurugram Hub' },
                { value: 'Mumbai Hub', label: 'Mumbai Hub' },
              ]}
            />
          </div>
          <div>
            <Label>Corporate Email</Label>
            <Input
              type="email"
              placeholder="e.g. divya.nair@eoms.in"
              value={newEmp.email}
              onChange={e => setNew({ ...newEmp, email: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 8 }}>
            <Button variant="outline" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Create Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
