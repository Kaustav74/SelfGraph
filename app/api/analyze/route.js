const MODEL_MAP = {
  fast: 'gemini-2.0-flash',
  accurate: 'gemini-2.5-pro',
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

export async function POST(request) {
  try {
    const { chatHistory, model = 'fast', section = 'full' } = await request.json();
    if (!chatHistory?.trim()) return Response.json({ error: 'Chat history is required.' }, { status: 400 });
    if (chatHistory.trim().length < 250) return Response.json({ error: 'Chat history too short (min 250 chars).' }, { status: 400 });

    const selectedModel = MODEL_MAP[model] || MODEL_MAP.fast;
    const apiKey = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
    const scopedPrompt = section === 'full' ? BASE_PROMPT : `${BASE_PROMPT}\nReturn full JSON but focus strongest evidence and detail on section: ${section}.`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: `${scopedPrompt}\n\nChat History:\n${chatHistory}` }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
    };

    const start = Date.now();
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || 'Gemini API error';
      return Response.json({ error: message }, { status: 500 });
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return Response.json({ error: 'No Gemini response text returned.' }, { status: 500 });

    const result = JSON.parse(rawText);
    const durationMs = Date.now() - start;
    const usage = data?.usageMetadata || {};
    const inputTokens = usage.promptTokenCount || 0;
    const outputTokens = usage.candidatesTokenCount || 0;
    const costEstimateUSD = 'N/A';

    return Response.json({ result, telemetry: { model: selectedModel, durationMs, inputTokens, outputTokens, costEstimateUSD } });
  } catch (error) {
    return Response.json({ error: error.message || 'Unexpected server error.' }, { status: 500 });
  }
}
