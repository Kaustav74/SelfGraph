# SelfGraph MVP

SelfGraph is a Next.js MVP that converts pasted or uploaded chat history into:
- A structured Self Profile
- A personalized Improvement System

## Tech Stack
- Next.js (React)
- Node.js API route
- OpenAI API
- Tailwind CSS

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create env file:
   ```bash
   cp .env.example .env.local
   ```
3. Add your OpenAI key in `.env.local`.
4. Run the app:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:3000`.

## Environment Variables
See `.env.example`.

## Prompt used for AI
The prompt is defined as `SYSTEM_PROMPT` in `app/api/analyze/route.js`.

## How it works
1. User pastes chat history or uploads a `.txt` file.
2. Frontend sends text to `POST /api/analyze`.
3. API route calls OpenAI Responses API with JSON schema enforcement.
4. Structured analysis is returned and rendered in sections.
5. User can copy or download the final report.

## Next improvements
- Add analysis history
- Add editable plan regeneration per section
- Add model selection + token usage stats
- Add privacy controls (local processing option)
