# 🏢 EOMS — Backend System Design Document

> **Employee Onboarding Management System** · Node.js 24 · Express 4 · MySQL 8.0 · Sequelize 6

---

## 1. Executive Summary

EOMS is a **monolithic REST API** built around a stateless, layered MVC architecture. It serves as the authoritative backend for a multi-role HR platform that automates the entire employee onboarding lifecycle — from pre-boarding document collection to Day-30 independent delivery — while enforcing Indian statutory compliance (PAN, Aadhaar, EPFO, POSH Act 2013).

---

## 2. High-Level Architecture — Three-Tier Model

```mermaid
graph TD
    subgraph "Tier 1 — Presentation (Client)"
        SPA["React 18 SPA (Vite 5)\nZustand Auth Store\nAxios HTTP Interceptor"]
    end

    subgraph "Tier 2 — Application (Server · Node.js 24 + Express 4)"
        GW["API Gateway\n/api/v1\nHELMET · CORS · Rate-Limit"]
        AUTH["Auth Middleware\nrequireAuth (JWT verify)"]
        RBAC["RBAC Middleware\nrequireRole / requirePermission"]
        CTL["10 Feature Controllers"]
        SVC["Services Layer\naudit.service · rbac.service"]
        ORM["Sequelize ORM\n28 Models · Parameterized Queries"]
    end

    subgraph "Tier 3 — Data (MySQL 8.0)"
        DB[("34 Normalized Tables\n+ SQL Views")]
    end

    SPA -->|"HTTP/HTTPS · Bearer JWT · JSON"| GW
    GW --> AUTH
    AUTH --> RBAC
    RBAC --> CTL
    CTL --> SVC
    CTL --> ORM
    SVC --> ORM
    ORM -->|"TCP Connection Pool"| DB
```

---

## 3. Architectural Patterns Used

### 3.1 MVC (Model-View-Controller)

| Layer | Location | Responsibility |
|---|---|---|
| **Model** | `server/src/models/` | 28 Sequelize entity models, all DB I/O |
| **View** | JSON REST responses | Serialized JavaScript objects returned by controllers |
| **Controller** | `server/src/controllers/` | Business logic, request/response handling |

> The "View" in a REST API is the JSON response. There are no server-rendered HTML views.

---

### 3.2 Layered (N-Tier) Architecture

The request pipeline flows through a strict sequence of layers. No layer is skipped.

```mermaid
flowchart LR
    A["HTTP Request"] --> B["Security Layer\nHelmet / CORS / Rate Limiter"]
    B --> C["Authentication Layer\nJWT Verification"]
    C --> D["Authorization Layer\nRBAC Guard"]
    D --> E["Controller Layer\nBusiness Logic"]
    E --> F["Service Layer\nCross-Cutting Concerns"]
    F --> G["ORM Layer\nParameterized Queries"]
    G --> H["Database Layer\nMySQL 8.0"]
    H --> I["JSON Response"]
```

---

### 3.3 Repository / ORM Pattern

- All database access is abstracted through **Sequelize models** — controllers never write raw SQL.
- **Parameterized queries** are used everywhere, preventing SQL injection.
- The `models/index.js` file is the single source of truth for all entity **associations**.

---

### 3.4 Service Layer Pattern

Two dedicated services handle **cross-cutting concerns**:

| Service | File | Responsibility |
|---|---|---|
| `audit.service` | `services/audit.service.js` | Writes immutable audit log entries to `audit_logs` for every state-altering action |
| `rbac.service` | `services/rbac.service.js` | Queries the `roles → user_roles` join to resolve a user's role array at login time |

> Controllers call `logAudit(...)` after every write operation (`CREATE_EMPLOYEE`, `LOGIN`, `MFA_FAILED`, etc.)

---

### 3.5 Middleware Chain Pattern

Express middleware is composed in order to create a **pipeline** that can short-circuit at any point:

