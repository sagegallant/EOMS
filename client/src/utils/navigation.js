export const NAV = {
  SYSTEM_ADMIN: [
    { section: 'Core', items: [
      { label: 'Dashboard',    to: '/dashboard',      icon: 'grid' },
      { label: 'Employees',   to: '/employees',      icon: 'users' },
      { label: 'Onboarding',  to: '/onboarding',     icon: 'route' },
      { label: 'Tasks',       to: '/tasks',           icon: 'check' },
      { label: 'Documents',   to: '/documents',       icon: 'file' },
      { label: 'Training',    to: '/training',        icon: 'cap' },
      { label: 'Assets',      to: '/assets',          icon: 'laptop' },
    ]},
    { section: 'System', items: [
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
      { label: 'Reports',     to: '/reports',         icon: 'chart' },
      { label: 'Audit',       to: '/audit',           icon: 'list' },
      { label: 'Settings',    to: '/settings',        icon: 'gear' },
      { label: 'Help',        to: '/help',            icon: 'help' },
    ]},
  ],
  HR_ADMIN: [
    { section: 'Core', items: [
      { label: 'Dashboard',   to: '/dashboard',       icon: 'grid' },
      { label: 'Employees',   to: '/employees',       icon: 'users' },
      { label: 'Onboarding',  to: '/onboarding',      icon: 'route' },
      { label: 'Tasks',       to: '/tasks',            icon: 'check' },
      { label: 'Documents',   to: '/documents',        icon: 'file' },
      { label: 'Training',    to: '/training',         icon: 'cap' },
      { label: 'Assets',      to: '/assets',           icon: 'laptop' },
    ]},
    { section: 'Insight', items: [
      { label: 'Notifications', to: '/notifications', icon: 'bell' },
      { label: 'Reports',     to: '/reports',          icon: 'chart' },
      { label: 'Audit',       to: '/audit',            icon: 'list' },
      { label: 'Settings',    to: '/settings',         icon: 'gear' },
      { label: 'Help',        to: '/help',             icon: 'help' },
    ]},
  ],
  DEPARTMENT_MANAGER: [
    { section: 'Team', items: [
      { label: 'Dashboard',   to: '/dashboard',        icon: 'grid' },
      { label: 'My Team',     to: '/employees',        icon: 'users' },
      { label: 'Tasks',       to: '/tasks',             icon: 'check' },
      { label: 'Documents',   to: '/documents',         icon: 'file' },
      { label: 'Training',    to: '/training',          icon: 'cap' },
    ]},
    { section: 'General', items: [
      { label: 'Notifications', to: '/notifications',  icon: 'bell' },
      { label: 'Reports',     to: '/reports',           icon: 'chart' },
      { label: 'Help',        to: '/help',              icon: 'help' },
    ]},
  ],
  IT_ADMIN: [
    { section: 'Ops', items: [
      { label: 'Dashboard',   to: '/dashboard',        icon: 'grid' },
      { label: 'Queue',       to: '/tasks',             icon: 'check' },
      { label: 'Assets',      to: '/assets',            icon: 'laptop' },
      { label: 'Employees',   to: '/employees',         icon: 'users' },
    ]},
    { section: 'General', items: [
      { label: 'Notifications', to: '/notifications',  icon: 'bell' },
      { label: 'Help',        to: '/help',              icon: 'help' },
    ]},
  ],
  EMPLOYEE: [
    { section: 'My Journey', items: [
      { label: 'Dashboard',   to: '/dashboard',        icon: 'grid' },
      { label: 'Tasks',       to: '/tasks',             icon: 'check' },
      { label: 'Documents',   to: '/documents',         icon: 'file' },
      { label: 'Training',    to: '/training',          icon: 'cap' },
      { label: 'Assets',      to: '/assets',            icon: 'laptop' },
    ]},
    { section: 'Account', items: [
      { label: 'Notifications', to: '/notifications',  icon: 'bell' },
      { label: 'Profile',     to: '/profile',           icon: 'user' },
      { label: 'Settings',    to: '/settings',          icon: 'gear' },
      { label: 'Help',        to: '/help',              icon: 'help' },
    ]},
  ],
};

export const navFor = (roles = []) => {
  if (!roles || !roles.length) return NAV.EMPLOYEE;
  return NAV[roles[0]] ?? NAV.EMPLOYEE;
};
