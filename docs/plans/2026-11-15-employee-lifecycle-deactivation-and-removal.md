# 🚀 Employee Lifecycle Management Implementation Plan

> **Phase 5 — Approval Gate 4** (Last gate before any code is written)  
> **Rule**: In accordance with the SDLC Orchestrator ([AGENTS.md](file:///C:/Users/ramch/.gemini/config/rules/AGENTS.md)), implementation in Phase 6 proceeds strictly task-by-task, stopping for human review after each task.  
> **Authority**: [PDS](file:///C:/Users/ramch/.gemini/antigravity/brain/68661333-a0f1-4180-ad2d-0dea95bf14ed/PDS_Employee_Lifecycle.md), [TSD](file:///C:/Users/ramch/.gemini/antigravity/brain/68661333-a0f1-4180-ad2d-0dea95bf14ed/TSD_Employee_Lifecycle.md), [BAS](file:///C:/Users/ramch/.gemini/antigravity/brain/68661333-a0f1-4180-ad2d-0dea95bf14ed/BAS_Employee_Lifecycle.md)

**Goal:** Enable System Administrators to deactivate (offboard & revoke login) or permanently delete employee records, while strictly preventing administrators from deactivating or deleting their own account, and provide directory filtering between Active, Inactive, and All employees.

**Architecture:** Express/Sequelize transactional mutations (`deactivateEmployee`, `reactivateEmployee`, `deleteEmployee`) guarded by `requireRole('SYSTEM_ADMIN')` and caller-identity validation, paired with React 18 directory enhancements (status filters, action buttons, admin self-protection tooltips, and confirmation modals).

**Tech Stack:** Node.js 24, Express 4.19, Sequelize 6.37, React 18.3, Vite 5.2, styled-components, Lucide React (`UserX`, `Trash2`, `RotateCcw`, `ShieldAlert`).

---

## Task Breakdown & Verification Plan

### Task 1: Backend Deactivation, Reactivation & Self-Protection Endpoints
**Files:**
- Modify: `server/src/controllers/employee.controller.js`
- Modify: `server/src/routes/employee.routes.js`
- Test: `server/tests/unit/employee-lifecycle.test.js`

**Steps:**
1. Create unit test `server/tests/unit/employee-lifecycle.test.js`:
   - Test that `deactivateEmployee` rejects self-deactivation with `403 FORBIDDEN`.
   - Test that non-admin role is rejected with `403 FORBIDDEN`.
   - Test that `deactivateEmployee` marks employee `status = 'terminated'`, sets `endDate`, and updates `SystemUser.is_active = false`.
   - Test that `reactivateEmployee` restores `status = 'active'` and `SystemUser.is_active = true`.
2. Run test using `node --test tests/unit/employee-lifecycle.test.js` to verify failure.
3. In `server/src/controllers/employee.controller.js`, implement `deactivateEmployee` and `reactivateEmployee`:
   - Check if caller is target employee: return `403 FORBIDDEN ("Cannot deactivate your own account")`.
   - Execute inside `sequelize.transaction`.
   - Update `status`, `endDate`, and `SystemUser.isActive`.
   - Log audit events `DEACTIVATE_EMPLOYEE` and `REACTIVATE_EMPLOYEE`.
4. In `server/src/routes/employee.routes.js`, register:
   - `PATCH /:id/deactivate`: `requireAuth, requireRole('SYSTEM_ADMIN'), deactivateEmployee`
   - `PATCH /:id/reactivate`: `requireAuth, requireRole('SYSTEM_ADMIN'), reactivateEmployee`
5. Run tests to verify all pass.
6. Present Task 1 git diff for user review.

---

### Task 2: Backend Permanent Employee Deletion Endpoint
**Files:**
- Modify: `server/src/controllers/employee.controller.js`
- Modify: `server/src/routes/employee.routes.js`
- Test: `server/tests/unit/employee-lifecycle.test.js`

**Steps:**
1. Add tests in `server/tests/unit/employee-lifecycle.test.js`:
   - Test that `deleteEmployee` rejects self-deletion with `403 FORBIDDEN`.
   - Test that `deleteEmployee` rejects non-admin callers with `403 FORBIDDEN`.
   - Test that `deleteEmployee` nullifies manager/buddy references pointing to this employee, destroys `Employee`, and destroys associated `SystemUser`.
2. Run test to verify failure.
3. In `server/src/controllers/employee.controller.js`, implement `deleteEmployee`:
   - Check self-protection guard: return `403 FORBIDDEN ("Cannot delete your own administrator account")`.
   - Transactionally nullify `managerId` and `buddyId` across `employees`.
   - Transactionally destroy `Employee` and `SystemUser`.
   - Log audit event `DELETE_EMPLOYEE`.
4. In `server/src/routes/employee.routes.js`, register:
   - `DELETE /:id`: `requireAuth, requireRole('SYSTEM_ADMIN'), deleteEmployee`
5. Run tests to verify all pass.
6. Present Task 2 git diff for user review.

---

### Task 3: Backend Status Filter Support & Client API Integration
**Files:**
- Modify: `server/src/controllers/employee.controller.js`
- Modify: `client/src/api/employees.js`

**Steps:**
1. In `listEmployees` (`server/src/controllers/employee.controller.js`):
   - Support `status=active`: `status != 'terminated'` and include `SystemUser.isActive = true`.
   - Support `status=inactive`: `status == 'terminated'` or `SystemUser.isActive = false`.
   - Include `isActive` attribute in `SystemUser` include block.
2. In `client/src/api/employees.js`:
   - Add `deactivate: (id) => api.patch(`/employees/${id}/deactivate`).then(r => r.data)`.
   - Add `reactivate: (id) => api.patch(`/employees/${id}/reactivate`).then(r => r.data)`.
   - Add `delete: (id) => api.delete(`/employees/${id}`).then(r => r.data)`.
3. Verify backend tests with `node --test tests/unit/*.test.js`.
4. Present Task 3 git diff for user review.

---

### Task 4: Frontend Employee Directory UI (Filters, Actions, Self-Guard & Modals)
**Files:**
- Modify: `client/src/features/employees/EmployeeDirectory.jsx`

**Steps:**
1. State management in `EmployeeDirectory.jsx`:
   - Add `filterStatus`: `'active' | 'inactive' | 'all'` (defaults to `'active'`).
   - Add modal states: `deactivateTarget`, `deleteTarget`, `actionLoading`, `actionError`.
2. Add Status Filter segmented control / select in the toolbar:
   - Options: `Active Employees`, `Inactive / Terminated`, `All Employees`.
3. Table Rendering:
   - Inactive employee rows: display subtle dimmed styling and `Inactive` status badge.
   - Add `Actions` header column (rendered strictly when `user?.roles?.includes('SYSTEM_ADMIN')`).
   - For each employee row:
     - Check if target is current admin (`emp.userId === user?.userId || emp.employeeId === user?.employeeId`).
     - If current admin: render action buttons disabled with tooltip: `"Current administrator account cannot be deactivated/removed"`.
     - If active employee: render `Deactivate` button (`UserX` icon) and `Delete` button (`Trash2` icon).
     - If inactive employee: render `Reactivate` button (`RotateCcw` icon) and `Delete` button (`Trash2` icon).
4. Implement Confirmation Modals:
   - `DeactivateConfirmationModal`: Warning modal explaining login revocation and status update to `terminated`.
   - `DeleteConfirmationModal`: Danger modal with explicit warning that permanent deletion cannot be undone.
5. Verification:
   - Run Vite production build: `node node_modules/vite/bin/vite.js build`.
   - Run full unit test suite: `node --test tests/unit/*.test.js`.
6. Present Task 4 git diff and outcomes for user review.