```
Request → Helmet → CORS → JSON Parser → Rate Limiter → Router
       → requireAuth → requireRole/requirePermission → Controller → Error Handler
```

```mermaid
sequenceDiagram
    participant C as Client
    participant GW as Express Gateway
    participant AM as requireAuth
    participant RM as requireRole
    participant CTL as Controller
    participant SVC as AuditService
    participant DB as MySQL

    C->>GW: POST /api/v1/employees (Bearer JWT)
    GW->>AM: Verify JWT signature
    AM-->>GW: 401 if expired/missing
    AM->>RM: req.user attached
    RM-->>GW: 403 if role not in allowedRoles[]
    RM->>CTL: Authorized — proceed
    CTL->>DB: Employee.create(...)
    CTL->>SVC: logAudit("CREATE_EMPLOYEE")
    SVC->>DB: AuditLog.create(...)
    CTL-->>C: 201 { message, data }
```

---

### 3.6 Role-Based Access Control (RBAC) — Hierarchical + Permission-Based

EOMS implements a **dual-mode RBAC** system:

#### Mode A — Role Guard (`requireRole`)
Fast, in-memory check. Reads `req.user.roles[]` embedded in the JWT. No DB query required.

```
SYSTEM_ADMIN → superuser bypass (always passes)
HR_ADMIN     → can create employees, manage onboarding
IT_ADMIN     → can allocate assets
COMPLIANCE   → can verify documents
EMPLOYEE     → self-service only
```

#### Mode B — Permission Guard (`requirePermission`)
Fine-grained check. Queries `permissions → role_permissions → user_roles` for the user's `action_name` set.  
Result is **cached in-process** for 60 seconds via a `Map<userId, Set<action_name>>` to avoid repeated DB queries.

```mermaid
flowchart TD
    REQ["Incoming Request"] --> CHECK["Is req.user.roles includes SYSTEM_ADMIN?"]
    CHECK -->|Yes| PASS["next() — Superuser Bypass"]
    CHECK -->|No| CACHE["Check permCache Map"]
    CACHE -->|Hit| PERM["Has action_name in Set?"]
    CACHE -->|Miss| DB["Query DB: permissions JOIN role_permissions JOIN user_roles"]
    DB --> STORE["Store in Map, TTL 60s"]
    STORE --> PERM
    PERM -->|Yes| NEXT["next()"]
    PERM -->|No| DENY["403 FORBIDDEN"]
```

#### RBAC Hierarchy Table

| Role | Level | Key Permissions |
|---|:---:|---|
| `SYSTEM_ADMIN` | 1 | `*` All actions bypass |
| `HR_ADMIN` | 2 | `employee:*`, `onboarding:*`, `task:*`, `report:view` |
| `HR_SPECIALIST` | 3 | `employee:read`, `onboarding:*`, `task:*` |
| `COMPLIANCE_OFFICER` | 4 | `document:verify`, `document:read`, `audit:view` |
| `IT_ADMIN` | 5 | `asset:*`, `task:write`, `employee:read` |
| `DEPARTMENT_MANAGER` | 7 | `onboarding:read`, `task:write`, `employee:read` |
| `EMPLOYEE` | 9 | `task:write`, `document:upload`, `training:write` |
| `PAYROLL_ADMIN` | 10 | `document:read`, `employee:read` |

---

## 4. Authentication Flow — Stateless JWT + Optional MFA

