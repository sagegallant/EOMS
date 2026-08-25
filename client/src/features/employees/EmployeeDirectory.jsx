import { useState, useEffect } from 'react';
import { Card, Button, Badge, Avatar, Input } from '../../components/common/ui';
import { api } from '../../api/client';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Alex Johnson', email: 'alex.johnson@eoms.io', role: 'Software Engineer', dept: 'Engineering', location: 'Hybrid', status: 'onboarding' },
    { id: 2, name: 'Michael Chen', email: 'michael.chen@eoms.io', role: 'Department Manager', dept: 'Engineering', location: 'On-site', status: 'active' },
    { id: 3, name: 'Sarah Williams', email: 'sarah.williams@eoms.io', role: 'HR Specialist', dept: 'Human Resources', location: 'Hybrid', status: 'active' },
    { id: 4, name: 'David Miller', email: 'david.miller@eoms.io', role: 'IT Support Engineer', dept: 'Information Technology', location: 'On-site', status: 'active' },
  ]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/employees')
      .then(res => {
        if (res.data?.data?.length) {
          setEmployees(res.data.data.map(e => ({
            id: e.employeeId,
            name: `${e.firstName} ${e.lastName}`,
            email: e.workEmail || 'Pending setup',
            role: e.Position?.jobTitle || 'Team Member',
            dept: e.Position?.Department?.deptName || 'General',
            location: e.workLocation || 'Hybrid',
            status: e.status || 'onboarding',
          })));
        }
      })
      .catch(() => {
        // Fallback to local demo list if backend is not yet active
      });
  }, []);

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(filter.toLowerCase()) ||
    e.dept.toLowerCase().includes(filter.toLowerCase()) ||
    e.role.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
        <div>
          <h1 className="display" style={{ fontSize: '1.6rem' }}>Employee Directory</h1>
          <p className="body" style={{ color: 'var(--text-3)' }}>
            Organization personnel, assignments, and onboarding records.
          </p>
        </div>
        <Button size="md">+ Add Employee</Button>
      </header>

      <div style={{ maxWidth: 400 }}>
        <Input
          placeholder="Filter by name, department, or job title…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      <Card>
        <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
          {filtered.map(emp => (
            <div
              key={emp.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-4)',
                padding: 'var(--sp-3) var(--sp-4)',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-white)',
                boxShadow: 'var(--neo-sm)',
                flexWrap: 'wrap',
              }}
            >
              <Avatar name={emp.name} size={44} />
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{emp.name}</div>
                <div className="meta">{emp.email}</div>
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <div className="caption" style={{ fontWeight: 600 }}>{emp.role}</div>
                <div className="meta">{emp.dept} · {emp.location}</div>
              </div>
              <Badge tone={emp.status === 'onboarding' ? 'info' : 'success'}>
                {emp.status}
              </Badge>
              <Button size="sm" variant="soft">View Profile</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
