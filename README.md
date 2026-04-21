# MedQ

MedQ is an SEO-first medicine information platform with the motto:
**"Learn more. Live better."**

This repository is currently in a fresh bootstrap phase with a static Home prototype.

## Current State
- `index.html` + `styles.css` for local Home-page design preview
- `docs/PRD.md` as product requirements source
- `AGENTS.md` as AI/agent execution guide

## Planned Architecture
```text
mednest/
  frontend/   # Next.js + TypeScript
  backend/    # FastAPI + Python
  shared/     # Shared types/constants/contracts
```

## Local Preview
```bash
python3 -m http.server 3000
```
Open: `http://localhost:3000`

## Documentation
- Product requirements: `docs/PRD.md`
- Agent operating rules: `AGENTS.md`