```mermaid
sequenceDiagram
    participant C as Client
    participant API as Auth Controller
    participant DB as MySQL

    C->>API: POST /auth/login { identifier, password }
    API->>DB: SystemUser.findOne(username OR email)
    DB-->>API: user record
    API->>API: bcrypt.compare(password, passwordHash)
    
    alt Invalid credentials
        API->>DB: logAudit("LOGIN_FAILED")
        API-->>C: 401 BAD_CREDENTIALS (uniform, never reveals which field failed)
    else MFA enabled
        API-->>C: 200 { mfaRequired: true, challenge: JWT(5min, purpose:'mfa_challenge') }
        C->>API: POST /auth/mfa { challenge, code }
        API->>API: jwt.verify(challenge) → decode userId
        API-->>C: 401 if CHALLENGE_EXPIRED
        API->>DB: logAudit("MFA_FAILED") if code wrong
        API->>API: issueSession() on success
    else Login success
        API->>API: issueSession()
    end
    
    API->>DB: user.update({ lastLogin })
    API->>DB: logAudit("LOGIN")
    API->>API: getRolesForUser(userId)
    API-->>C: 200 { token: JWT(8h, {userId, username, roles[]}), user }
```

**Key design decisions:**
- **Uniform error message** — never reveals which field (username vs password) was wrong.
- **Stateless JWT** — no server-side sessions or token store; validation is pure cryptography.
- **8-hour TTL** — balances UX convenience with security.
- **MFA challenge token** — a short-lived (5-min) JWT avoids needing a session store for MFA state.
- Every login attempt (success or failure) is written to `audit_logs`.

---

## 5. Database Design — 7 Functional Domains (34 Tables)

```mermaid
erDiagram
    system_users ||--o{ user_roles : "has"
    roles ||--o{ user_roles : "assigned via"
    roles ||--o{ role_permissions : "grants"
    permissions ||--o{ role_permissions : "linked to"

    system_users ||--o| employees : "linked to"
    employees }o--|| positions : "holds"
    positions }o--|| departments : "belongs to"
    departments ||--o{ departments : "parent-child"
    employees ||--o{ emergency_contacts : "has"
    employees }o--o| employees : "manager"

    employees ||--o{ onboarding_plans : "has"
    onboarding_plans }o--|| onboarding_templates : "based on"
    onboarding_plans ||--o{ checklists : "contains"
    checklists ||--o{ tasks : "contains"
    tasks ||--o{ task_progress : "tracked via"
    task_progress }o--|| employees : "for"

    employees ||--o{ documents : "submits"
    documents }o--|| document_types : "typed as"
    documents ||--o{ document_verifications : "reviewed via"
    document_verifications }o--|| system_users : "reviewed by"

    employees ||--o{ asset_allocations : "receives"
    assets ||--o{ asset_allocations : "allocated via"
    assets }o--|| asset_models : "is"
    asset_models }o--|| asset_categories : "belongs to"

    employees ||--o{ training_records : "earns"
    training_records }o--|| training_courses : "for"
    training_courses ||--o{ training_modules : "has"

    system_users ||--o{ audit_logs : "generates"
    system_users ||--o{ notifications : "receives"
```

### Domain Breakdown

| # | Domain | Tables | Purpose |
|---|---|---|---|
| 1 | **IAM** | `system_users`, `roles`, `user_roles`, `permissions`, `role_permissions` | Authentication, authorization |
| 2 | **Org Hierarchy** | `departments`, `positions`, `employees`, `emergency_contacts` | Corporate structure |
| 3 | **Onboarding Engine** | `onboarding_templates`, `onboarding_plans`, `checklists`, `tasks`, `task_progress` | Phased onboarding lifecycle |
| 4 | **Compliance Docs** | `document_types`, `documents`, `document_verifications` | Statutory document audit |
| 5 | **IT Assets** | `asset_categories`, `asset_models`, `assets`, `asset_allocations` | Hardware provisioning |
| 6 | **LMS & Training** | `training_courses`, `training_modules`, `training_records` | Mandatory regulatory training |
| 7 | **Observability** | `audit_logs`, `notifications`, `system_settings` | Audit trail, alerting, config |

---

## 6. API Design — RESTful Resource Model

EOMS follows the **REST architectural style** with a versioned base path (`/api/v1`).

