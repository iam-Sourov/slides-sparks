export interface AIConfig {
  provider: 'gemini' | 'openai' | 'claude';
  apiKey: string;
  model: string;
  customBaseUrl?: string;
}

export const PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-2.6-flash',
    models: [
      { id: 'gemini-2.6-flash', name: 'Gemini 2.6 Flash (Fast, Recommended)' },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview (High Quality)' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }
    ]
  },
  openai: {
    name: 'OpenAI',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o (High Quality)' },
      { id: 'gpt-4o-mini', name: 'GPT-4o-mini (Fast)' }
    ]
  },
  claude: {
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-5-sonnet-latest',
    models: [
      { id: 'claude-3-5-sonnet-latest', name: 'Claude 3.5 Sonnet (Recommended)' },
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (v2)' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus (Premium)' }
    ]
  }
};

const getCreateSystemPrompt = () => `
You are an expert presentation designer and frontend engineer.
Your task is to generate a single slide of beautiful, modern, raw HTML/CSS code.

Strict Output Rules:
1. You MUST output ONLY a valid JSON object matching this schema:
   {
     "html": "YOUR_HTML_AND_STYLE_CODE"
   }
   Do NOT wrap the JSON inside markdown code block syntax (like \`\`\`json). The response must be raw JSON parseable.
2. The HTML code must contain a style block (\`<style>\`) and a main wrapper \`<div class=\"slide-container\">\`.
3. The \`.slide-container\` MUST be styled to have a width of exactly 1280px and height of exactly 720px (a 16:9 widescreen presentation ratio).
4. Utilize modern, premium, state-of-the-art styling. Use Tailwind CSS classes for layout, typography, and standard elements. Use the style block for custom gradients, keyframes, backdrop-filters, custom grids, and complex layout offsets.
5. Colors & Aesthetics: Avoid generic colors. Use beautiful, curated, harmonious palettes (e.g., deep slate slate-900, indigo slate-950, emerald slates, or rich cream light slates). Apply soft background gradients, subtle glowing borders, modern glassmorphism (backdrop-blur), and elegant drop-shadows.
6. Typography: Use premium Google Fonts. You can include Google Font links at the top of the HTML (e.g. \`<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet" />\`). Apply responsive font sizes, solid line heights, and letter-spacing (tracking).
7. Graphics & Icons: You can use Lucide icons or FontAwesome (v6) icons.
   - For FontAwesome, include: \`<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>\` and use \`<i class="fa-solid fa-icon-name"></i>\`.
   - For Lucide icons, use HTML elements with data attributes: \`<i data-lucide="icon-name" class="w-6 h-6 text-indigo-400"></i>\` (no link stylesheet required).
8. Slide Layout:
   - Avoid generic boring bullets!
   - Use dynamic layout cards, asymmetric split grids, metric callouts, step-by-step timelines, process pipelines, or clean tables.
   - Always ensure elements have adequate padding, breathing room, and visual hierarchy.
9. DO NOT repeat, print, or embed the user's prompt text, instruction metadata, or any prompt/system instructions as visible text inside the generated slide HTML. The slide must contain only the final presentation slide content.
`;

const getEditSystemPrompt = (currentSlideCode: string) => `
You are an expert presentation designer and frontend engineer.
Your task is to modify the existing slide HTML/CSS code provided below, according to the user's instructions.

Existing Slide Code:
${currentSlideCode}

Strict Output Rules:
1. You MUST output ONLY a valid JSON object matching this schema:
   {
     "html": "YOUR_UPDATED_HTML_AND_STYLE_CODE"
   }
   Do NOT wrap the JSON inside markdown code block syntax (like \`\`\`json). The response must be raw JSON parseable.
2. The modified HTML code must keep the style block (\`<style>\`) and the main wrapper \`<div class=\"slide-container\">\`, keeping the width exactly 1280px and height exactly 720px.
3. Edit only what is requested, while preserving the overall design, structural integrity, and editable elements of the existing slide.
4. If the user asks to change the theme, colors, font sizes, copy text, layout columns, or icons, make those changes while keeping Tailwind CSS and standard tags clean.
5. If you introduce new styles, add them correctly in the \`<style>\` block. If you use new icons, follow the FontAwesome/Lucide formatting as before.
6. Return the fully updated HTML slide code inside the "html" property of the JSON object.
7. DO NOT repeat, print, or embed the user's prompt text, instruction metadata, or any prompt/system instructions as visible text inside the generated slide HTML. The slide must contain only the final presentation slide content.
`;

