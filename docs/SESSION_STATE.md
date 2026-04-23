# Session State & Progress Tracker

## Core Mandates
1. **Zero Design Deviation**: The design in `reference/index.html` and `reference/styles.css` is the absolute source of truth. Migration to Next.js must result in a pixel-perfect match.
2. **Incremental Migration**: Changes must be small, verified, and modular. No "big bang" updates.
3. **Architectural Alignment**: Follow `docs/Project_Spec.md` for folder structure, tech stack, and logic implementation.
4. **Context Continuity**: Every session must update this file before ending.

---

## Methodology & Approach

### 1. UI Migration Strategy (The "How")
- **Atomic Componentization**: We will break down `reference/index.html` into logical Next.js components (e.g., `EmergencyBanner.tsx`, `Navbar.tsx`, `Hero.tsx`) BEFORE building the full page.
- **Style Isolation**: 
    - Variables and global resets from `styles.css` move to `globals.css`.
    - Component-specific styles from `styles.css` will be extracted into Tailwind classes where appropriate, but ONLY if they result in an identical visual output.
- **Pixel-Perfect Validation**: After each component is migrated, we will visually compare the Next.js dev server output against the `reference/index.html` to ensure no shifts in layout, typography, or color.

### 2. Backend Migration Strategy
- **Modular FastAPI**: We will follow the `backend/app/api/routes/` structure from the spec.
- **Service-Driven Logic**: Business logic (search, interaction checking, Gemini integration) will live in `backend/app/services/` to keep routes clean and testable.
- **Type Safety**: Shared types between Frontend and Backend will be managed in the `shared/` directory as per the spec.

### 3. Verification Loop
Every small change will follow: **Implement -> Build/Lint -> Visual Check -> Update SESSION_STATE.md**.

---

## Current Status
- **Phase**: Initialization & Planning
- **Last Action**: Created `SESSION_STATE.md` and documented the detailed Methodology.
- **Next Action**: Initialize the Next.js frontend project (Step 1.1).

---

## Roadmap

### Phase 1: Frontend Foundation (Next.js)
- [ ] 1.1 Initialize Next.js with TypeScript, Tailwind, and App Router.
- [ ] 1.2 Configure `globals.css` with the exact variables and base styles from `reference/styles.css`.
- [ ] 1.3 Create the root layout (Site-wide layout).
- [ ] 1.4 Componentize the `reference/index.html` (Navbar, Hero, Features, etc.) without visual changes.

### Phase 2: Backend Foundation (FastAPI)
- [ ] 2.1 Initialize FastAPI project structure.
- [ ] 2.2 Setup Database models (SQLAlchemy) based on Project Spec.
- [ ] 2.3 Implement basic health check and medicine search API.

### Phase 3: Integration & Features
- [ ] 3.1 Connect Frontend to Backend.
- [ ] 3.2 Implement AI Chatbot (Gemini).
- [ ] 3.3 Implement Drug Interaction Checker.

---

## Task Log
- [2026-04-23] Initialized `SESSION_STATE.md`. Verified project structure and design reference. Added detailed Methodology & Approach.
- [2026-04-23] Refined `reference/index.html` design: Added large rounded 90rem outer container with mint-blue background (#E4F1F0) and double-layer soft shadows to match user vision.
