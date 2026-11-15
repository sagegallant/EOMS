# 🚀 EOMS Implementation Plan: Employee Credential Security & Plan Roadmap Interactivity

> **Status: COMPLETED & FULLY VERIFIED (Phases 1–9)**  
> **Reference**: [AGENTS.md](file:///C:/Users/ramch/.gemini/config/rules/AGENTS.md) SDLC Phase-Gated Orchestrator  
> **Design Authority**: [MASTER.md](file:///c:/Users/ramch/Downloads/New%20folder/EOMS/design-system/eoms/MASTER.md)

**Goal:** Provide secure initial credential setting during employee registration, decouple auto-plan creation so unassigned new hires don't clutter active cohorts, enable conflict-free plan/priority task extension, provide Reporting Manager & Onboarding Buddy assignment with manager-only filtering, and make employee onboarding cards interactive with full roadmap transparency.

**Architecture:** Layered REST API updates in Express/Sequelize (bcrypt hashing, transaction-safe plan appending, dynamic progress derivation) paired with React 18 UI enhancements (2-column credential inputs, show/hide password toggle, clickable cohort cards, and a comprehensive Plan Roadmap Modal conforming to MASTER.md).

**Tech Stack:** React 18.3, Vite 5.2, styled-components, Framer Motion, Lucide React, Node.js 24, Express 4.19, Sequelize 6.37, bcryptjs, MySQL 8.0 Enterprise.

---

## Task Breakdown & Verification Record

### ✅ Task 1: Backend Employee Registration Credential & Decoupled Plan Logic
- **Files Modified**: `server/src/controllers/employee.controller.js`
- **Unit Test**: `server/tests/unit/employee-registration.test.js`
- **Verification**: `node --test tests/unit/employee-registration.test.js` passed (2/2 tests passed).
- **Outcomes**:
  - Rejects missing or $< 8$ character passwords with `400 VALIDATION_ERROR`.
  - Hashes passwords with `bcrypt.hash(password, 10)` before storage in `system_users`.
  - Eradicated default fallback password `'Password@123'`.
  - Removed auto-creation of generic onboarding plan during employee registration.

---

### ✅ Task 2: Backend Onboarding Plan Conflict-Free Assignment & Priority Extension
- **Files Modified**: `server/src/routes/onboarding.routes.js`, `server/src/controllers/onboarding.controller.js`
- **Unit Test**: `server/tests/unit/onboarding-assignment.test.js`
- **Verification**: `node --test tests/unit/onboarding-assignment.test.js` passed (2/2 tests passed).
- **Outcomes**:
  - Allowed `DEPARTMENT_MANAGER` and `MANAGER` roles on `POST /api/onboarding`.
  - Replaced 409 Conflict with transaction-safe roadmap extension (appends curriculum tasks, initializes `TaskProgress`, dynamically recalculates `progressPercent`).

---

### ✅ Task 3: Backend Priority Task Creation & Auto-Recalculation
- **Files Modified**: `server/src/routes/task.routes.js`, `server/src/controllers/task.controller.js`
- **Unit Test**: `server/tests/unit/task-priority.test.js`
- **Verification**: `node --test tests/unit/task-priority.test.js` passed (2/2 tests passed).
- **Outcomes**:
  - Validates and stores priority (`critical`, `high`, `medium`, `low`).
  - Auto-provisions `TaskProgress` for the target employee and dynamically updates `OnboardingPlan.progressPercent`.

---

### ✅ Task 4: Frontend Employee Registration Modal Credential Column
- **Files Modified**: `client/src/features/employees/EmployeeDirectory.jsx`
- **Verification**: Vite production build succeeded (`✓ built in 16.63s`).
- **Outcomes**:
  - Added 2-column grid grouping Work Email and Initial Password side-by-side.
  - Interactive eye toggle (`Eye`/`EyeOff`) with validation subtext and $\ge 8$ character requirements.

---

### ✅ Task 5: Frontend Onboarding Cohorts Grid & Filter Logic
- **Files Modified**: `client/src/features/onboarding/OnboardingView.jsx`
- **Verification**: Vite production build succeeded (`✓ built in 21.89s`).
- **Outcomes**:
  - Filtered main cohort cards grid to strictly render employees with active onboarding plans.
  - Expanded `canAssign` to include `MANAGER` and `DEPARTMENT_MANAGER`.
  - Enriched Assign Plan modal: flags employees awaiting plans (`⚡ [Awaiting Plan]`), displays extension banner if plan exists, and includes priority selector.

---

### ✅ Ad-Hoc Task: Reporting Manager & Onboarding Buddy Assignment (with Manager-Only Filter)
- **Files Modified**: `database/schema.sql`, `server/src/models/Employee.js`, `server/src/controllers/employee.controller.js`, `server/src/controllers/onboarding.controller.js`, `client/src/features/employees/EmployeeDirectory.jsx`
- **Verification**: Vite production build succeeded (`✓ built in 21.00s`), 18/18 backend tests passed.
- **Outcomes**:
  - Added `buddy_id` column and foreign key to `employees` table in database schema and Sequelize model.
  - Eagerly loaded `Manager` and `Buddy` associations across employee and onboarding plan queries.
  - Added Reporting Manager and Onboarding Buddy selectors to employee creation and edit forms.
  - **Filtered Reporting Manager selector to show strictly managers** (`DEPARTMENT_MANAGER`, `MANAGER`, `SYSTEM_ADMIN`, `HR_ADMIN`, leadership titles, or M-grade roles). Buddy selector lists peer employees.
  - Rendered Manager and Buddy badges on Employee Directory rows and Onboarding Cohort cards.

---

### ✅ Task 6: Frontend Interactive Employee Card & Plan Roadmap Modal
- **Files Modified**: `client/src/features/onboarding/OnboardingView.jsx`, `client/src/styles/tokens.css`
- **Verification**: Vite production build succeeded (`✓ built in 16.25s`), 18/18 backend tests passed.
- **Outcomes**:
  - Interactive cards with `role="button"`, `tabIndex={0}`, keyboard navigation, and cursor pointer.
  - Curriculum title pill with `BookOpen` icon.
  - Derived highest pending priority badge (`Critical` 🔴, `High` 🟡, `Medium` 🔵, `Low` ⚪).
  - Implemented `PlanRoadmapModal`:
    - Employee header with profile, manager, buddy, dates, and live radial progress gauge.
    - Phased checklists breakdown by milestone phase.
    - Task rows with completion toggle via `taskApi.updateProgress` (auto-recalculating plan progress).
    - Inline priority task creation form for managers and admins to add urgent tasks to any phase.

---

## Quality Gates & Verification Verdicts

- **Phase 7 Code Review**:
  - Synthesis Implementation Integrity: All 7 passes passed (Chain Completeness, Placeholder Detection, Test Honesty, Environment Parity, Attention Audit, Companion Completeness, Boundary Verification).
  - Synthesis Preflight Gate: Clean tree, passing tests, zero hardcoded secrets. Verdict: **GO**.
- **Phase 8 Testing & QA**:
  - WCAG AA Contrast Audit: Normal text contrast computed with relative luminance formula strictly exceeds $4.5:1$ across all priorities (Critical $5.91:1$, High $4.84:1$, Medium $4.75:1$, Low $6.87:1$).
  - Layout Reflow Audit: Responsive auto-fill grid reflows without two-state collapse across desktop, tablet, and mobile.
  - Automated Tests: 18/18 passing, 0 skipped, 0 failed.
