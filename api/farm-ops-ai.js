const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

const buildSystemPrompt = () => `
You are an operations AI manager for a multi-tenant poultry farm SaaS.
Return only valid JSON with these fields:
- headline
- summary
- risks
- actions

Rules:
- Keep the advice grounded in the snapshot provided.
- Do not invent missing operational data.
- Make the tone practical, calm, and manager-ready.
- Keep headline under 12 words.
- Keep summary under 90 words.
- risks must be an array of 2 to 4 short strings.
- actions must be an array of 3 to 5 concrete, prioritized action strings.
- Focus on orders, inventory pressure, customer demand, product availability, and near-term operational decisions.
`.trim();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  try {
    const { prompt, farm } = req.body || {};
    const cleanPrompt = String(prompt || '').trim() || 'What should I focus on today?';

    const userPrompt = `
Farm operations snapshot:
- Farm name: ${farm?.name || 'Unknown farm'}
- Site strapline: ${farm?.site_title || 'Not set'}
- Orders today: ${farm?.today_orders ?? 0}
- Pending orders: ${farm?.pending_orders ?? 0}
- Low stock items: ${farm?.low_stock ?? 0}
- Weekly revenue: ${farm?.total_revenue ?? 0}
- Inventory items tracked: ${farm?.inventory_count ?? 0}
- Active products: ${farm?.active_products ?? 0}
- Farm services count: ${farm?.services_count ?? 0}
- Customers count: ${farm?.customers_count ?? 0}

Recent orders:
${JSON.stringify(farm?.recent_orders || [], null, 2)}

Inventory snapshot:
${JSON.stringify(farm?.inventory_snapshot || [], null, 2)}

Task:
${cleanPrompt}
`.trim();

    const response = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        error: payload?.error?.message || 'The AI provider could not generate operations guidance right now.',
      });
    }

    const rawContent = payload?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return res.status(500).json({ error: 'The AI provider returned an empty operations brief.' });
    }

    const parsed = JSON.parse(rawContent);

    return res.status(200).json({
      result: {
        headline: parsed.headline || '',
        summary: parsed.summary || '',
        risks: Array.isArray(parsed.risks) ? parsed.risks.filter(Boolean).slice(0, 4) : [],
        actions: Array.isArray(parsed.actions) ? parsed.actions.filter(Boolean).slice(0, 5) : [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Unexpected operations AI error.',
    });
  }
}
