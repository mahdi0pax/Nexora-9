import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import { askGeminiJson, PROMPTS } from "../_shared/ai.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OracleResponse {
  recommendation: string;
  priorityCategory: string;
  priorityReason: string;
  expectedImpact: string;
  confidence: number;
  tips: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { walletAddress } = await req.json();
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: "walletAddress required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const addr = walletAddress.toLowerCase();

    // Fetch player data
    const { data: player } = await supabase
      .from("players")
      .select("*")
      .eq("wallet_address", addr)
      .maybeSingle();

    if (!player) {
      return new Response(
        JSON.stringify({ error: "Player not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch mastery data
    const { data: mastery } = await supabase
      .from("category_mastery")
      .select("*")
      .eq("wallet_address", addr);

    // Fetch recent sessions
    const { data: sessions } = await supabase
      .from("challenge_sessions")
      .select("*")
      .eq("wallet_address", addr)
      .order("completed_at", { ascending: false })
      .limit(15);

    // Build context for Gemini
    const userContext = buildOracleContext(player, mastery ?? [], sessions ?? []);
    const prompt = PROMPTS.oracle();

    const result = await askGeminiJson<OracleResponse>(
      prompt.system,
      userContext,
      { temperature: 0.7, maxTokens: 1200 }
    );

    if (!result) {
      return new Response(
        JSON.stringify({ error: "AI service unavailable", fallback: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("oracle error:", err);
    return new Response(
      JSON.stringify({ error: String(err), fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function buildOracleContext(
  player: Record<string, unknown>,
  mastery: Array<Record<string, unknown>>,
  sessions: Array<Record<string, unknown>>
): string {
  const cats = mastery.map((m) => {
    const lvl = (m.mastery_level as number) ?? 0;
    const xp = (m.mastery_xp as number) ?? 0;
    const answered = (m.total_answered as number) ?? 0;
    const correct = (m.total_correct as number) ?? 0;
    const acc = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return `- ${m.category_id}: Mastery ${lvl}, ${xp} XP, ${acc}% accuracy (${correct}/${answered})`;
  }).join("\n");

  const recent = sessions.slice(0, 5).map((s) => {
    const cat = s.category_id as string;
    const score = (s.score as number) ?? 0;
    const correct = (s.correct_count as number) ?? 0;
    const total = (s.total_questions as number) ?? 0;
    return `- ${cat}: ${correct}/${total} correct, ${score} XP`;
  }).join("\n");

  return `Player Data:
- Username: ${player.username}
- Level: ${player.level}, Total XP: ${player.total_xp}
- Rank: ${player.rank_tier}, Rank Score: ${player.rank_score}
- Streak: ${player.streak_days} days
- Accuracy: ${Math.round((player.accuracy_rate as number) * 100)}%
- Boss Wins: ${player.boss_wins}

Category Mastery:
${cats || "No mastery data yet."}

Recent Sessions (last 5):
${recent || "No recent sessions."}

Based on this data, what should this player practice next?`;
}
