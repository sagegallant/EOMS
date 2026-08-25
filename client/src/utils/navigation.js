export const NAV = {
  SYSTEM_ADMIN: [
    { section: 'Overview',   items: [{ label: 'Dashboard', to: '/dashboard', icon: 'grid' }] },
    { section: 'Manage',     items: [
      { label: 'Employees',  to: '/employees', icon: 'users' },
      { label: 'Onboarding', to: '/onboarding', icon: 'route' },
      { label: 'Tasks & Checklists', to: '/tasks', icon: 'check' },
      { label: 'Documents',  to: '/documents', icon: 'file' },
      { label: 'Training',   to: '/training', icon: 'cap' },
      { label: 'Assets',     to: '/assets', icon: 'laptop' }] },
    { section: 'System',     items: [
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
      { label: 'Reports & Analytics', to: '/reports', icon: 'chart' },
      { label: 'Administration', to: '/admin/users', icon: 'shield' },
      { label: 'Audit Logs',  to: '/audit', icon: 'list' },
      { label: 'Settings',    to: '/settings', icon: 'gear' },
      { label: 'Help & Support', to: '/help', icon: 'help' }] },
  ],
  HR_ADMIN: [
    { section: 'Overview', items: [{ label: 'Dashboard', to: '/dashboard', icon: 'grid' }] },
    { section: 'Operate', items: [
      { label: 'Employees', to: '/employees', icon: 'users' },
      { label: 'Onboarding', to: '/onboarding', icon: 'route' },
      { label: 'Tasks & Checklists', to: '/tasks', icon: 'check' },
      { label: 'Documents', to: '/documents', icon: 'file' },
      { label: 'Training', to: '/training', icon: 'cap' },
      { label: 'Assets', to: '/assets', icon: 'laptop' }] },
    { section: 'Insight', items: [
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
      { label: 'Reports & Analytics', to: '/reports', icon: 'chart' },
      { label: 'Administration', to: '/admin/users', icon: 'shield' },
      { label: 'Audit Logs', to: '/audit', icon: 'list' },
      { label: 'Settings', to: '/settings', icon: 'gear' },
      { label: 'Help & Support', to: '/help', icon: 'help' }] },
  ],
  DEPARTMENT_MANAGER: [
    { section: 'Team', items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
      { label: 'My Team', to: '/employees', icon: 'users' },
      { label: 'Team Tasks', to: '/tasks', icon: 'check' },
      { label: 'Team Documents', to: '/documents', icon: 'file' },
      { label: 'Team Training', to: '/training', icon: 'cap' }] },
    { section: 'General', items: [
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
      { label: 'Reports', to: '/reports', icon: 'chart' },
      { label: 'Help & Support', to: '/help', icon: 'help' }] },
  ],
  IT_ADMIN: [
    { section: 'Operations', items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
      { label: 'Provisioning Queue', to: '/tasks', icon: 'check' },
      { label: 'Assets', to: '/assets', icon: 'laptop' },
      { label: 'Employees', to: '/employees', icon: 'users' }] },
    { section: 'General', items: [
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
      { label: 'Help & Support', to: '/help', icon: 'help' }] },
  ],
  EMPLOYEE: [
    { section: 'My Journey', items: [
      { label: 'Dashboard', to: '/dashboard', icon: 'grid' },
      { label: 'My Tasks', to: '/tasks', icon: 'check' },
      { label: 'My Documents', to: '/documents', icon: 'file' },
      { label: 'My Training', to: '/training', icon: 'cap' },
      { label: 'My Assets', to: '/assets', icon: 'laptop' }] },
    { section: 'Account', items: [
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
      { label: 'My Profile', to: '/profile', icon: 'user' },
      { label: 'Settings', to: '/settings', icon: 'gear' },
      { label: 'Help & Support', to: '/help', icon: 'help' }] },
  ],
};

export const navFor = (roles = []) => {
  if (!roles || !roles.length) return NAV.EMPLOYEE;
  return NAV[roles[0]] ?? NAV.EMPLOYEE;
};
