# Security Standard: Med-Nest (2026 Gold Standard)

**Status**: Phase 1 ✅ Active | Phase 2 🔄 In Progress

## 1. Zero Trust Database Architecture ✅ ACTIVE

We assume the network is already compromised. Security is enforced at the individual row and field level.

### A) Row Level Security (RLS) ✅ IMPLEMENTED
*   **Default Policy**: `DENY ALL` on all tables.
*   **Public Access**: Explicitly allowed only for `SELECT` on `drugs`, `generics`, `faqs`, and `companies` tables.
*   **Admin Access**: Restricted to authenticated users with `admin` role for `INSERT/UPDATE/DELETE` on companies.
*   **User Data**: Users can only `SELECT` their own reviews via `auth.uid() = user_id`.
*   **Implementation**: 18 policies deployed across 6 tables. Tested and verified on Neon PostgreSQL.

### B) Audit Logging ✅ IMPLEMENTED
*   **Auto-Capture**: Database triggers automatically log all INSERT/UPDATE/DELETE operations.
*   **Audit Table**: `audit_logs` stores timestamp, user ID, table name, operation type, and old/new values as JSON.
*   **Coverage**: 15 triggers deployed on 5 tables (drugs, generics, companies, faqs, reviews).
*   **Results**: 26,646 entries captured during initial data ingestion (May 3, 2026).
*   **Query Example**: `SELECT * FROM audit_logs WHERE table_name = 'drugs' ORDER BY created_at DESC LIMIT 100;`

### C) Data Encryption & Integrity
*   **In-Transit**: Mandatory **TLS 1.3** for all database and API connections.
*   **At-Rest**: **AES-256** encryption for the entire database volume.
*   **Sensitive Field Hashing**: Any PII (Personal Identifiable Information) must be salted and hashed using **Argon2id**.

## 2. API & Authentication Security ✅ CLERK INTEGRATED
*   **Auth Provider**: Clerk (production-grade, enterprise-standard)
*   **Implementation**: ClerkProvider wraps entire app; middleware intercepts all routes
*   **Middleware**: `clerkMiddleware()` validates tokens and passes user context to app
*   **Token Lifecycle**: Short-lived Access Tokens + Refresh Tokens with rotation
*   **Components**: SignInButton, SignUpButton, UserButton integrated in Header
*   **Status**: ✅ Deployed and tested

## 3. Application Security (Phase 2 - 7.5 hours) 🔄 IN PROGRESS
- [ ] **Input Validation**: Zod schema validation for all API inputs (prevent injection attacks)
- [ ] **CAPTCHA Integration**: reCAPTCHA v3 on signup/login routes (prevent bot abuse)
- [ ] **Rate Limiting**: 10 requests/minute per IP address (prevent brute-force, scraping)
- [ ] **Bot Detection**: User-Agent validation + behavioral analysis (detect scrapers)
- [ ] **Enhanced Audit**: Log security events (failed logins, suspicious patterns)
- [ ] **CORS Configuration**: Strict origin allowlist to prevent cross-origin abuse
- [ ] **Error Handling**: Generic error messages (no system info leakage)

## 4. Infrastructure Hardening ⚠️ EXTERNAL SETUP (User Responsibility)
*   **WAF (Web Application Firewall)**: Deployment of Cloudflare/Vercel WAF to block SQL Injection, XSS, and DDoS attacks.
*   **DDoS Protection**: Global edge-level mitigation via Cloudflare or AWS Shield.
*   **Monitoring**: Set up alerts for unusual traffic patterns.

## 5. Audit & Observability ✅ ACTIVE
*   **Database Audit Logs**: Automated capture via triggers (26,646 entries logged during Phase 1).
*   **Error Monitoring**: Sentry/LogSnag recommended for real-time security event alerting.
*   **Access Logs**: Clerk provides authentication audit trail.

## 6. Deployment Security (CI/CD)
*   **Static Analysis (SAST)**: Automated code scanning on every `git push` to detect secrets or vulnerable dependencies.
*   **Dependency Audits**: `pnpm audit` enforced in the build pipeline.
*   **Secrets Management**: All keys (Clerk, DATABASE_URL, Gemini API) stored in Vercel Encrypted Secrets. Never committed to Git.
