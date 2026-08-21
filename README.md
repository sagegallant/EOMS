# EOMS — Employee Onboarding Management System

A production-grade Employee Onboarding Management System built with a **"Soft Minimal" Neumorphic** design system, full WCAG AA accessibility compliance, and an enterprise MySQL relational architecture with RBAC (10 roles).

---

## 1. Design System — "Soft Minimal"

- **Surface Canvas**: `#E9ECF4` soft matte surface. Cards and components "grow" out of the canvas via dual light/shadow recipes.
- **Three Depth Levels**:
  - Raised (`--neo-sm`, `--neo-md`, `--neo-lg`) for cards, buttons, avatars.
  - Inset (`--neo-in-sm`, `--neo-in-md`) for form inputs, search wells, progress tracks, and pressed button states.
  - Flat for headings and text.
- **Accessible Neumorphism**: Text colors meet WCAG AA contrast (headings ~11:1, body ~6:1). All status indicators pair color with icons and descriptive text (never color alone).
- **Signature Interaction**: Buttons depress inward (`:active` -> inset shadow) with smooth micro-transitions.

---

## 2. Directory Structure

```
EOMS/
├── client/                          # React 18 + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js            # Axios instance + JWT interceptor + 401 logout
│   │   ├── components/
│   │   │   ├── common/ui.jsx        # Card, Button, Input, Badge, Progress, Kpi, Avatar
│   │   │   └── layout/AppShell.jsx  # Responsive shell, role-aware sidebar, topbar
│   │   ├── features/
│   │   │   ├── auth/LoginPage.jsx   # Neumorphic login + MFA challenge + SVG identity
│   │   │   ├── dashboard/           # HR, Employee, Manager, IT dashboards
│   │   │   └── employees/           # Directory with live filter & status badges
│   │   ├── routes/                  # AppRoutes.jsx, RoleRoute.jsx
│   │   ├── store/authStore.js       # Zustand + localStorage persistence
│   │   ├── styles/                  # tokens.css, base.css
│   │   ├── utils/navigation.js      # 10-role navigation tree
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js               # Proxy /api -> :5000
│   └── package.json
├── server/                          # Node.js + Express + Sequelize Backend
│   ├── src/
│   │   ├── config/db.js             # Sequelize connection to MySQL
│   │   ├── models/                  # 34-table entity models + associations
│   │   ├── middleware/              # auth.js (JWT), rbac.js (cached), error.js
│   │   ├── controllers/             # auth.controller.js, employee.controller.js
│   │   ├── routes/                  # v1 API routers
│   │   ├── services/                # rbac.service.js, audit.service.js
│   │   ├── seeders/demoSeed.js      # 5 demo personas & organization seeds
│   │   └── app.js                   # Helmet, CORS, rate-limit, Sequelize bootstrap
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql                   # 34-table MySQL DDL with constraints & indexes
│   └── views.sql                    # 5 reporting views (including vw_document_status)
└── README.md
```

---

## 3. Quick Start

### Step 1: Database Setup
Import the DDL and reporting views into MySQL:

**In PowerShell (Windows default):**
```powershell
Get-Content database/schema.sql | mysql -u root -p
Get-Content database/views.sql | mysql -u root -p
```

**Or in Command Prompt (cmd) / Git Bash:**
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/views.sql
```

**Or from inside the MySQL prompt:**
```sql
mysql -u root -p
source database/schema.sql;
source database/views.sql;
```

### Step 2: Backend Setup
```bash
cd server
cp .env.example .env
npm install
npm run seed
npm run dev
# Server running at http://localhost:5000
```

### Step 3: Frontend Setup
```bash
cd client
npm install
npm run dev
# Client running at http://localhost:5173
```

---

## 4. Demo Personas

All seeded accounts use password: `Password@123`

| Username | Role | Dashboard View | Primary Responsibility |
|---|---|---|---|
| `admin` | `SYSTEM_ADMIN` | HR / Admin Overview | System configuration, security, audit logs |
| `sarah.williams` | `HR_ADMIN` | HR Administration | Onboarding cohorts, verification queue |
| `alex.johnson` | `EMPLOYEE` | Employee Journey | 30/60/90 checklist, documents, training |
| `michael.chen` | `DEPARTMENT_MANAGER` | Team Dashboard | 1:1 check-ins, milestone sign-offs |
| `david.miller` | `IT_ADMIN` | IT Operations | Hardware & license provisioning queue |
