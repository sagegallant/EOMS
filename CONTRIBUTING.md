# Contributing to Employee Onboarding Management System (EOMS)

Thank you for your interest in contributing to EOMS! We welcome contributions from developers, designers, compliance specialists, and HR tech enthusiasts.

---

## 1. Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any violations to `security@eoms.in`.

---

## 2. Development Prerequisites

Ensure your development environment meets the following specifications:
- **Node.js**: v20.x, v22.x, or v24.x (`v24.12.0` recommended)
- **MySQL**: 8.0 or higher
- **Package Manager**: `npm` (v10.x+)
- **Git**: 2.30+

---

## 3. Getting Started Locally

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/sagegallant/EOMS.git
   cd EOMS
   ```

2. **Backend Setup**:
   ```bash
   cd server
   cp .env.example .env
   # Update your MySQL credentials in .env
   npm install
   npm run seed   # Runs idempotent seeding with Indian corporate personas
   npm start
   ```

3. **Frontend Setup**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` to explore the interactive SaaS dashboard.

---

## 4. Git Branching Strategy & Workflow

We follow standard Trunk-Based Feature Branching:

- `main`: Production-ready code. Protected branch.
- `feature/<name>`: For new capabilities (e.g. `feature/asset-barcode-scanner`).
- `fix/<name>`: For defect remediation (e.g. `fix/jwt-expiration-race`).
- `test/<name>`: For test suite additions.
- `docs/<name>`: For architectural or documentation updates.

### Conventional Commit Standards

All commits must adhere to the [Conventional Commits specification](https://www.conventionalcommits.org/):
```
<type>(<scope>): <short summary>

[optional body]
```

**Common Types:**
- `feat`: New feature or capability.
- `fix`: Bug fix.
- `refactor`: Code restructuring without behavior change.
- `style`: UI token, theme, CSS styling updates.
- `test`: Adding or enhancing test suites.
- `docs`: Documentation updates.
- `chore`: Dependency updates, build configurations.

---

## 5. Automated Multi-Phase Testing Standards

No pull request will be approved without complete green status across all test suites:

```bash
# Run entire test suite (Unit, Integration & E2E)
cd server
npm test

# Run unit tests only
npm run test:unit

# Run live REST API integration tests
npm run test:integration

# Run 4-persona E2E lifecycle simulation
npm run test:e2e
```

---

## 6. Design System Guidelines

EOMS utilizes a modern, accessible, enterprise SaaS design system:
- **Primary Accent**: Electric Sapphire (`#4F46E5` / Indigo-600)
- **Backgrounds**: Slate Canvas (`#F8FAFC`) with Crisp White Cards (`#FFFFFF`)
- **Borders & Dividers**: Subdued Slate (`#E2E8F0`)
- **Typography**: Inter / Outfit (`sans-serif`)
- **Icons**: Lucide React SVG icons only. Raw Unicode emojis are strictly forbidden in UI components.
- **Tone**: Professional, crisp, high-contrast, state-of-the-art enterprise software.

---

## 7. Indian Corporate Context Guidelines

When adding seed data or mock models, maintain authentic Indian enterprise domain references:
- **Statutory Documents**: Permanent Account Number (PAN), Aadhaar, EPFO Form 11, Degree Certificates.
- **Compliance Regulations**: Prevention of Sexual Harassment (POSH) Act 2013, Information Technology Act 2000.
- **Hubs**: Bengaluru (HQ), Hyderabad, Pune, Gurugram, Mumbai, Chennai.
- **Personas**: Culturally authentic full names and realistic corporate email structures (`@eoms.in`).

---

## 8. Submitting a Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a Pull Request against `main`.
3. Complete all sections of the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. Address review comments promptly. Once tests pass and two maintainers approve, your changes will be merged!
