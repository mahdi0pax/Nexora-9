/**
 * Nexora AI Service — Centralized Google Gemini client
 * All AI-powered features route through this module.
 * Reads GEMINI_API_KEY from server-side env only.
 */

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

export interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
    finishReason: string;
  }[];
}

/**
 * Call Gemini with a system prompt and user content.
 * Returns the text response or null on failure.
 */
export async function askGemini(
  systemPrompt: string,
  userContent: string,
  opts?: { temperature?: number; maxTokens?: number; jsonMode?: boolean }
): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    console.error("[AI] GEMINI_API_KEY not configured");
    return null;
  }

  const model = "gemini-2.0-flash";
  const url = `${GEMINI_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const body: Record<string, unknown> = {
    contents: [
      {
        role: "user",
        parts: [
          { text: `${systemPrompt}\n\n${userContent}` },
        ],
      },
    ],
    generationConfig: {
      temperature: opts?.temperature ?? 0.7,
      maxOutputTokens: opts?.maxTokens ?? 2048,
      responseMimeType: opts?.jsonMode ? "application/json" : "text/plain",
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AI] Gemini HTTP ${res.status}:`, errText);
      return null;
    }

    const data = (await res.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ?? null;
  } catch (err) {
    console.error("[AI] Gemini request failed:", err);
    return null;
  }
}

/**
 * Call Gemini and parse the response as JSON.
 */
export async function askGeminiJson<T>(
  systemPrompt: string,
  userContent: string,
  opts?: { temperature?: number; maxTokens?: number }
): Promise<T | null> {
  const text = await askGemini(systemPrompt, userContent, {
    ...opts,
    jsonMode: true,
  });
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try to extract JSON from markdown code block
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ── Prompt Templates ──────────────────────────────────────────────────────

export const PROMPTS = {
  questionGen: (category: string, difficulty: string, count: number) => ({
    system: `You are an expert quiz question writer for Nexora, a competitive knowledge platform.
Generate exactly ${count} multiple-choice questions.
Difficulty: ${difficulty}.

Rules:
- Each question must have exactly 4 answer options.
- Exactly one option must be correct (0-based index).
- Wrong answers must be plausible.
- For "easy": straightforward factual questions.
- For "medium": require deeper knowledge or reasoning.
- For "hard": specialist knowledge, nuance, or multi-step reasoning.
- For "very_hard": expert-level, edge cases, surprising facts.
- Vary question style: factual, conceptual, applied, comparative.
- Never repeat questions across the set.
- Provide a concise 1–2 sentence explanation.

Respond ONLY with valid JSON matching this schema:
{
  "questions": [
    {
      "text": "string",
      "options": ["string", "string", "string", "string"],
      "correct": 0,
      "explanation": "string",
      "difficulty": "string"
    }
  ]
}`,
    user: `Generate ${count} ${difficulty} questions for: ${category}`,
  }),

  oracle: () => ({
    system: `You are the Nexora Oracle — a wise, strategic AI advisor for a competitive knowledge platform.
Analyze the player's data and recommend what to practice next.
Be concise, actionable, and encouraging. Use game terminology (XP, rank, streak, categories).

Respond ONLY with valid JSON matching this schema:
{
  "recommendation": "string — the main advice (2-3 sentences)",
  "priorityCategory": "string — which category to focus on",
  "priorityReason": "string — why this category",
  "expectedImpact": "string — what the player will gain",
  "confidence": "number 0-1",
  "tips": ["string", "string"]
}`,
    user: "", // filled at call time
  }),

  mentor: () => ({
    system: `You are the Nexora AI Mentor — a personalized learning coach.
Analyze the player's strengths and weaknesses across knowledge domains.
Be supportive but honest. Provide specific, actionable advice.

Respond ONLY with valid JSON matching this schema:
{
  "overallAssessment": "string — 2-3 sentence summary",
  "strengths": [
    { "category": "string", "description": "string", "score": "number 0-100" }
  ],
  "weaknesses": [
    { "category": "string", "description": "string", "score": "number 0-100" }
  ],
  "learningPath": [
    { "step": "number", "action": "string", "reason": "string" }
  ],
  "practiceTips": ["string", "string", "string"],
  "motivation": "string — encouraging closing message"
}`,
    user: "", // filled at call time
  }),

  weeklyReport: () => ({
    system: `You are the Nexora Weekly AI Report generator.
Analyze a player's week-over-week performance and produce a shareable summary.
Tone: energetic, competitive, encouraging. Use emojis sparingly.

Respond ONLY with valid JSON matching this schema:
{
  "headline": "string — catchy headline summarizing the week",
  "summary": "string — 2-3 sentence overview",
  "highlights": [
    { "label": "string", "value": "string", "context": "string" }
  ],
  "trends": {
    "direction": "improving | stable | declining",
    "description": "string"
  },
  "categoryBreakdown": [
    { "category": "string", "played": "number", "accuracy": "number", "trend": "up | down | flat" }
  ],
  "goalsForNextWeek": [
    { "goal": "string", "reason": "string" }
  ],
  "shareableText": "string — a short social-media-ready summary"
}`,
    user: "", // filled at call time
  }),

  lore: () => ({
    system: `You are the Nexora Lorekeeper — a storyteller who weaves the player's journey into an epic narrative.
The Nexora universe: a realm where knowledge is power, ranks are titles of nobility, and categories are kingdoms to conquer.
Tone: epic fantasy, dramatic, immersive. Write in second person ("you").

Respond ONLY with valid JSON matching this schema:
{
  "chapterTitle": "string — dramatic chapter name",
  "story": "string — 3-4 paragraphs of narrative prose",
  "achievementsFramed": [
    { "title": "string", "description": "string" }
  ],
  "nextChapterTeaser": "string — hint at what's coming",
  "loreRank": "string — the player's title in the lore (e.g., 'Apprentice of the Bronze Order')"
}`,
    user: "", // filled at call time
  }),
} as const;

// ── Validation Helpers ────────────────────────────────────────────────────

export function validateQuestions(questions: unknown[]): Array<Record<string, unknown>> {
  return questions.filter((q: unknown) => {
    if (typeof q !== "object" || q === null) return false;
    const question = q as Record<string, unknown>;
    return (
      typeof question.text === "string" &&
      Array.isArray(question.options) &&
      question.options.length === 4 &&
      typeof question.correct === "number" &&
      question.correct >= 0 &&
      question.correct <= 3 &&
      typeof question.explanation === "string"
    );
  });
}
