import { readFileSync, existsSync } from 'node:fs';
import { detectLanguage } from '../i18n.js';

/**
 * Determine the target language for translation.
 * Priority: explicit `to` param > prefs file lang > system locale.
 * @param {string} prefsFile - Path to the preferences JSON file
 * @returns {string} target language code
 */
export function detectTargetLang(prefsFile) {
  let targetLang;
  try {
    if (prefsFile && existsSync(prefsFile)) {
      const prefs = JSON.parse(readFileSync(prefsFile, 'utf-8'));
      if (prefs.lang) targetLang = prefs.lang;
    }
  } catch { }
  if (!targetLang) targetLang = detectLanguage();
  return targetLang;
}

/**
 * Translate text using the Claude API.
 * @param {Object} opts
 * @param {string|string[]} opts.text - Text or array of texts to translate
 * @param {string} opts.from - Source language code
 * @param {string} opts.to - Target language code
 * @param {string} opts.apiKey - Anthropic API key
 * @param {string} [opts.baseUrl='https://api.anthropic.com'] - API base URL
 * @param {string} [opts.model='claude-haiku-4-5-20251001'] - Model to use
 * @returns {Promise<{text: string|string[], from: string, to: string}>}
 */
export async function translate({ text, from, to, apiKey, baseUrl, model }) {
  // Same language — no-op
  if (from === to) {
    return { text, from, to };
  }

  const effectiveBaseUrl = baseUrl || 'https://api.anthropic.com';
  const effectiveModel = model || 'claude-haiku-4-5-20251001';
  const inputText = Array.isArray(text) ? text.join('\n---SPLIT---\n') : text;

  const reqHeaders = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'x-api-key': apiKey,
    'x-cc-viewer-internal': '1',
  };

  const apiRes = await fetch(`${effectiveBaseUrl}/v1/messages`, {
    method: 'POST',
    headers: reqHeaders,
    body: JSON.stringify({
      model: effectiveModel,
      max_tokens: 32000,
      tools: [],
      system: [{
        type: "text",
        text: `You are a translator. Translate the following text from ${from} to ${to}. Output only the translated text, nothing else.`
      }],
      messages: [{ role: 'user', content: inputText }],
      stream: false,
      temperature: 1,
    }),
  });

  if (!apiRes.ok) {
    const errBody = await apiRes.text();
    const err = new Error(`Translation API failed (status ${apiRes.status}): ${errBody}`);
    err.status = apiRes.status;
    err.detail = errBody;
    throw err;
  }

  const apiData = await apiRes.json();
  let translated = apiData.content?.[0]?.text || '';

  // If input was an array, split the result back into an array
  if (Array.isArray(text)) {
    translated = translated.split(/\n?---SPLIT---\n?/);
  }

  return { text: translated, from, to };
}
