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

interface MentorResponse {
  overallAssessment: string;
  strengths: Array<{ category: string; description: string; score: number }>;
  weaknesses: Array<{ category: string; description: string; score: number }>;
  learningPath: Array<{ step: number; action: string; reason: string }>;
  practiceTips: string[];
  motivation: string;
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

    const { data: mastery } = await supabase
      .from("category_mastery")
      .select("*")
      .eq("wallet_address", addr);

    const { data: sessions } = await supabase
      .from("challenge_sessions")
      .select("*")
      .eq("wallet_address", addr)
      .order("completed_at", { ascending: false })
      .limit(20);

    const { data: achievements } = await supabase
      .from("achievements")
      .select("achievement_id, unlocked_at")
      .eq("wallet_address", addr);

    const userContext = buildMentorContext(
      player,
      mastery ?? [],
      sessions ?? [],
      achievements ?? []
    );
    const prompt = PROMPTS.mentor();

    const result = await askGeminiJson<MentorResponse>(
      prompt.system,
      userContext,
      { temperature: 0.65, maxTokens: 2500 }
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
    console.error("mentor error:", err);
    return new Response(
      JSON.stringify({ error: String(err), fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function buildMentorContext(
  player: Record<string, unknown>,
  mastery: Array<Record<string, unknown>>,
  sessions: Array<Record<string, unknown>>,
  achievements: Array<Record<string, unknown>>
): string {
  const cats = mastery.map((m) => {
    const lvl = (m.mastery_level as number) ?? 0;
    const xp = (m.mastery_xp as number) ?? 0;
    const answered = (m.total_answered as number) ?? 0;
    const correct = (m.total_correct as number) ?? 0;
    const acc = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return `- ${m.category_id}: Mastery ${lvl}, ${xp} XP, ${acc}% accuracy (${correct}/${answered})`;
  }).join("\n");

  const recent = sessions.slice(0, 10).map((s) => {
    const cat = s.category_id as string;
    const score = (s.score as number) ?? 0;
    const correct = (s.correct_count as number) ?? 0;
    const total = (s.total_questions as number) ?? 0;
    const diff = s.difficulty as string;
    return `- ${cat} (${diff}): ${correct}/${total} correct, ${score} XP`;
  }).join("\n");

  const achivs = achievements.map((a) => `- ${a.achievement_id}: ${a.unlocked_at}`).join("\n");

  return `Player Profile:
- Username: ${player.username}
- Level: ${player.level}, Total XP: ${player.total_xp}
- Rank: ${player.rank_tier}, Rank Score: ${player.rank_score}
- Streak: ${player.streak_days} days
- Accuracy: ${Math.round((player.accuracy_rate as number) * 100)}%
- Total Correct: ${player.total_correct} / ${player.total_answered}
- Boss Wins: ${player.boss_wins}

Category Mastery:
${cats || "No mastery data yet."}

Recent Sessions (last 10):
${recent || "No recent sessions."}

Achievements Unlocked:
${achivs || "No achievements yet."}

Analyze this player's strengths and weaknesses. What learning path would you recommend?`;
}
