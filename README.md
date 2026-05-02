# SelfGraph (Premium MVP)

SelfGraph is a premium-feel personal intelligence app that turns chat history into:
- Sharp behavioral profile
- Score breakdown (Consistency / Execution / Discipline)
- System correction plan + 7-day execution plan

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- OpenAI Responses API

## Run locally
1. `npm install`
2. `cp .env.example .env.local`
3. Add `OPENAI_API_KEY` to `.env.local`
4. `npm run dev`
5. Open `http://localhost:3000`

## How it works
1. User pastes or uploads `.txt` history.
2. Frontend validates input (empty + minimum length).
3. API route sends text to OpenAI with strict schema.
4. Model returns:
   - Scores with explanations
   - Structured profile sections
5. UI renders cards, progress bars, and export actions.

## Scoring logic (LLM-guided rubric)
The model computes three scores from language evidence:
- **Consistency (0-100):** intent repetition vs sustained follow-through language.
- **Execution (0-100):** concrete action verbs, deadlines, and completed-task framing.
- **Discipline (0-100):** commitment language, avoidance markers, and self-regulation cues.

## Prompt location
- `app/api/analyze/route.js` (`SYSTEM_PROMPT`)

## V2 roadmap
- Side-by-side report diffing over time
- Section-level “Regenerate” controls
- Optional local redaction/privacy preprocessing
- PDF export and team coaching mode
