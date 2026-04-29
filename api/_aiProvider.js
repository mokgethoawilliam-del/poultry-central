const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const DEFAULT_XAI_MODEL = process.env.XAI_MODEL || 'grok-4-fast-reasoning';
const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function normalizeJson(text) {
  const trimmed = String(text || '').trim();
  if (trimmed.startsWith('```')) {
    return trimmed.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  }
  return trimmed;
}

async function readErrorText(response) {
  try {
    const payload = await response.text();
    return payload || response.statusText;
  } catch {
    return response.statusText || 'Unknown provider error';
  }
}

async function callGroqCloud(apiKey, systemPrompt, userPrompt, temperature = 0.4) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_GROQ_MODEL,
      temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`GroqCloud request failed: ${await readErrorText(response)}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callXaiGrok(apiKey, systemPrompt, userPrompt, temperature = 0.4) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_XAI_MODEL,
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI Grok request failed: ${await readErrorText(response)}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callGemini(apiKey, systemPrompt, userPrompt, temperature = 0.4) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${await readErrorText(response)}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

function resolveAiConfig(aiKeys = {}) {
  const groqOrGrokApiKey =
    aiKeys.grok_api_key ||
    process.env.GROQ_API_KEY ||
    process.env.GROK_API_KEY ||
    process.env.XAI_API_KEY ||
    '';
  const geminiApiKey =
    aiKeys.gemini_api_key ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    '';

  return {
    groqOrGrokApiKey,
    geminiApiKey,
  };
}

async function generateJsonWithFallback({ systemPrompt, userPrompt, temperature = 0.4, aiKeys = {} }) {
  const { groqOrGrokApiKey, geminiApiKey } = resolveAiConfig(aiKeys);

  if (!groqOrGrokApiKey && !geminiApiKey) {
    throw new Error('No AI provider key is configured. Add GROQ_API_KEY or GEMINI_API_KEY on the server.');
  }

  let rawReply = '';
  let provider = '';

  if (groqOrGrokApiKey) {
    provider = groqOrGrokApiKey.startsWith('gsk_') ? 'GroqCloud' : 'xAI Grok';
    rawReply = groqOrGrokApiKey.startsWith('gsk_')
      ? await callGroqCloud(groqOrGrokApiKey, systemPrompt, userPrompt, temperature).catch(() => '')
      : await callXaiGrok(groqOrGrokApiKey, systemPrompt, userPrompt, temperature).catch(() => '');
  }

  if (!rawReply && geminiApiKey) {
    provider = 'Gemini';
    rawReply = await callGemini(geminiApiKey, systemPrompt, userPrompt, temperature).catch(() => '');
  }

  if (!rawReply) {
    throw new Error('Configured AI providers did not return a usable response.');
  }

  return {
    provider,
    parsed: JSON.parse(normalizeJson(rawReply)),
  };
}

export { generateJsonWithFallback };