### Design Principles Applied
- **Nouns for resources**, verbs for HTTP methods (`/employees` not `/getEmployees`)
- **HTTP semantics**: `GET` (read), `POST` (create), `PATCH` (partial update)
- **Versioned API** (`/api/v1/...`) for forward compatibility
- **Consistent error envelopes**: `{ code: "VALIDATION_ERROR", message: "..." }`
- **Consistent success envelopes**: `{ data: [...] }` or `{ message: "...", data: {...} }`

### Endpoint Map

| Method | Path | Auth Required | Role Guard |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ Public | — |
| `GET` | `/auth/me` | ✅ JWT | Any |
| `GET` | `/employees` | ✅ JWT | Any |
| `POST` | `/employees` | ✅ JWT | `HR_ADMIN`, `HR_SPECIALIST` |
| `PATCH` | `/employees/:id` | ✅ JWT | `HR_ADMIN` |
| `GET` | `/onboarding` | ✅ JWT | Any |
| `GET` | `/tasks` | ✅ JWT | Any |
| `PATCH` | `/tasks/:id/progress` | ✅ JWT | Any |
| `GET` | `/documents` | ✅ JWT | Any |
| `POST` | `/documents/upload` | ✅ JWT | Any |
| `PATCH` | `/documents/:id/verify` | ✅ JWT | `COMPLIANCE_OFFICER`, `HR_ADMIN` |
| `GET` | `/assets` | ✅ JWT | Any |
| `POST` | `/assets/allocate` | ✅ JWT | `IT_ADMIN` |
| `PATCH` | `/assets/allocations/:id/acknowledge` | ✅ JWT | Any |
| `GET` | `/training/courses` | ✅ JWT | Any |
| `POST` | `/training/progress` | ✅ JWT | Any |
| `GET` | `/reports/summary` | ✅ JWT | HR, IT, Compliance, Managers |
| `GET` | `/audit` | ✅ JWT | `SYSTEM_ADMIN`, `COMPLIANCE_OFFICER` |
| `GET` | `/settings` | ✅ JWT | Any |
| `GET` | `/health` | ❌ Public | — |

---

## 7. Security Architecture — Defense in Depth

```mermaid
flowchart TD
    REQ["Incoming HTTP Request"] --> H["🛡️ Helmet\nX-Frame-Options, X-Content-Type-Options,\nContent-Security-Policy"]
    H --> CORS["🔒 CORS\nOrigin whitelist: CLIENT_URL only\ncredentials: true"]
    CORS --> RL["⏱️ Rate Limiter\n20 requests / 15 min on /auth/*\nPrevents brute-force attacks"]
    RL --> JP["📦 JSON Body Parser\nMax payload: 10 MB"]
    JP --> JWT["🔑 JWT Verification\nrequireAuth middleware\nHS256 signed, 8h TTL"]
    JWT --> RBAC2["👮 RBAC Guard\nrequireRole / requirePermission\n60s in-process permission cache"]
    RBAC2 --> BL["💼 Business Logic\nController + Sequelize ORM\nParameterized queries only"]
    BL --> AUDIT["📋 Audit Logger\nEvery write → audit_logs\nIP + User-Agent captured"]
    AUDIT --> DB2["🗄️ MySQL 8.0\nForeign keys enforced\nutf8mb4 encoding"]
```

### Security Controls Summary

| Control | Implementation | Threat Mitigated |
|---|---|---|
| **Helmet HTTP headers** | `helmet()` middleware | XSS, Clickjacking, MIME sniffing |
| **CORS whitelist** | `origin: process.env.CLIENT_URL` | Cross-origin API abuse |
| **Rate limiting** | 20 req / 15 min on `/auth/*` | Brute-force credential attacks |
| **Bcrypt hashing** | 10 salt rounds | Password breach exposure |
| **JWT stateless auth** | HS256, 8h expiry | Session hijacking |
| **Uniform auth errors** | Same message for wrong user vs wrong password | User enumeration attacks |
| **Parameterized queries** | Sequelize ORM throughout | SQL injection |
| **Audit immutability** | Every write calls `logAudit()` | Forensic traceability |
| **MFA challenge JWT** | 5-min short-lived token | MFA replay attacks |
| **SYSTEM_ADMIN bypass** | Superuser shortcircuit in all guards | Operational lockout prevention |

