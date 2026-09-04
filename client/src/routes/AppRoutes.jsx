import { Routes, Route, Navigate } from 'react-router-dom';
import RoleRoute from './RoleRoute';
import AppShell from '../components/layout/AppShell';
import LoginPage from '../features/auth/LoginPage';
import HRDashboard from '../features/dashboard/hr/HRDashboard';
import EmployeeDashboard from '../features/dashboard/employee/EmployeeDashboard';
import ManagerDashboard from '../features/dashboard/manager/ManagerDashboard';
import ITDashboard from '../features/dashboard/it/ITDashboard';
import EmployeeDirectory from '../features/employees/EmployeeDirectory';
import OnboardingView from '../features/onboarding/OnboardingView';
import TasksView from '../features/tasks/TasksView';
import DocumentsView from '../features/documents/DocumentsView';
import TrainingView from '../features/training/TrainingView';
import AssetsView from '../features/assets/AssetsView';
import NotificationsView from '../features/notifications/NotificationsView';
import ReportsView from '../features/reports/ReportsView';
import AuditView from '../features/audit/AuditView';
import SettingsView from '../features/settings/SettingsView';
import ProfileView from '../features/profile/ProfileView';
import { useAuthStore } from '../store/authStore';
import { Card, Button } from '../components/common/ui';
import { HelpCircle, Mail, Phone, ExternalLink } from 'lucide-react';

function HelpView() {
  return (
    <div style={{ display: 'grid', gap: 'var(--sp-6)', maxWidth: 840 }} className="animate-fade-in">
      <header>
        <h1 className="display">EOMS Help &amp; Support Portal</h1>
        <p className="body" style={{ color: 'var(--text-muted)', marginTop: 4 }}>
          Assistance with Indian corporate onboarding, IT hardware provisioning, and statutory compliance.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--sp-4)' }}>
        <Card style={{ display: 'grid', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Mail size={18} />
          </div>
          <h3 className="h3">People Operations Desk</h3>
          <p className="caption" style={{ color: 'var(--text-muted)' }}>Questions regarding offer letter, PF / UAN transfer, or medical insurance.</p>
          <a href="mailto:peopleops@eoms.in" style={{ fontWeight: 600, fontSize: '0.84rem' }}>peopleops@eoms.in →</a>
        </Card>

        <Card style={{ display: 'grid', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--warning-bg)', color: 'var(--warning)', display: 'grid', placeItems: 'center' }}>
            <HelpCircle size={18} />
          </div>
          <h3 className="h3">POSH Internal Committee</h3>
          <p className="caption" style={{ color: 'var(--text-muted)' }}>Confidential grievance redressal under the POSH Act 2013 guidelines.</p>
          <a href="mailto:icc.complaints@eoms.in" style={{ fontWeight: 600, fontSize: '0.84rem' }}>icc.complaints@eoms.in →</a>
        </Card>

        <Card style={{ display: 'grid', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--info-bg)', color: 'var(--info)', display: 'grid', placeItems: 'center' }}>
            <Phone size={18} />
          </div>
          <h3 className="h3">IT &amp; Systems Helpdesk</h3>
          <p className="caption" style={{ color: 'var(--text-muted)' }}>Hardware setup, VPN configuration, and Google Workspace 2FA assistance.</p>
          <a href="mailto:it-support@eoms.in" style={{ fontWeight: 600, fontSize: '0.84rem' }}>it-support@eoms.in →</a>
        </Card>
      </div>
    </div>
  );
}

function DashboardRouter() {
  const { user } = useAuthStore();
  const role = user?.roles?.[0] || 'EMPLOYEE';
  if (role === 'HR_ADMIN' || role === 'SYSTEM_ADMIN' || role === 'HR_SPECIALIST') return <HRDashboard />;
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
          <Route path="/onboarding" element={<OnboardingView />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/documents" element={<DocumentsView />} />
          <Route path="/training" element={<TrainingView />} />
          <Route path="/assets" element={<AssetsView />} />
          <Route path="/notifications" element={<NotificationsView />} />
          <Route path="/reports" element={<ReportsView />} />
          <Route path="/admin/*" element={<AuditView />} />
          <Route path="/audit" element={<AuditView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/profile" element={<ProfileView />} />
          <Route path="/help" element={<HelpView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
