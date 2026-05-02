import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are SelfGraph, a high-clarity behavioral analyst. Analyze user chat history and output strict JSON.

Return a JSON object with keys:
identity_core: { demographics, role_stage_of_life }
driving_forces: { motivations: string[], inferred_goals: string[] }
behavioral_patterns: { thinking_style, execution_level, consistency }
contradictions: string[]
limiting_factors: string[]
execution_profile: one of ["Thinker","Doer","Avoider","Starter","Finisher"]
trajectory: string
system_correction_plan: {
  top_3_weaknesses: string[],
  stop: string[],
  start: string[],
  ignore: string[]
}
seven_day_execution_plan: { day_1, day_2, day_3, day_4, day_5, day_6, day_7 }
failure_warning: string

Rules:
- Be direct and specific.
- If uncertain, use "Not enough evidence".
- Keep each string concise and practical.`;

export async function POST(request) {
  try {
    const { chatHistory } = await request.json();

    if (!chatHistory || !chatHistory.trim()) {
      return Response.json({ error: 'Chat history is required.' }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY' });

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Chat history:\n${chatHistory}` },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'selfgraph_output',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              identity_core: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  demographics: { type: 'string' },
                  role_stage_of_life: { type: 'string' },
                },
                required: ['demographics', 'role_stage_of_life'],
              },
              driving_forces: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  motivations: { type: 'array', items: { type: 'string' } },
                  inferred_goals: { type: 'array', items: { type: 'string' } },
                },
                required: ['motivations', 'inferred_goals'],
              },
              behavioral_patterns: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  thinking_style: { type: 'string' },
                  execution_level: { type: 'string' },
                  consistency: { type: 'string' },
                },
                required: ['thinking_style', 'execution_level', 'consistency'],
              },
              contradictions: { type: 'array', items: { type: 'string' } },
              limiting_factors: { type: 'array', items: { type: 'string' } },
              execution_profile: { type: 'string', enum: ['Thinker', 'Doer', 'Avoider', 'Starter', 'Finisher'] },
              trajectory: { type: 'string' },
              system_correction_plan: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  top_3_weaknesses: { type: 'array', items: { type: 'string' } },
                  stop: { type: 'array', items: { type: 'string' } },
                  start: { type: 'array', items: { type: 'string' } },
                  ignore: { type: 'array', items: { type: 'string' } },
                },
                required: ['top_3_weaknesses', 'stop', 'start', 'ignore'],
              },
              seven_day_execution_plan: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  day_1: { type: 'string' },
                  day_2: { type: 'string' },
                  day_3: { type: 'string' },
                  day_4: { type: 'string' },
                  day_5: { type: 'string' },
                  day_6: { type: 'string' },
                  day_7: { type: 'string' },
                },
                required: ['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'],
              },
              failure_warning: { type: 'string' },
            },
            required: [
              'identity_core',
              'driving_forces',
              'behavioral_patterns',
              'contradictions',
              'limiting_factors',
              'execution_profile',
              'trajectory',
              'system_correction_plan',
              'seven_day_execution_plan',
              'failure_warning',
            ],
          },
          strict: true,
        },
      },
    });

    const result = JSON.parse(response.output_text);
    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected error' }, { status: 500 });
  }
}