export const generateOrEditSlide = async (
  prompt: string,
  mode: 'create' | 'edit',
  currentSlideCode: string | undefined,
  config: AIConfig
): Promise<string> => {
  const { provider, apiKey, model, customBaseUrl } = config;
  if (!apiKey) {
    throw new Error('API Key is required for slide generation.');
  }

  const systemPrompt = mode === 'edit' && currentSlideCode 
    ? getEditSystemPrompt(currentSlideCode) 
    : getCreateSystemPrompt();

  let responseText = '';

  try {
    if (provider === 'gemini') {
      const baseUrl = customBaseUrl || 'https://generativelanguage.googleapis.com';
      const url = `${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `User request: ${prompt}` }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                html: { type: 'STRING' }
              },
              required: ['html']
            }
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (provider === 'openai') {
      const baseUrl = customBaseUrl || 'https://api.openai.com';
      const url = `${baseUrl}/v1/chat/completions`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API returned status ${response.status}`);
      }

      const data = await response.json();
      responseText = data.choices?.[0]?.message?.content || '';
    } else if (provider === 'claude') {
      const baseUrl = customBaseUrl || 'https://api.anthropic.com';
      const url = `${baseUrl}/v1/messages`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: `Please fulfill this request: ${prompt}. Output only raw JSON.` }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Claude API returned status ${response.status}`);
      }

      const data = await response.json();
      responseText = data.content?.[0]?.text || '';
    }

    let jsonText = responseText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);
    if (!parsed.html) {
      throw new Error("API response JSON did not contain 'html' property.");
    }
    return parsed.html;
  } catch (error: any) {
    console.error('AI slide generation failed:', error);
    throw new Error(error.message || 'An error occurred during slide generation.');
  }
};

export const fetchAvailableModels = async (config: {
  provider: 'gemini' | 'openai' | 'claude';
  apiKey: string;
  customBaseUrl?: string;
}): Promise<{ id: string; name: string }[]> => {
  const { provider, apiKey, customBaseUrl } = config;
  if (!apiKey) return [];

  try {
    if (provider === 'gemini') {
      const baseUrl = customBaseUrl || 'https://generativelanguage.googleapis.com';
      const response = await fetch(`${baseUrl}/v1beta/models?key=${apiKey}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
      }
      const data = await response.json();
      const models = (data.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent') && m.name?.startsWith('models/'))
        .map((m: any) => {
          const cleanId = m.name.replace('models/', '');
          return { id: cleanId, name: m.displayName || cleanId };
        });
      return models.length > 0 ? models : PROVIDERS.gemini.models;
    } else if (provider === 'openai') {
      const baseUrl = customBaseUrl || 'https://api.openai.com';
      const response = await fetch(`${baseUrl}/v1/models`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API returned status ${response.status}`);
      }
      const data = await response.json();
      const models = (data.data || [])
        .filter((m: any) => m.id?.startsWith('gpt-') || m.id?.startsWith('o1-') || m.id?.startsWith('o3-'))
        .map((m: any) => ({ id: m.id, name: m.id }));
      return models.length > 0 ? models : PROVIDERS.openai.models;
    } else if (provider === 'claude') {
      const baseUrl = customBaseUrl || 'https://api.anthropic.com';
      const response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Claude API returned status ${response.status}`);
      }
      const data = await response.json();
      const models = (data.data || []).map((m: any) => ({
        id: m.id,
        name: m.displayName || m.id
      }));
      return models.length > 0 ? models : PROVIDERS.claude.models;
    }
  } catch (error: any) {
    console.warn(`Failed to fetch models for ${provider}:`, error);
    return PROVIDERS[provider].models;
  }
  return [];
};

export const testModelConnection = async (config: AIConfig): Promise<boolean> => {
  const { provider, apiKey, model, customBaseUrl } = config;
  if (!apiKey) {
    throw new Error('API Key is required to test the connection.');
  }

  try {
    if (provider === 'gemini') {
      const baseUrl = customBaseUrl || 'https://generativelanguage.googleapis.com';
      const response = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Respond with the single word 'OK'." }] }],
          generationConfig: { maxOutputTokens: 5 }
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
      }
    } else if (provider === 'openai') {
      const baseUrl = customBaseUrl || 'https://api.openai.com';
      const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: "Respond with the single word 'OK'." }],
          max_tokens: 5
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OpenAI API returned status ${response.status}`);
      }
    } else if (provider === 'claude') {
      const baseUrl = customBaseUrl || 'https://api.anthropic.com';
      const response = await fetch(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 5,
          messages: [{ role: 'user', content: "Respond with the single word 'OK'." }]
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Claude API returned status ${response.status}`);
      }
    }
    return true;
  } catch (error: any) {
    console.error('API connection test failed:', error);
    throw new Error(error.message || 'Connection test failed. Check settings and CORS policy.');
  }
};
