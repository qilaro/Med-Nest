# 📚 Med-Nest Documentation Index

**Last Updated**: May 3, 2026 | **Phase**: Sprint 1 Complete → Sprint 2 Planning

---

## 📋 Core Documentation (Single Source of Truth)

### 1. **SESSION_STATE.md** 🏆 PRIMARY REFERENCE
- **Purpose**: Current sprint status, progress tracking, technical decisions
- **Audience**: All team members & new agents
- **Content**: Phase status, completed milestones, data statistics, next steps
- **Priority**: Read FIRST in every session

### 2. **Project_Spec.md**
- **Purpose**: Executive specification, data strategy, tech stack
- **Audience**: Product leads, architects, new contributors
- **Content**: Features (A–H), data pipeline phases, scalability roadmap, tech stack
- **Status**: Updated with Phase 1 completion (23,106 drugs loaded)

### 3. **PRD.md**
- **Purpose**: Product requirements & acceptance criteria
- **Audience**: Designers, product managers, developers
- **Content**: MVP scope, data strategy, tech stack, security requirements, metrics
- **Status**: Updated with Phase 1 data, security features, timeline

### 4. **SECURITY.md**
- **Purpose**: Security standards, implementation status, compliance roadmap
- **Audience**: Security engineers, architects, compliance teams
- **Content**: Zero-trust architecture, RLS (18 policies), audit logging (15 triggers), Clerk auth, Phase 2 hardening checklist
- **Status**: Comprehensive implementation guide with progress tracking

---

## 🏗️ Architecture & Technical Documentation

### 5. **DATABASE_SCHEMA.md**
- **Purpose**: Complete schema documentation, field definitions, relationships
- **Audience**: Backend engineers, data engineers, DBAs
- **Content**: 6 tables, 82+ fields, RLS strategy, audit logging details
- **Status**: Updated with `country` column + index for companies table

### 6. **ARCHITECTURE.md**
- **Purpose**: Component design philosophy, folder structure, styling standards
- **Audience**: Frontend engineers, UI developers
- **Content**: Atomic design patterns, folder organization, theming, migration workflow
- **Status**: Stable; no changes needed

### 7. **DATA_PIPELINE.md**
- **Purpose**: Data acquisition architecture, 4-stage funnel, execution roadmap
- **Audience**: Data engineers, backend engineers
- **Content**: Stage 1 (CSV ingestion), Stage 2 (Med-Ex scraper), Stage 3 (company sites), Stage 4 (AI synthesis)
- **Status**: Updated with Phase 1 results, Phase 2 timeline (22.5 hours)

---

## 📖 Agent Instructions

### 8. **GEMINI.md** 🤖 CANONICAL
- **Purpose**: Agent execution mandate, proactivity limits, source of truth hierarchy
- **Audience**: AI agents, automation scripts
- **Content**: "Don't do anything before asking", SESSION_STATE.md priority, zero design deviation
- **Status**: Authoritative; supersedes all other instructions

---

## 📄 Project Overview

### 9. **README.md**
- **Purpose**: Project overview, quick start, architecture diagram
- **Audience**: New contributors, project visitors
- **Content**: Getting started, dependencies, project structure
- **Status**: Current; basic documentation

---

## 🗑️ DEPRECATED (Deleted May 3, 2026)

The following files were deleted as they were redundant or informational only:
- ❌ `docs/DATA_STRATEGY.md` — Consolidated into PROJECT_SPEC.md & DATA_PIPELINE.md
- ❌ `docs/MARKET_RESEARCH.md` — Informational only; not referenced in decisions
- ❌ `docs/AGENTS.md` (in docs/) — Duplicate of GEMINI.md

---

## 🔍 How to Find What You Need

| Looking for... | Read... |
|---|---|
| **Current sprint status** | SESSION_STATE.md |
| **What's implemented?** | SESSION_STATE.md + SECURITY.md |
| **Data statistics** | PROJECT_SPEC.md + DATA_PIPELINE.md |
| **Next steps** | SESSION_STATE.md (bottom section) |
| **Database schema** | DATABASE_SCHEMA.md |
| **Security features** | SECURITY.md |
| **Frontend architecture** | ARCHITECTURE.md |
| **Product requirements** | PRD.md |
| **Tech stack** | Project_Spec.md (section 4) |
| **Data pipeline phases** | DATA_PIPELINE.md + Project_Spec.md |

---

## ✅ Documentation Health

| Metric | Status |
|--------|--------|
| **Total Docs** | 9 active |
| **Up-to-Date** | 100% |
| **Consistency** | ✅ All aligned |
| **Redundancy** | ✅ None |
| **Broken Links** | ✅ None |
| **Single Source of Truth** | ✅ SESSION_STATE.md |

---

## 📝 Update Checklist for Future Sessions

When SESSION_STATE.md changes materially:
- [ ] Update phase status in PROJECT_SPEC.md
- [ ] Update phase status in DATA_PIPELINE.md
- [ ] Update metrics in PRD.md
- [ ] Update implementation status in SECURITY.md
- [ ] Update schema in DATABASE_SCHEMA.md (if applicable)
- [ ] Update this INDEX.md if new docs added

---

**Maintained By**: Med-Nest Development Team  
**Last Verified**: May 3, 2026  
**Next Review**: When Phase 2 completes
