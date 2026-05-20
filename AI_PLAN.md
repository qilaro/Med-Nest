# AI Health Assistant — Build Plan

## Architecture (simple)

```
User → Chat UI → Our API → [Search DB + Call Gemini] → Return answer
```

**We never let Gemini answer alone.** We always find the right drug in our DB first, send that data to Gemini, then Gemini answers using OUR data. This is called **RAG**.

---

## 3 Phases

### Phase 1 — Launch (3 days)

| Day | What | Files |
|-----|------|-------|
| 1 | Enable pgvector, embed all generics data | `schema.ts`, one-time script |
| 2 | Build `/api/ai/chat` endpoint | `app/api/ai/chat/route.ts` |
| 3 | Build chat UI on ai-assistant page | `app/ai-assistant/page.tsx` |

**Cost:** Gemini API ~$10-30/month

### Phase 2 — Collect & Improve (ongoing)

- Save every Q&A to a training table
- Thumbs up/down on answers
- Add prescription scanner (Gemini Vision)

### Phase 3 — Own Model (3-6 months)

When we have 5,000+ curated Q&A pairs → train Llama 3 8B on our data → replace Gemini → cost drops to ~$5/month

---

## Current Stack (stays the same)

| Tool | Purpose | Already have? |
|------|---------|---------------|
| Neon (PostgreSQL) | Store drug data + vector embeddings | ✅ |
| pgvector | Search drugs by meaning | ❌ Need to enable |
| Gemini API | Understand questions + write answers | ❌ Need API key |
| Next.js API routes | Backend logic | ✅ |
| Our DB (71K brands) | Source of truth | ✅ |

## New Files Needed

```
frontend/app/api/ai/chat/route.ts    → RAG endpoint
frontend/lib/services/embedding.ts  → Vector search helpers
frontend/.env.local                 → Add GEMINI_API_KEY
```

## One rule that never changes

**Always retrieve from DB first. Never let Gemini answer from its own knowledge.**
