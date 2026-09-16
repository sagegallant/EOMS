# Enterprise Architecture & System Design Document

This document provides an exhaustive architectural overview of the Enterprise Onboarding Management System (EOMS).

---

## 1. High-Level System Architecture

```mermaid
graph TD
    Client["Frontend SPA (React 18 + Vite 5 + Lucide SVG)"]
    API["Backend REST API Gateway (Express + Helmet + CORS + RateLimit)"]
    AuthMiddleware["JWT & RBAC Middleware (requireAuth, requireRole, requirePermission)"]
    ORM["Sequelize ORM Layer (34 Entity Models + Parameterized Queries)"]
    DB[("MySQL 8.0 Enterprise Database")]

    Client -->|HTTP / JSON (Bearer JWT)| API
    API --> AuthMiddleware
    AuthMiddleware --> ORM
    ORM -->|TCP Connection Pool| DB
```

---

## 2. Database Entity Architecture (34 Tables)

The EOMS database schema is organized into 7 modular functional domains:

### Domain 1: Identity & Access Management (IAM)
1. `system_users`: Stores user authentication credentials, bcrypt password hashes, and MFA secrets.
2. `roles`: Enterprise role definitions with hierarchy levels (1 = `SYSTEM_ADMIN` to 10 = `PAYROLL_ADMIN`).
3. `user_roles`: Many-to-many junction table assigning roles to system users.
4. `permissions`: Granular action rights (e.g. `document:verify`, `asset:allocate`).
5. `role_permissions`: Mapping connecting roles to authorized action rights.

### Domain 2: Organizational Hierarchy
6. `departments`: Functional corporate departments (Engineering, HR, Legal, IT, Finance).
7. `positions`: Job titles and career bands/grades (e.g. SDE-II `L3`, Director `M2`).
8. `employees`: Employee personnel records linked to positions, departments, managers, and system users.
9. `emergency_contacts`: Primary and secondary next-of-kin contacts for employees.

### Domain 3: Phased Onboarding Engine
10. `onboarding_templates`: Reusable company templates for cohorts and department archetypes.
11. `onboarding_plans`: Individual onboarding journey assigned to an employee with progress percentage and milestones.
12. `checklists`: Phased stages within a plan (`Pre-Boarding`, `Day One`, `Week One`, `Month One`).
13. `tasks`: Actionable tasks assigned to roles with time estimates and priorities.
14. `task_progress`: Employee task execution status (`not_started`, `in_progress`, `completed`, `blocked`), notes, and timestamps.

### Domain 4: Statutory Document Compliance
15. `document_types`: Regulatory document schemas (PAN Card, Aadhaar Card, EPFO Form 11, Degree Certificate).
16. `documents`: Uploaded statutory records, file sizes, MIME types, and storage paths.
17. `document_verifications`: Compliance officer audit log with status (`pending`, `approved`, `rejected`), comments, and reviewer ID.

### Domain 5: IT Asset Management & Provisioning
18. `asset_categories`: Hardware categories (Laptops, Displays, Peripherals, Security Keys).
19. `asset_models`: Hardware specifications (Apple MacBook Pro M3 Max, Dell UltraSharp 32" 4K).
20. `assets`: Individual serialized physical equipment with asset tags and warranty dates.
21. `asset_allocations`: Equipment checkout tracking, handover records, and employee acknowledgements.
22. `software_provisioning`: SaaS licenses and cloud identity assignments.

### Domain 6: Compliance LMS & Training
23. `training_courses`: Required courses (POSH Act 2013, InfoSec & GDPR, Code of Conduct).
24. `training_modules`: Modular lessons and chapters within a course.
25. `training_records`: Employee course enrollment, score, and completion status.
26. `training_quiz_attempts`: Formative and summative quiz grading logs.

### Domain 7: Enterprise Observability & Settings
27. `audit_logs`: Immutable audit trail recording actor, action, table, target ID, IP, user-agent, and JSON payload.
28. `notifications`: In-app and email employee alert messages with read status.
29. `feedback_surveys`: 30-day and 90-day onboarding pulse surveys.
30. `system_settings`: Key-value configuration parameters (company name, domain, compliance deadlines).

---

## 3. Role-Based Access Control (RBAC) Matrix

| Role | Hierarchy Level | Primary Responsibilities | Core Granted Permissions |
| :--- | :---: | :--- | :--- |
| **SYSTEM_ADMIN** | 1 | Platform superuser, system configuration, user provisioning | `*` (All permissions bypass) |
| **HR_ADMIN** | 2 | People ops leadership, cohort orchestration, employee creation | `employee:*`, `onboarding:*`, `task:*`, `report:view` |
| **HR_SPECIALIST** | 3 | Cohort management, checklist coordination, new hire buddying | `employee:read`, `onboarding:*`, `task:*` |
| **COMPLIANCE_OFFICER** | 4 | Statutory audit, PAN/Aadhaar/EPFO checks, POSH tracking | `document:verify`, `document:read`, `audit:view` |
| **IT_ADMIN** | 5 | Hardware provisioning, asset checkouts, software licenses | `asset:*`, `task:write`, `employee:read` |
| **DEPARTMENT_MANAGER** | 7 | Team onboarding oversight, 30-day goal alignment | `onboarding:read`, `task:write`, `employee:read` |
| **EMPLOYEE** | 9 | Self-service onboarding, task completion, doc uploads | `task:write`, `document:upload`, `training:write` |
| **PAYROLL_ADMIN** | 10 | TDS, PF, and statutory payroll verification | `document:read`, `employee:read` |

---

## 4. Security Architecture

1. **Defense in Depth**:
   - Helmet HTTP headers prevent Clickjacking, MIME sniffing, and cross-site scripting.
   - CORS origin validation restricts API access to registered frontend origins.
   - Rate limiting throttles brute-force attempts on `/api/v1/auth`.
2. **Stateless Session Management**:
   - Cryptographically signed JSON Web Tokens (HS256) encapsulate user identity and roles.
   - Tokens expire automatically after 8 hours; invalid or revoked tokens return HTTP 401.
3. **Audit Immutability**:
   - Every state-altering administrative action (employee creation, document approval, asset handover) logs an entry to `audit_logs` capturing client IP and browser user-agent.
