import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { askGeminiJson, PROMPTS, validateQuestions } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CATEGORY_LABELS: Record<string, string> = {
  science:     "Science (physics, chemistry, biology, astronomy)",
  history:     "History (world events, civilizations, politics)",
  technology:  "Technology (software, hardware, computer science, AI)",
  mathematics: "Mathematics (algebra, calculus, geometry, logic)",
  literature:  "Literature (classic works, authors, narrative craft)",
  geography:   "Geography (countries, capitals, terrain, cultures)",
  logic:       "Logic & Reasoning (puzzles, syllogisms, sequences)",
  crypto_web3: "Crypto & Web3 (blockchain, DeFi, protocols, cryptography)",
};

const DIFFICULTY_MAP: Record<number, string> = {
  1: "easy", 2: "easy", 3: "easy",
  4: "medium", 5: "medium", 6: "medium",
  7: "hard", 8: "hard",
  9: "very_hard", 10: "very_hard",
};

function levelToDifficulty(level: number): string {
  const clamped = Math.max(1, Math.min(10, Math.floor(level / 5) + 1));
  return DIFFICULTY_MAP[clamped] ?? "medium";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { categoryId, level = 1, count = 5 } = await req.json();

    if (!categoryId || !CATEGORY_LABELS[categoryId]) {
      return new Response(
        JSON.stringify({ error: "Invalid categoryId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const difficulty = levelToDifficulty(level);
    const categoryLabel = CATEGORY_LABELS[categoryId];
    const safeCount = Math.min(10, Math.max(1, Number(count)));

    const prompt = PROMPTS.questionGen(categoryLabel, difficulty, safeCount);
    const data = await askGeminiJson<{ questions: Array<Record<string, unknown>> }>(
      prompt.system,
      prompt.user,
      { temperature: 0.8, maxTokens: 2500 }
    );

    if (!data || !data.questions || data.questions.length === 0) {
      return new Response(
        JSON.stringify({ questions: [], fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const valid = validateQuestions(data.questions);

    return new Response(
      JSON.stringify({ questions: valid }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("generate-question error:", err);
    return new Response(
      JSON.stringify({ questions: [], fallback: true, error: String(err) }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
