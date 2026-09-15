# Release Notes & Changelog

All notable changes to the Enterprise Onboarding Management System (EOMS) are documented in this file in reverse chronological order.

---

## [v1.0.0] - 2026-09-16 (General Availability Release)

### Executive Summary
The official production-ready GA release of EOMS. Brings together the entire full-stack platform: a 34-table MySQL enterprise database, authentic Indian corporate workforce datasets, high-contrast modern SaaS design system, comprehensive REST API layer, 24 automated multi-phase tests, and containerized deployment tooling.

### Highlights & Added Features
- **Open Source Community Architecture**:
  - Official MIT License.
  - Comprehensive `README.md` with system architecture diagrams and persona credentials.
  - Contributor Covenant `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, and `SECURITY.md`.
  - GitHub Pull Request and Issue templates (`.github/`).
- **Containerized Orchestration**:
  - Added `deployment/docker-compose.yml` for unified multi-container setup (MySQL 8, Node.js API, Vite/Nginx frontend).
  - Production deployment scripts for Bash (`deploy.sh`) and PowerShell (`deploy.ps1`).
- **Comprehensive Documentation**:
  - `docs/ARCHITECTURE.md` detailing all 34 database entities, ER relations, and RBAC matrix.

---

## [v0.8.0-rc1] - 2026-09-13 (Automated Multi-Phase Testing Milestone)

### Highlights & Added Features
- **Multi-Phase Automated Testing Framework**:
  - 100% native Node 24 test runner integration (`node:test`, `node:assert/strict`).
  - **Unit Test Suite** (`tests/unit/`): Validates bcrypt password hashing work factors, JWT token lifecycles, MFA challenge-response tokens, RBAC middleware permission bypasses, and Sequelize model schema constraints.
  - **Live API Integration Test Suite** (`tests/integration/`): Tests live HTTP server endpoints including `/health`, bad credential rejections, Indian HR Admin authentication, employee directory listings, onboarding cohort templates, and reporting aggregates.
  - **4-Persona E2E Lifecycle Simulation** (`tests/e2e/`): Simulates a complete corporate onboarding journey across HR Admin (`priya.patel`), IT Admin (`rohan.verma`), New Hire (`aarav.sharma`), and Compliance Officer (`neha.nair`).
  - Added automated test npm scripts: `test`, `test:unit`, `test:integration`, `test:e2e`.

---

## [v0.5.0-beta] - 2026-09-05 (Frontend & Database Complete Milestone)

### Highlights & Added Features
- **Modern SaaS Design System**:
  - Completely replaced outdated soft lavender neumorphism with crisp Slate (`#F8FAFC`) and Electric Sapphire (`#4F46E5`) theme.
  - Replaced all raw unicode emojis with crisp Lucide React SVG icons.
  - Modern typography powered by Google Fonts Inter.
- **Interactive Role-Based Frontend Views**:
  - Interactive Onboarding Cohorts view (`/onboarding`) with progress tracking and phase cards.
  - Dynamic Task Checklist view (`/tasks`) with category filters and completion toggles.
  - Statutory Document Compliance view (`/documents`) with upload modals and verification reviewer notes.
  - LMS Training & Quiz view (`/training`) with module progress bars and score badges.
  - IT Asset Provisioning view (`/assets`) with inventory counters and handover acknowledgement drawers.
  - In-app Notification center (`/notifications`) with read confirmations.
  - Executive Reports & Analytics view (`/reports`) with department breakdown charts.
  - Security Audit Trail inspection view (`/audit`) with searchable logs.
  - Enterprise System Settings view (`/settings`).
  - Interactive Action Drawers and Modals (New Employee registration, Asset Allocation queue).
- Clean production Vite 5 build validation.

---

## [v0.3.0-alpha] - 2026-09-01 (Indian Corporate Seeding Milestone)

### Highlights & Added Features
- **Authentic Indian Enterprise Dataset**:
  - Seeded 19 corporate personas with realistic roles across Bengaluru, Hyderabad, Pune, and Gurugram tech hubs.
  - Seeded statutory documents: Aadhaar Card, Permanent Account Number (PAN) Card, EPFO Form 11, Degree Certificates.
  - Seeded statutory compliance courses: Prevention of Sexual Harassment (POSH) Act 2013 and Information Security / GDPR.
  - Seeded enterprise hardware: Apple MacBook Pro M3 Max, Dell UltraSharp 4K Monitors, YubiKey 5C NFC Security Keys.
  - Fully idempotent database seeding via `npm run seed` with foreign key disable safeguards.

---

## [v0.1.0-alpha] - 2026-08-29 (Database Architecture Milestone)

### Highlights & Added Features
- **34-Entity Database Architecture**:
  - Created missing Sequelize models: `Asset`, `AssetCategory`, `AssetModel`, `DocumentType`, `EmergencyContact`, `Notification`, `OnboardingTemplate`, `SystemSetting`, `TrainingCourse`, `TrainingModule`.
  - Configured all 34 entity associations in `server/src/models/index.js`.
  - Fixed timestamp mappings (`createdAt: 'uploaded_at'` for Document, `timestamps: false` for junction tables).
  - Updated `database/schema.sql` and `database/views.sql` with compliance overview SQL views.