---

## 8. Onboarding Business Logic — Phased Workflow Engine

When HR creates a new employee, an **automated chain of operations** is triggered:

```mermaid
flowchart TD
    HR["HR Admin\nPOST /employees"] --> VAL["Validate required fields\n(name, email, position, hireDate)"]
    VAL --> DUP["Check duplicate email\n→ 409 CONFLICT if exists"]
    DUP --> USER["Create SystemUser\n(bcrypt password, auto-username)"]
    USER --> ROLE["Assign EMPLOYEE role\n(user_roles junction)"]
    ROLE --> EMP["Create Employee record\n(linked to SystemUser)"]
    EMP --> EC["Optional: Create EmergencyContact"]
    EC --> PLAN["Auto-create OnboardingPlan\n(status=in_progress, progress=0%\ntargetDate = hireDate + 30 days)"]
    PLAN --> AUDIT2["logAudit('CREATE_EMPLOYEE')"]
    AUDIT2 --> RESP["201 Response"]
```

### Task Progress Auto-Calculation
When an employee marks a task complete via `PATCH /tasks/:id/progress`, the controller:
1. Updates `task_progress.status = 'completed'`
2. Recalculates `onboarding_plans.progress_percent` = (completed tasks / total tasks) × 100
3. Auto-transitions plan `status` to `'completed'` when `progress_percent = 100`

### Phased Checklist Structure

```
OnboardingPlan
└── Checklist: "Pre-Boarding"      (tasks due before Day 1)
└── Checklist: "Day One"           (tasks due on first day)
└── Checklist: "Week One"          (tasks due in first week)
└── Checklist: "Month One"         (tasks due in first 30 days)
```

---

## 9. IT Asset Provisioning Flow

```mermaid
sequenceDiagram
    participant IT as IT Admin
    participant API2 as Asset Controller
    participant DB3 as MySQL
    participant EMP as Employee

    IT->>API2: POST /assets/allocate { assetId, employeeId }
    API2->>DB3: Asset.findByPk() — check available
    API2->>DB3: AssetAllocation.create()
    API2->>DB3: Asset.update({ status: 'allocated' })
    API2->>DB3: Notification.create({ userId: employee.userId })
    API2-->>IT: 201 Allocation created

    EMP->>API2: PATCH /assets/allocations/:id/acknowledge
    API2->>DB3: AssetAllocation.update({ acknowledgedAt: NOW() })
    API2->>DB3: logAudit("ASSET_ACKNOWLEDGED")
    API2-->>EMP: 200 Acknowledged
```

---

## 10. Statutory Compliance Document Flow

```mermaid
sequenceDiagram
    participant E as Employee
    participant C as Compliance Officer
    participant API3 as Document Controller
    participant DB4 as MySQL

    E->>API3: POST /documents/upload { typeId, file (base64/path) }
    API3->>DB4: Document.create({ status: 'pending' })
    API3->>DB4: logAudit("DOCUMENT_UPLOAD")
    API3-->>E: 201 Queued for review

    C->>API3: PATCH /documents/:id/verify { status: 'approved', notes }
    API3->>DB4: Document.update({ verificationStatus: 'approved' })
    API3->>DB4: DocumentVerification.create({ reviewerUserId, notes })
    API3->>DB4: logAudit("DOCUMENT_VERIFY")
    API3-->>C: 200 Document verified
```

**Supported document types:** PAN Card · Aadhaar Card · EPFO Form 11 · Educational Degree Certificate

---

## 11. Error Handling Architecture

A centralized **error handler middleware** (`middleware/error.js`) catches all unhandled errors:

```
Controller throws (or calls next(err))
    → error.js middleware intercepts
    → Serializes to { code, message }
    → 500 errors are automatically audited
    → No stack traces leak to client in production
```

