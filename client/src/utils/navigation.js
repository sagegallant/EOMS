/**
 * navigation.js — Flat tab structure for horizontal TopNav
 * Each role gets a flat array of tabs (no sections needed for top nav)
 */

export const TABS = {
  SYSTEM_ADMIN: [
    { label: 'Dashboard',     to: '/dashboard' },
    { label: 'Employees',     to: '/employees' },
    { label: 'Onboarding',    to: '/onboarding' },
    { label: 'Tasks',         to: '/tasks' },
    { label: 'Documents',     to: '/documents' },
    { label: 'Training',      to: '/training' },
    { label: 'Assets',        to: '/assets' },
    { label: 'Reports',       to: '/reports' },
    { label: 'Audit',         to: '/audit' },
    { label: 'Settings',      to: '/settings' },
  ],
  HR_ADMIN: [
    { label: 'Dashboard',     to: '/dashboard' },
    { label: 'Employees',     to: '/employees' },
    { label: 'Onboarding',    to: '/onboarding' },
    { label: 'Tasks',         to: '/tasks' },
    { label: 'Documents',     to: '/documents' },
    { label: 'Training',      to: '/training' },
    { label: 'Assets',        to: '/assets' },
    { label: 'Reports',       to: '/reports' },
    { label: 'Settings',      to: '/settings' },
  ],
  DEPARTMENT_MANAGER: [
    { label: 'Dashboard',     to: '/dashboard' },
    { label: 'My Team',       to: '/employees' },
    { label: 'Tasks',         to: '/tasks' },
    { label: 'Documents',     to: '/documents' },
    { label: 'Training',      to: '/training' },
    { label: 'Reports',       to: '/reports' },
  ],
  IT_ADMIN: [
    { label: 'Dashboard',     to: '/dashboard' },
    { label: 'Assets',        to: '/assets' },
    { label: 'Employees',     to: '/employees' },
    { label: 'Tasks',         to: '/tasks' },
  ],
  EMPLOYEE: [
    { label: 'Dashboard',     to: '/dashboard' },
    { label: 'Tasks',         to: '/tasks' },
    { label: 'Documents',     to: '/documents' },
    { label: 'Training',      to: '/training' },
    { label: 'Assets',        to: '/assets' },
    { label: 'Profile',       to: '/profile' },
  ],
  COMPLIANCE_OFFICER: [
    { label: 'Dashboard',     to: '/dashboard' },
    { label: 'Documents',     to: '/documents' },
    { label: 'Training',      to: '/training' },
    { label: 'Audit',         to: '/audit' },
    { label: 'Reports',       to: '/reports' },
  ],
};

export const tabsFor = (roles = []) => {
  if (!roles || !roles.length) return TABS.EMPLOYEE;
  return TABS[roles[0]] ?? TABS.EMPLOYEE;
};

// Keep backward compat alias
export const NAV = TABS;
export const navFor = tabsFor;
