import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import AppShell from '../components/layout/AppShell';
import LoginPage from '../features/auth/LoginPage';
import HRDashboard from '../features/dashboard/hr/HRDashboard';
import EmployeeDashboard from '../features/dashboard/employee/EmployeeDashboard';
import ManagerDashboard from '../features/dashboard/manager/ManagerDashboard';
import ITDashboard from '../features/dashboard/it/ITDashboard';
import EmployeeDirectory from '../features/employees/EmployeeDirectory';
import { useAuthStore } from '../store/authStore';
import { Card, EmptyState, Button } from '../components/common/ui';

function PlaceholderView({ title, icon, description }) {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-5)' }}>
      <header>
        <h1 className="display" style={{ fontSize: '1.6rem' }}>{title}</h1>
        <p className="body" style={{ color: 'var(--text-3)' }}>{description}</p>
      </header>
      <Card>
        <EmptyState
          icon={icon}
          title={`${title} Module`}
          hint="This feature module is connected to the EOMS backend data pipeline."
          action={<Button size="md" variant="soft">Refresh Data</Button>}
        />
      </Card>
    </div>
  );
}

function DashboardRouter() {
  const { user } = useAuthStore();
  const role = user?.roles?.[0] || 'EMPLOYEE';
  if (role === 'HR_ADMIN' || role === 'SYSTEM_ADMIN') return <HRDashboard />;
  if (role === 'DEPARTMENT_MANAGER') return <ManagerDashboard />;
  if (role === 'IT_ADMIN') return <ITDashboard />;
  return <EmployeeDashboard />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RoleRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/employees" element={<EmployeeDirectory />} />
          <Route path="/onboarding" element={<PlaceholderView title="Onboarding Plans" icon="🗺️" description="Configure and monitor 30-60-90 day employee journey plans." />} />
          <Route path="/tasks" element={<PlaceholderView title="Tasks & Checklists" icon="✓" description="Kanban boards and phase checklist assignments." />} />
          <Route path="/documents" element={<PlaceholderView title="Document Repository" icon="▤" description="Employee compliance verification queue and uploaded documents." />} />
          <Route path="/training" element={<PlaceholderView title="Training & Compliance" icon="🎓" description="Interactive courses, quizzes, and completion records." />} />
          <Route path="/assets" element={<PlaceholderView title="Asset Provisioning" icon="💻" description="Hardware inventory, allocations, and handover acknowledgements." />} />
          <Route path="/notifications" element={<PlaceholderView title="Notifications" icon="🔔" description="System alerts, email dispatch logs, and pending reminders." />} />
          <Route path="/reports" element={<PlaceholderView title="Reports & Analytics" icon="📊" description="Cohort progress rates, SLA compliance, and document metrics." />} />
          <Route path="/admin/*" element={<PlaceholderView title="Administration" icon="🛡️" description="User management, role assignment, and RBAC matrix." />} />
          <Route path="/audit" element={<PlaceholderView title="Audit Logs" icon="☰" description="Immutable system audit trail for security and compliance." />} />
          <Route path="/settings" element={<PlaceholderView title="System Settings" icon="⚙" description="Platform configuration and notification policies." />} />
          <Route path="/profile" element={<PlaceholderView title="My Profile" icon="👤" description="Personal details, emergency contacts, and job profile." />} />
          <Route path="/help" element={<PlaceholderView title="Help & Support" icon="❓" description="EOMS onboarding documentation and support portal." />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
