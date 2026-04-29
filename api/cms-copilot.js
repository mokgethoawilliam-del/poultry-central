import { createClient } from '@supabase/supabase-js';
import { generateJsonWithFallback } from './_aiProvider.js';

const buildSystemPrompt = () => `
You are a website CMS copy copilot for a poultry farm SaaS.
Return only valid JSON with these fields:
- site_title
- hero_headline
- hero_subtitle
- why_content
- about_story
- hero_image_prompt
- about_image_prompt
- gallery_image_prompt

Rules:
- Keep the voice practical, warm, and business-ready.
- Do not invent fake certifications, awards, or claims.
- Write for a South African poultry/farm audience when relevant.
- Make the copy sound usable on a real public website, not like marketing fluff.
- Keep hero_headline under 12 words.
- Keep site_title under 10 words.
- Keep why_content under 24 words.
- Keep hero_subtitle under 40 words.
- Keep about_story under 95 words.
- Keep each image prompt under 45 words.
- Image prompts should describe real, photographable poultry business scenes.
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
    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ error: 'A prompt is required.' });
    }
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

    const userPrompt = `
Business context:
- Farm name: ${farm?.name || 'Unknown farm'}
- Current site title: ${farm?.site_title || 'Not set'}
- Current hero headline: ${farm?.hero_headline || 'Not set'}
- Current hero subtitle: ${farm?.hero_subtitle || 'Not set'}
- Current why content: ${farm?.why_content || 'Not set'}
- Current about story: ${farm?.about_story || 'Not set'}
- Address: ${farm?.address || 'Not set'}
- Operating hours: ${farm?.operating_hours || 'Not set'}

Task:
${String(prompt).trim()}

    Also suggest:
- one hero image prompt
- one about-section image prompt
- one gallery image prompt
`.trim();

    const { parsed, provider } = await generateJsonWithFallback({
      systemPrompt: buildSystemPrompt(),
      userPrompt,
      temperature: 0.8,
      aiKeys,
    });

    return res.status(200).json({
      provider,
      draft: {
        site_title: parsed.site_title || '',
        hero_headline: parsed.hero_headline || '',
        hero_subtitle: parsed.hero_subtitle || '',
        why_content: parsed.why_content || '',
        about_story: parsed.about_story || '',
        hero_image_prompt: parsed.hero_image_prompt || '',
        about_image_prompt: parsed.about_image_prompt || '',
        gallery_image_prompt: parsed.gallery_image_prompt || '',
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error?.message || 'Unexpected CMS copilot error.',
    });
  }
}
