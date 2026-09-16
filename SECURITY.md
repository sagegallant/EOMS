# Security Policy

The Enterprise Onboarding Management System (EOMS) team takes the security of our platform and employee data extremely seriously.

---

## 1. Supported Versions

Security updates and critical vulnerability patches are provided for the following release branches:

| Version | Supported          | Security Maintenance Level |
| ------- | ------------------ | -------------------------- |
| 1.0.x   | :white_check_mark: | Active Full Support        |
| 0.8.x   | :white_check_mark: | Critical Security Fixes    |
| < 0.8.0 | :x:                | End of Life (Unsupported)  |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability in EOMS, please do **NOT** disclose it publicly via GitHub issues, discussions, or social media.

Instead, please send an encrypted or direct email to our security response team:
**security@eoms.in**

### What to Include in Your Report:
1. Type of issue (e.g., SQL injection, IDOR, privilege escalation, authentication bypass).
2. Step-by-step instructions or proof-of-concept (PoC) to reproduce the vulnerability.
3. Affected components (controllers, middleware, models, client views).
4. Potential impact on confidential employee data or corporate infrastructure.

### Response Timeline:
- **Acknowledgment**: Within 24 hours of receipt.
- **Initial Assessment**: Within 48 hours.
- **Fix Deployment**: Target within 7 business days for high-severity vulnerabilities.

---

## 3. Core Security Controls in EOMS

EOMS implements defense-in-depth across the application stack:

1. **Password Hashing**:
   - Industry-standard `bcryptjs` with high cost work factor (10 salt rounds). Plaintext passwords are never stored or logged.

2. **Session Security & Cryptographic Tokens**:
   - Stateless JSON Web Tokens (`jsonwebtoken`) signed with a cryptographically secure 256-bit secret.
   - Configurable session TTL (default 8 hours) with automated expiry validation.
   - Ephemeral challenge-response tokens for multi-factor authentication (MFA).

3. **Role-Based Access Control (RBAC)**:
   - Dynamic middleware guards enforcing strict hierarchy and granular action permissions (`requireRole`, `requirePermission`).
   - In-memory caching with automatic 60-second TTL to balance microsecond query speeds with real-time permission revocation.

4. **Database Query Parametrization**:
   - Sequelize ORM with parametrized SQL execution prevents SQL injection vectors across all 34 tables and stored views.

5. **HTTP Security Headers**:
   - Helmet middleware enforcing Content Security Policy (CSP), X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), and strict transport security (HSTS).
   - Express rate limiting (`express-rate-limit`) on authentication endpoints to thwart brute-force password guessing.
