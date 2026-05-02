const MODEL_MAP = {
  fast: 'llama3-8b-8192',
  accurate: 'llama3-70b-8192',
};

const BASE_PROMPT = `You are SelfGraph, a behavioral intelligence system.
Analyze language with evidence only: tone, repetition, contradictions, and intent-vs-action gaps.
Identify hidden motivations, avoidance loops, and self-deception signals when evidence exists.

Rules:
- No fluff. No vague terms like maybe/probably/possibly.
- Be precise, direct, constructive.
- If evidence is missing, return "Not enough evidence".
- Contradictions must be explicit and concrete.
- Return valid JSON only.

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

export async function POST(request) {
  try {
    const { chatHistory, model = 'accurate', section = 'full' } = await request.json();
    if (!chatHistory?.trim()) return Response.json({ error: 'Chat history is required.' }, { status: 400 });
    if (chatHistory.trim().length < 250) return Response.json({ error: 'Chat history too short (min 250 chars).' }, { status: 400 });

    const selectedModel = MODEL_MAP[model] || model || MODEL_MAP.accurate;
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return Response.json({ error: 'Missing GROQ_API_KEY in environment.' }, { status: 500 });

    const scopedPrompt = section === 'full' ? BASE_PROMPT : `${BASE_PROMPT}\nReturn full JSON but focus strongest evidence and detail on section: ${section}.`;

    const payload = {
      model: selectedModel,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: scopedPrompt },
        { role: 'user', content: chatHistory },
      ],
    };

    const start = Date.now();
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) return Response.json({ error: data?.error?.message || 'Groq API error' }, { status: 500 });

    const rawText = data?.choices?.[0]?.message?.content;
    if (!rawText) return Response.json({ error: 'No Groq response text returned.' }, { status: 500 });

    const result = JSON.parse(rawText);
    const usage = data?.usage || {};

    return Response.json({
      result,
      telemetry: {
        model: selectedModel,
        durationMs: Date.now() - start,
        inputTokens: usage.prompt_tokens || 0,
        outputTokens: usage.completion_tokens || 0,
        costEstimateUSD: 'N/A',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected server error.' }, { status: 500 });
  }
}
