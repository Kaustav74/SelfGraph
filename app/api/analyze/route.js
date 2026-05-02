import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are SelfGraph, an elite behavioral intelligence analyst.
Your job is to infer identity, patterns, and execution quality from language evidence.
Be sharp, specific, and decisive.

Non-negotiable rules:
- No vague language (avoid: may, might, possibly, probably).
- Every point must be grounded in linguistic evidence (tone, repetition, intent/action gaps, emotional framing).
- Be constructively blunt.
- No motivational fluff.
- If evidence is missing, write exactly: "Not enough evidence".

Return strict JSON with this shape:
{
  "scores": {
    "consistency": { "score": 0-100, "explanation": "..." },
    "execution": { "score": 0-100, "explanation": "..." },
    "discipline": { "score": 0-100, "explanation": "..." }
  },
  "sections": {
    "identity_core": { "demographics": "...", "role_stage_of_life": "..." },
    "driving_forces": { "motivations": ["..."], "goals_inferred": ["..."] },
    "behavioral_patterns": { "thinking_style": "...", "execution_level": "...", "consistency_pattern": "..." },
    "contradictions": ["..."],
    "limiting_factors": ["..."],
    "execution_profile": "Thinker|Doer|Avoider|Starter|Finisher",
    "trajectory": "...",
    "system_correction_plan": {
      "top_3_weaknesses": ["..."],
      "stop": ["..."],
      "start": ["..."],
      "ignore": ["..."]
    },
    "seven_day_execution_plan": {
      "day_1": "...", "day_2": "...", "day_3": "...", "day_4": "...", "day_5": "...", "day_6": "...", "day_7": "..."
    },
    "failure_warning": "..."
  }
}`;

export async function POST(request) {
  try {
    const { chatHistory } = await request.json();
    if (!chatHistory || !chatHistory.trim()) return Response.json({ error: 'Chat history is required.' }, { status: 400 });
    if (chatHistory.trim().length < 250) return Response.json({ error: 'Chat history is too short for reliable analysis.' }, { status: 400 });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY' });

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: chatHistory }],
      text: {
        format: {
          type: 'json_schema',
          name: 'selfgraph_premium_output',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              scores: {
                type: 'object', additionalProperties: false,
                properties: {
                  consistency: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score', 'explanation'] },
                  execution: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score', 'explanation'] },
                  discipline: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score', 'explanation'] },
                }, required: ['consistency', 'execution', 'discipline'],
              },
              sections: {
                type: 'object', additionalProperties: false,
                properties: {
                  identity_core: { type: 'object', additionalProperties: false, properties: { demographics: { type: 'string' }, role_stage_of_life: { type: 'string' } }, required: ['demographics', 'role_stage_of_life'] },
                  driving_forces: { type: 'object', additionalProperties: false, properties: { motivations: { type: 'array', items: { type: 'string' } }, goals_inferred: { type: 'array', items: { type: 'string' } } }, required: ['motivations', 'goals_inferred'] },
                  behavioral_patterns: { type: 'object', additionalProperties: false, properties: { thinking_style: { type: 'string' }, execution_level: { type: 'string' }, consistency_pattern: { type: 'string' } }, required: ['thinking_style', 'execution_level', 'consistency_pattern'] },
                  contradictions: { type: 'array', items: { type: 'string' } },
                  limiting_factors: { type: 'array', items: { type: 'string' } },
                  execution_profile: { type: 'string', enum: ['Thinker', 'Doer', 'Avoider', 'Starter', 'Finisher'] },
                  trajectory: { type: 'string' },
                  system_correction_plan: { type: 'object', additionalProperties: false, properties: { top_3_weaknesses: { type: 'array', items: { type: 'string' } }, stop: { type: 'array', items: { type: 'string' } }, start: { type: 'array', items: { type: 'string' } }, ignore: { type: 'array', items: { type: 'string' } } }, required: ['top_3_weaknesses', 'stop', 'start', 'ignore'] },
                  seven_day_execution_plan: { type: 'object', additionalProperties: false, properties: { day_1: { type: 'string' }, day_2: { type: 'string' }, day_3: { type: 'string' }, day_4: { type: 'string' }, day_5: { type: 'string' }, day_6: { type: 'string' }, day_7: { type: 'string' } }, required: ['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'] },
                  failure_warning: { type: 'string' },
                },
                required: ['identity_core', 'driving_forces', 'behavioral_patterns', 'contradictions', 'limiting_factors', 'execution_profile', 'trajectory', 'system_correction_plan', 'seven_day_execution_plan', 'failure_warning'],
              },
            },
            required: ['scores', 'sections'],
          },
        },
      },
    });

    return Response.json({ result: JSON.parse(response.output_text) });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected server error.' }, { status: 500 });
  }
}
