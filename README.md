# SelfGraph — Persistent Personal Intelligence System

## What this version adds
- Elite behavioral analysis prompt (evidence-based, contradiction-first, no vague language)
- 5 metrics: Consistency, Execution, Discipline, Contradiction Index, Clarity Index
- Local persistence (`localStorage`) with timestamp + input snapshot + scores
- Evolution Dashboard (latest vs previous comparison)
- Section-level regeneration (`contradictions`, `system_correction_plan`, `scores`)
- Manual section editing
- Model selector (Fast / Accurate)
- Telemetry panel (response time, token usage, cost estimate)
- Privacy options: local redaction + local-only mock mode

## Run locally
1. `npm install`
2. `cp .env.example .env.local`
3. Add `GROQ_API_KEY=...` in `.env.local`
4. `npm run dev`
5. Open `http://localhost:3000`

## Refined internal AI prompt
- Stored in `app/api/analyze/route.js` as `BASE_PROMPT`.
- Forces explicit, grounded analysis from tone/repetition/intent-action gaps.

## Scoring logic
The model assigns scores (0–100) from language evidence:
- **Consistency:** repeated intent vs follow-through
- **Execution:** specificity and completion-oriented wording
- **Discipline:** commitment vs avoidance/self-escape language
- **Contradiction Index:** mismatch between claims and behavior signals
- **Clarity Index:** precision and coherence of stated goals/actions

## Storage implementation
- Key: `selfgraph_history_v1`
- Stores up to 20 analyses
- Shape: `{ timestamp, inputSnapshot, scores }`

## Architecture
- Next.js App Router frontend
- API route backend (`app/api/analyze/route.js`)
- Local-first persistence abstraction in client state


## Groq model
- Recommended: `llama3-70b-8192`
- Optional fast mode: `llama3-8b-8192`
