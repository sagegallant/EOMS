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

import { MetricPillBar, DarkTaskCard, CollapsibleRow, PageHeader } from '../components/common/ui';

const SUPPORT_CHANNELS = [
  { title: 'POSH ICC Grievance Portal', date: 'Available 24/7', done: true },
  { title: 'IT Systems Rapid Response', date: 'SLA: < 2 Hours', done: true },
  { title: 'Payroll & PF Transfer Helpdesk', date: 'Mon–Fri 9am–6pm', done: false },
  { title: 'Emergency Pan-India Hotline', date: '1800-EOMS-CARE', done: false },
];

function HelpView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
      <PageHeader
        title="Help & Support Desk"
        subtitle="Assistance with Indian corporate onboarding, IT hardware provisioning, and statutory compliance."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--sp-4)', padding: 'var(--sp-4) var(--sp-5)', background: 'var(--bg-surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-green)' }}>
        <MetricPillBar label="IT Helpdesk SLA"    value={98} delay={0.0} />
        <MetricPillBar label="HR Ticket Resolution" value={95} delay={0.1} />
        <MetricPillBar label="POSH ICC Available"   value={100} delay={0.2} />
        <MetricPillBar label="Active Tickets"      value={4} delay={0.3} color="amber" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 'var(--sp-4)', alignItems: 'stretch' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-4)' }}>
          <Card style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 'var(--sp-4)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
              <Mail size={18} />
            </div>
            <h3 className="h3">People Operations Desk</h3>
            <p className="caption" style={{ color: 'var(--text-muted)' }}>Questions regarding offer letter, PF / UAN transfer, or medical insurance floater.</p>
            <a href="mailto:peopleops@eoms.in" style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--primary)', marginTop: 'auto' }}>peopleops@eoms.in →</a>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 'var(--sp-4)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--amber-bg)', color: 'var(--amber)', display: 'grid', placeItems: 'center' }}>
              <HelpCircle size={18} />
            </div>
            <h3 className="h3">POSH Internal Committee</h3>
            <p className="caption" style={{ color: 'var(--text-muted)' }}>Confidential grievance redressal under the POSH Act 2013 statutory mandate.</p>
            <a href="mailto:icc.complaints@eoms.in" style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--amber)', marginTop: 'auto' }}>icc.complaints@eoms.in →</a>
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 'var(--sp-4)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--info-bg)', color: 'var(--info)', display: 'grid', placeItems: 'center' }}>
              <Phone size={18} />
            </div>
            <h3 className="h3">IT &amp; Systems Helpdesk</h3>
            <p className="caption" style={{ color: 'var(--text-muted)' }}>Hardware setup, VPN configuration, and Google Workspace / Okta MFA recovery.</p>
            <a href="mailto:it-support@eoms.in" style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--info)', marginTop: 'auto' }}>it-support@eoms.in →</a>
          </Card>
        </div>
        <DarkTaskCard title="Support Desk Telemetry" tasks={SUPPORT_CHANNELS} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        <CollapsibleRow title="Emergency Contacts & Regional Support Centers" icon={Phone}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-3)' }}>
            {[
              { center: 'Bengaluru Bellandur Desk', contact: '+91 80 4912 8000', ext: 'Ext 101' },
              { center: 'Hyderabad HITEC Desk', contact: '+91 40 6823 4000', ext: 'Ext 204' },
              { center: 'Pune Hinjawadi Desk', contact: '+91 20 6718 9000', ext: 'Ext 305' },
              { center: 'Gurugram CyberHub Desk', contact: '+91 124 456 7000', ext: 'Ext 402' },
            ].map((c, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{c.center}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>{c.contact}</div>
                <div className="caption" style={{ color: 'var(--text-muted)' }}>{c.ext}</div>
              </div>
            ))}
          </div>
        </CollapsibleRow>
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
