const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
  }

  try {
    const { prompt, farm } = req.body || {};
    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({ error: 'A prompt is required.' });
    }

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

    const response = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        temperature: 0.8,
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
        error: payload?.error?.message || 'The AI provider could not generate storefront copy right now.',
      });
    }

    const rawContent = payload?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return res.status(500).json({ error: 'The AI provider returned an empty draft.' });
    }

    const parsed = JSON.parse(rawContent);

    return res.status(200).json({
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
