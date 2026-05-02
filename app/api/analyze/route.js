import OpenAI from 'openai';

const MODEL_MAP = {
  fast: 'gpt-4.1-mini',
  accurate: 'gpt-4.1',
};

const BASE_PROMPT = `You are SelfGraph, a behavioral intelligence system.
Analyze language with evidence only: tone, repetition, contradictions, and intent-vs-action gaps.
Identify hidden motivations, avoidance loops, and self-deception signals when evidence exists.

Rules:
- No fluff. No vague terms like maybe/probably/possibly.
- Be precise, direct, constructive.
- If evidence is missing, return "Not enough evidence".
- Contradictions must be explicit and concrete.

Return strict JSON with this shape:
{
  "scores": {
    "consistency": {"score": 0-100, "explanation": "..."},
    "execution": {"score": 0-100, "explanation": "..."},
    "discipline": {"score": 0-100, "explanation": "..."},
    "contradiction_index": {"score": 0-100, "explanation": "..."},
    "clarity_index": {"score": 0-100, "explanation": "..."}
  },
  "sections": {
    "identity_core": {"demographics":"...","role_stage_of_life":"..."},
    "driving_forces": {"motivations":["..."],"goals_inferred":["..."]},
    "behavioral_patterns": {"thinking_style":"...","execution_level":"...","consistency_pattern":"..."},
    "contradictions": ["..."],
    "limiting_factors": ["..."],
    "execution_profile": "Thinker|Doer|Avoider|Starter|Finisher",
    "trajectory": "...",
    "system_correction_plan": {"top_3_weaknesses":["..."],"stop":["..."],"start":["..."],"ignore":["..."]},
    "seven_day_execution_plan": {"day_1":"...","day_2":"...","day_3":"...","day_4":"...","day_5":"...","day_6":"...","day_7":"..."},
    "failure_warning": "..."
  }
}`;

const schema = {
  type: 'object', additionalProperties: false,
  properties: {
    scores: { type: 'object', additionalProperties: false, properties: {
      consistency: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score','explanation'] },
      execution: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score','explanation'] },
      discipline: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score','explanation'] },
      contradiction_index: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score','explanation'] },
      clarity_index: { type: 'object', additionalProperties: false, properties: { score: { type: 'number' }, explanation: { type: 'string' } }, required: ['score','explanation'] },
    }, required: ['consistency','execution','discipline','contradiction_index','clarity_index'] },
    sections: { type: 'object', additionalProperties: false, properties: {
      identity_core: { type: 'object', additionalProperties: false, properties: { demographics: { type: 'string' }, role_stage_of_life: { type: 'string' } }, required: ['demographics','role_stage_of_life'] },
      driving_forces: { type: 'object', additionalProperties: false, properties: { motivations: { type: 'array', items: { type: 'string' } }, goals_inferred: { type: 'array', items: { type: 'string' } } }, required: ['motivations','goals_inferred'] },
      behavioral_patterns: { type: 'object', additionalProperties: false, properties: { thinking_style: { type: 'string' }, execution_level: { type: 'string' }, consistency_pattern: { type: 'string' } }, required: ['thinking_style','execution_level','consistency_pattern'] },
      contradictions: { type: 'array', items: { type: 'string' } }, limiting_factors: { type: 'array', items: { type: 'string' } },
      execution_profile: { type: 'string', enum: ['Thinker','Doer','Avoider','Starter','Finisher'] }, trajectory: { type: 'string' },
      system_correction_plan: { type: 'object', additionalProperties: false, properties: { top_3_weaknesses: { type: 'array', items: { type: 'string' } }, stop: { type: 'array', items: { type: 'string' } }, start: { type: 'array', items: { type: 'string' } }, ignore: { type: 'array', items: { type: 'string' } } }, required: ['top_3_weaknesses','stop','start','ignore'] },
      seven_day_execution_plan: { type: 'object', additionalProperties: false, properties: { day_1: { type: 'string' }, day_2: { type: 'string' }, day_3: { type: 'string' }, day_4: { type: 'string' }, day_5: { type: 'string' }, day_6: { type: 'string' }, day_7: { type: 'string' } }, required: ['day_1','day_2','day_3','day_4','day_5','day_6','day_7'] },
      failure_warning: { type: 'string' },
    }, required: ['identity_core','driving_forces','behavioral_patterns','contradictions','limiting_factors','execution_profile','trajectory','system_correction_plan','seven_day_execution_plan','failure_warning'] },
  }, required: ['scores','sections'],
};

export async function POST(request) {
  try {
    const { chatHistory, model = 'fast', section = 'full' } = await request.json();
    if (!chatHistory?.trim()) return Response.json({ error: 'Chat history is required.' }, { status: 400 });
    if (chatHistory.trim().length < 250) return Response.json({ error: 'Chat history too short (min 250 chars).' }, { status: 400 });

    const selectedModel = MODEL_MAP[model] || MODEL_MAP.fast;
    const scopedPrompt = section === 'full' ? BASE_PROMPT : `${BASE_PROMPT}\nReturn full JSON but focus strongest evidence and detail on section: ${section}.`;

    const start = Date.now();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY' });
    const response = await client.responses.create({
      model: selectedModel,
      input: [{ role: 'system', content: scopedPrompt }, { role: 'user', content: chatHistory }],
      text: { format: { type: 'json_schema', name: 'selfgraph_output', strict: true, schema } },
    });

    const result = JSON.parse(response.output_text);
    const durationMs = Date.now() - start;
    const usage = response.usage || {};
    const inputTokens = usage.input_tokens || 0;
    const outputTokens = usage.output_tokens || 0;
    const costEstimateUSD = ((inputTokens / 1_000_000) * 0.4 + (outputTokens / 1_000_000) * 1.6).toFixed(4);

    return Response.json({ result, telemetry: { model: selectedModel, durationMs, inputTokens, outputTokens, costEstimateUSD } });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected server error.' }, { status: 500 });
  }
}
