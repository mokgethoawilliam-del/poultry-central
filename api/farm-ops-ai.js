import { createClient } from '@supabase/supabase-js';
import { generateJsonWithFallback } from './_aiProvider.js';

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

  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header.' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Supabase server environment is not configured.' });
    }

    const authedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      data: { user },
      error: userError,
    } = await authedSupabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { prompt, farm, farmId } = req.body || {};
    if (!farmId) {
      return res.status(400).json({ error: 'A farmId is required.' });
    }

    const { data: ownedFarm, error: farmError } = await adminSupabase
      .from('farms')
      .select('id, owner_id, business_config')
      .eq('id', farmId)
      .single();

    if (farmError || !ownedFarm) {
      return res.status(404).json({ error: 'Farm not found.' });
    }

    if (ownedFarm.owner_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden.' });
    }

    const aiKeys = ownedFarm.business_config?.ai_keys || {};
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

    const { parsed, provider } = await generateJsonWithFallback({
      systemPrompt: buildSystemPrompt(),
      userPrompt,
      temperature: 0.4,
      aiKeys,
    });

    return res.status(200).json({
      provider,
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
