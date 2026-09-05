import { useState, useEffect } from 'react';
import { Card, Button, Badge, Avatar, Input, Modal, Select, Label } from '../../components/common/ui';
import { api } from '../../api/client';
import { Users, Plus, Search, Mail, MapPin, Building, Eye, Calendar, Phone, CheckCircle2, ShieldCheck } from 'lucide-react';

const INITIAL_DIRECTORY = [
  { id: 1, name: 'Aarav Sharma', email: 'aarav.sharma@eoms.in', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', location: 'Bengaluru (Hybrid)', status: 'onboarding', progress: 72, manager: 'Vikram Malhotra', phone: '+91 98450 12345' },
  { id: 2, name: 'Priya Patel', email: 'priya.patel@eoms.in', role: 'Head of People Operations', dept: 'People Operations (HR)', location: 'Bengaluru (On-site)', status: 'active', progress: 100, manager: 'Rajesh Nambiar', phone: '+91 98111 22334' },
  { id: 3, name: 'Vikram Malhotra', email: 'vikram.malhotra@eoms.in', role: 'Engineering Director', dept: 'Platform Engineering', location: 'Bengaluru (Hybrid)', status: 'active', progress: 100, manager: 'Rajesh Nambiar', phone: '+91 99000 44556' },
  { id: 4, name: 'Rohan Verma', email: 'rohan.verma@eoms.in', role: 'Lead IT Systems Engineer', dept: 'IT & Systems Engineering', location: 'Hyderabad (On-site)', status: 'active', progress: 100, manager: 'Rajesh Nambiar', phone: '+91 94444 55667' },
  { id: 5, name: 'Neha Nair', email: 'neha.nair@eoms.in', role: 'Corporate Legal & POSH Officer', dept: 'Legal, POSH & Compliance', location: 'Bengaluru (Hybrid)', status: 'active', progress: 100, manager: 'Rajesh Nambiar', phone: '+91 98777 88990' },
  { id: 6, name: 'Sneha Kulkarni', email: 'sneha.kulkarni@eoms.in', role: 'Senior Product Designer', dept: 'Product & UI/UX Design', location: 'Pune (Hybrid)', status: 'onboarding', progress: 45, manager: 'Vikram Malhotra', phone: '+91 97631 87654' },
  { id: 7, name: 'Arjun Rao', email: 'arjun.rao@eoms.in', role: 'Cloud Infrastructure Specialist', dept: 'Cloud & Infrastructure', location: 'Hyderabad (On-site)', status: 'onboarding', progress: 88, manager: 'Vikram Malhotra', phone: '+91 94401 54321' },
  { id: 8, name: 'Ananya Iyer', email: 'ananya.iyer@eoms.in', role: 'Lead Frontend Architect', dept: 'Platform Engineering', location: 'Bengaluru (Hybrid)', status: 'onboarding', progress: 60, manager: 'Vikram Malhotra', phone: '+91 98800 65432' },
  { id: 9, name: 'Kabir Mehta', email: 'kabir.mehta@eoms.in', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', location: 'Gurugram (Hybrid)', status: 'onboarding', progress: 35, manager: 'Vikram Malhotra', phone: '+91 98101 23456' },
  { id: 10, name: 'Aditya Sengupta', email: 'aditya.sengupta@eoms.in', role: 'Senior Software Engineer (SDE-II)', dept: 'Platform Engineering', location: 'Remote (Pan-India)', status: 'onboarding', progress: 15, manager: 'Vikram Malhotra', phone: '+91 98300 98765' },
];

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState(INITIAL_DIRECTORY);
  const [filter, setFilter] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Senior Software Engineer (SDE-II)',
    dept: 'Platform Engineering',
    location: 'Bengaluru (Hybrid)',
    manager: 'Vikram Malhotra',
    hireDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    api.get('/employees')
      .then(res => {
        if (res.data?.data?.length) {
          setEmployees(res.data.data.map(e => ({
            id: e.employeeId,
            name: `${e.firstName} ${e.lastName}`,
            email: e.workEmail || `${e.firstName.toLowerCase()}.${e.lastName.toLowerCase()}@eoms.in`,
            role: e.Position?.jobTitle || 'Team Member',
            dept: e.Position?.Department?.deptName || 'Platform Engineering',
            location: e.workLocation || 'Bengaluru (Hybrid)',
            status: e.status || 'onboarding',
            progress: e.OnboardingPlan?.progressPercent || (e.status === 'active' ? 100 : 35),
            manager: e.Manager ? `${e.Manager.firstName} ${e.Manager.lastName}` : 'Vikram Malhotra',
            phone: '+91 98450 ' + Math.floor(10000 + Math.random() * 90000),
          })));
        }
      })
      .catch(() => {
        // graceful local fallback
      });
  }, []);

  const handleAddSubmit = e => {
    e.preventDefault();
    if (!newEmployee.firstName.trim() || !newEmployee.lastName.trim()) return;

    const added = {
      id: Date.now(),
      name: `${newEmployee.firstName} ${newEmployee.lastName}`,
      email: newEmployee.email || `${newEmployee.firstName.toLowerCase()}.${newEmployee.lastName.toLowerCase()}@eoms.in`,
      role: newEmployee.role,
      dept: newEmployee.dept,
      location: newEmployee.location,
      status: 'onboarding',
      progress: 0,
      manager: newEmployee.manager,
      phone: '+91 98450 ' + Math.floor(10000 + Math.random() * 90000),
    };

    setEmployees([added, ...employees]);
    setIsAddModalOpen(false);
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Senior Software Engineer (SDE-II)',
      dept: 'Platform Engineering',
      location: 'Bengaluru (Hybrid)',
      manager: 'Vikram Malhotra',
      hireDate: new Date().toISOString().slice(0, 10),
    });
  };

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) ||
    e.dept.toLowerCase().includes(filter.toLowerCase()) ||
    e.role.toLowerCase().includes(filter.toLowerCase()) ||
    e.location.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }} className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display">Employee Directory &amp; Roster</h1>
          <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Pan-India organization personnel, active onboarding assignments, and team records.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          + Add New Employee
        </Button>
      </header>

      {/* ── Search & Filter ── */}
      <Card style={{ padding: 'var(--sp-4) var(--sp-5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 440 }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <Input
              placeholder="Search by name, Indian tech hub, job title, department…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>
            Showing <strong>{filtered.length}</strong> employees
          </span>
        </div>
      </Card>

      {/* ── Directory List ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--sp-4)' }}>
        {filtered.map(emp => (
          <Card key={emp.id} $hoverable style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar name={emp.name} size={46} />
                <div>
                  <h3 className="h3" style={{ fontSize: '1rem' }}>{emp.name}</h3>
                  <div className="caption" style={{ color: 'var(--primary)', fontWeight: 500 }}>{emp.role}</div>
                </div>
              </div>
              <Badge tone={emp.status === 'onboarding' ? 'info' : 'success'}>
                {emp.status}
              </Badge>
            </div>

            <div style={{ fontSize: '0.8125rem', display: 'grid', gap: 6, padding: '10px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                <span style={{ fontWeight: 600 }}>{emp.dept}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tech Hub:</span>
                <span style={{ fontWeight: 600 }}>{emp.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reporting Manager:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.manager}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
              <div className="meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Mail size={12} /> {emp.email}
              </div>
              <Button size="xs" variant="soft" icon={Eye} onClick={() => setSelectedEmp(emp)}>
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ── View Profile Drawer / Modal ── */}
      {selectedEmp && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEmp(null)}
          title={selectedEmp.name}
          description={`${selectedEmp.role} · ${selectedEmp.dept}`}
          footer={
            <Button onClick={() => setSelectedEmp(null)}>Close Profile</Button>
          }
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Avatar name={selectedEmp.name} size={56} />
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedEmp.name}</div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{selectedEmp.email}</div>
                <div className="caption" style={{ color: 'var(--primary)', marginTop: 2 }}>{selectedEmp.phone}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 10, padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Location Hub:</span>
                <span style={{ fontWeight: 600 }}>{selectedEmp.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Manager:</span>
                <span style={{ fontWeight: 600 }}>{selectedEmp.manager}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Onboarding Status:</span>
                <Badge tone={selectedEmp.status === 'onboarding' ? 'info' : 'success'}>{selectedEmp.status}</Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Progress:</span>
                <strong style={{ color: 'var(--primary)' }}>{selectedEmp.progress}%</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add Employee Modal ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
        description="Register a new personnel record into the EOMS Indian corporate database."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit}>Enroll Employee</Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label>First Name</Label>
              <Input
                required
                placeholder="e.g. Rahul"
                value={newEmployee.firstName}
                onChange={e => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                required
                placeholder="e.g. Verma"
                value={newEmployee.lastName}
                onChange={e => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Corporate Work Email</Label>
            <Input
              type="email"
              placeholder="e.g. rahul.verma@eoms.in"
              value={newEmployee.email}
              onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })}
            />
          </div>

          <div>
            <Label>Department</Label>
            <Select
              value={newEmployee.dept}
              onChange={e => setNewEmployee({ ...newEmployee, dept: e.target.value })}
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
              value={newEmployee.role}
              onChange={e => setNewEmployee({ ...newEmployee, role: e.target.value })}
            />
          </div>

          <div>
            <Label>Indian Tech Hub</Label>
            <Select
              value={newEmployee.location}
              onChange={e => setNewEmployee({ ...newEmployee, location: e.target.value })}
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
            <Label>Reporting Manager</Label>
            <Select
              value={newEmployee.manager}
              onChange={e => setNewEmployee({ ...newEmployee, manager: e.target.value })}
            >
              <option value="Vikram Malhotra">Vikram Malhotra (Engineering Director)</option>
              <option value="Priya Patel">Priya Patel (Head of People Operations)</option>
              <option value="Rajesh Nambiar">Rajesh Nambiar (CTO)</option>
            </Select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
