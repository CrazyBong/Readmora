/**
 * AI Service — OpenRouter API wrapper for book summaries.
 * Provides access to multiple free LLMs (Gemini, Llama, etc.) via a unified interface.
 * Only called server-side from /api/ai/summary route.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Using openrouter/auto to let the engine find the best working free model
const DEFAULT_MODEL = 'openrouter/auto';

const GEMINI_PROMPT = (title: string, author: string) =>
  `
You are a literary analyst. Provide a structured book summary and analysis for "${title}" by "${author}". Include:
1. A brief non-spoiler plot overview (3-4 sentences)
2. Core themes
3. Writing style and tone
4. Who would love this book (reader profile)
5. One memorable quote (publicly available, no copyright concern)

Do NOT reproduce any significant portion of the book text. Format your response in clean markdown.
`.trim();

export interface GeminiSummaryResult {
  summary_markdown: string;
  model_version: string;
}

export async function generateBookSummary(
  title: string,
  author: string
): Promise<GeminiSummaryResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000); // Increased timeout for OpenRouter

  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://readmora.com',
        'X-Title': 'Readmora',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: GEMINI_PROMPT(title, author) }],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown OpenRouter error');
      console.error(`AI_SERVICE_ERROR [${res.status}]:`, errText);
      throw new Error(`OpenRouter API error ${res.status}: ${errText}`);
    }

    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? '';

    if (!text) {
      throw new Error('OpenRouter returned an empty response');
    }

    return {
      summary_markdown: text,
      model_version: json.model || DEFAULT_MODEL,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns the ISO date of the Monday that starts the current UTC week.
 */
export function getISOWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().split('T')[0] ?? '';
}

/**
 * Returns the ISO date of the NEXT Monday (when rate limit resets).
 */
export function getNextWeekStart(date: Date = new Date()): string {
  const weekStart = new Date(getISOWeekStart(date));
  weekStart.setUTCDate(weekStart.getUTCDate() + 7);
  return weekStart.toISOString().split('T')[0] ?? '';
}