All controller methods wrap their logic in `try/catch` → `next(e)` for graceful error propagation.

---

## 12. Testing Architecture — 3-Layer Strategy

| Layer | Command | Scope |
|---|---|---|
| **Unit Tests** | `npm run test:unit` | Bcrypt, JWT, RBAC guards, Sequelize models |
| **Integration Tests** | `npm run test:integration` | Live REST API endpoints, headers, role guards |
| **E2E Tests** | `npm run test:e2e` | Full 4-persona lifecycle simulation |

**Test runner:** Node.js native `node:test` + `node:assert/strict` (zero external dependencies).

### E2E Persona Flow
```
Phase 1: Multi-persona authentication (HR, IT, Employee, Compliance)
Phase 2: HR Admin creates employee + onboarding plan
Phase 3: IT Admin allocates hardware to new employee
Phase 4: Employee completes tasks + uploads PAN card
Phase 5: Compliance Officer audits and approves the statutory document
```
**Result: 24 tests · 5 suites · 0 failures**

---

## 13. Deployment Architecture — Docker Compose

```mermaid
graph LR
    subgraph "Docker Compose Stack"
        NG["NGINX Reverse Proxy\n:80 / :443"]
        CLIENT2["React SPA Container\n:5173"]
        SERVER2["Node.js API Container\n:5000"]
        MYSQL2["MySQL 8.0 Container\n:3306"]
    end

    INTERNET["Internet"] --> NG
    NG --> CLIENT2
    NG -->|"/api/*"| SERVER2
    SERVER2 --> MYSQL2
```

- **`deployment/`** contains `docker-compose.yml`, `deploy.sh` (Linux/macOS), `deploy.ps1` (Windows)
- Server reads config from `server/.env` (never committed — `.gitignore` protected)
- Automated deployment: `docker-compose up --build -d`

---

## 14. Component Dependency Map

```mermaid
graph TD
    app.js --> routes/index.js
    routes/index.js --> auth.routes.js
    routes/index.js --> employee.routes.js
    routes/index.js --> onboarding.routes.js
    routes/index.js --> task.routes.js
    routes/index.js --> document.routes.js
    routes/index.js --> asset.routes.js
    routes/index.js --> training.routes.js
    routes/index.js --> report.routes.js
    routes/index.js --> audit.routes.js
    routes/index.js --> notification.routes.js
    routes/index.js --> setting.routes.js

    auth.routes.js --> auth.controller.js
    employee.routes.js --> employee.controller.js
    document.routes.js --> document.controller.js
    asset.routes.js --> asset.controller.js

    auth.controller.js --> audit.service.js
    auth.controller.js --> rbac.service.js
    employee.controller.js --> audit.service.js
    document.controller.js --> audit.service.js
    asset.controller.js --> audit.service.js

    auth.controller.js --> models/index.js
    employee.controller.js --> models/index.js
    models/index.js --> config/db.js
    rbac.service.js --> config/db.js
    audit.service.js --> models/AuditLog.js
```

---

## 15. Key Design Decisions & Tradeoffs

| Decision | Choice Made | Rationale |
|---|---|---|
| **Architecture style** | Monolith (not microservices) | Team size, deployment simplicity, single domain |
| **Session strategy** | Stateless JWT | No Redis/session store needed; horizontally scalable |
| **ORM vs raw SQL** | Sequelize ORM | Type safety, parameterized queries, association graph |
| **RBAC caching** | In-process `Map` (60s TTL) | Avoids DB round-trip per request without Redis dependency |
| **Error uniformity** | Generic auth messages | Prevents user enumeration attacks |
| **Test runner** | `node:test` (native) | Zero external dependencies, ships with Node.js 24 |
| **Database** | MySQL 8.0 (relational) | Strong FK constraints needed for compliance audit trail |
| **Frontend state** | Zustand (not Redux) | Lightweight, no boilerplate for simple auth state |
