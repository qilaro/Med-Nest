# Security Standard: Med-Nest

**Status**: Phase 1 ✅ Active | Phase 2 🔄 In Progress

## 1. Authentication ✅ CLERK INTEGRATED
- **Provider**: Clerk (production-grade)
- **Middleware**: `clerkMiddleware()` validates tokens on all routes
- **Components**: SignInButton, SignUpButton, UserButton integrated in Header
- **Status**: ✅ Deployed on all pages

## 2. Database Security

### A) Row Level Security (RLS)
- Default `DENY ALL` on all tables
- Public `SELECT` allowed on `brands`, `generics`, `faqs`, `companies`
- Admin access restricted for `INSERT/UPDATE/DELETE`
- Users can only see their own reviews

### B) Audit Logging
- Database triggers auto-capture INSERT/UPDATE/DELETE
- Logs stored in `audit_logs` table (currently 0 entries)

### C) Encryption
- **In-Transit**: TLS 1.3 for all connections
- **At-Rest**: AES-256 encryption

## 3. API Security
- All database queries go through Next.js API routes (server-side)
- Lazy DB connection pattern — only initializes on first query
- Environment variables managed via Vercel Encrypted Secrets

## 4. Phase 2 - In Progress
- Input validation (Zod schemas)
- Rate limiting
- Bot detection
- Enhanced audit logging
- CORS + security headers
