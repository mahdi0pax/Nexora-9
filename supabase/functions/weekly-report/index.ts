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

interface WeeklyReportResponse {
  headline: string;
  summary: string;
  highlights: Array<{ label: string; value: string; context: string }>;
  trends: { direction: string; description: string };
  categoryBreakdown: Array<{ category: string; played: number; accuracy: number; trend: string }>;
  goalsForNextWeek: Array<{ goal: string; reason: string }>;
  shareableText: string;
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

    // Get sessions from the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const { data: weekSessions } = await supabase
      .from("challenge_sessions")
      .select("*")
      .eq("wallet_address", addr)
      .gte("completed_at", weekAgo)
      .order("completed_at", { ascending: false });

    // Get previous week for comparison
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    const { data: prevWeekSessions } = await supabase
      .from("challenge_sessions")
      .select("*")
      .eq("wallet_address", addr)
      .gte("completed_at", twoWeeksAgo)
      .lt("completed_at", weekAgo)
      .order("completed_at", { ascending: false });

    const { data: mastery } = await supabase
      .from("category_mastery")
      .select("*")
      .eq("wallet_address", addr);

    const { data: achievements } = await supabase
      .from("achievements")
      .select("achievement_id, unlocked_at")
      .eq("wallet_address", addr)
      .gte("unlocked_at", weekAgo);

    const userContext = buildWeeklyContext(
      player,
      weekSessions ?? [],
      prevWeekSessions ?? [],
      mastery ?? [],
      achievements ?? []
    );
    const prompt = PROMPTS.weeklyReport();

    const result = await askGeminiJson<WeeklyReportResponse>(
      prompt.system,
      userContext,
      { temperature: 0.75, maxTokens: 2500 }
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
    console.error("weekly-report error:", err);
    return new Response(
      JSON.stringify({ error: String(err), fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function buildWeeklyContext(
  player: Record<string, unknown>,
  weekSessions: Array<Record<string, unknown>>,
  prevWeekSessions: Array<Record<string, unknown>>,
  mastery: Array<Record<string, unknown>>,
  achievements: Array<Record<string, unknown>>
): string {
  const thisWeekCorrect = weekSessions.reduce((s, sess) => s + ((sess.correct_count as number) ?? 0), 0);
  const thisWeekTotal = weekSessions.reduce((s, sess) => s + ((sess.total_questions as number) ?? 0), 0);
  const thisWeekScore = weekSessions.reduce((s, sess) => s + ((sess.score as number) ?? 0), 0);
  const thisWeekAcc = thisWeekTotal > 0 ? Math.round((thisWeekCorrect / thisWeekTotal) * 100) : 0;

  const prevWeekCorrect = prevWeekSessions.reduce((s, sess) => s + ((sess.correct_count as number) ?? 0), 0);
  const prevWeekTotal = prevWeekSessions.reduce((s, sess) => s + ((sess.total_questions as number) ?? 0), 0);
  const prevWeekScore = prevWeekSessions.reduce((s, sess) => s + ((sess.score as number) ?? 0), 0);
  const prevWeekAcc = prevWeekTotal > 0 ? Math.round((prevWeekCorrect / prevWeekTotal) * 100) : 0;

  const catBreakdown = weekSessions.reduce<Record<string, { played: number; correct: number; total: number }>>((acc, sess) => {
    const cat = sess.category_id as string;
    if (!acc[cat]) acc[cat] = { played: 0, correct: 0, total: 0 };
    acc[cat].played += 1;
    acc[cat].correct += (sess.correct_count as number) ?? 0;
    acc[cat].total += (sess.total_questions as number) ?? 0;
    return acc;
  }, {});

  const catLines = Object.entries(catBreakdown).map(([cat, stats]) => {
    const acc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return `- ${cat}: ${stats.played} sessions, ${acc}% accuracy`;
  }).join("\n");

  const achLines = achievements.map((a) => `- ${a.achievement_id} (${a.unlocked_at})`).join("\n");

  return `Player: ${player.username} (Level ${player.level}, ${player.rank_tier})

THIS WEEK (last 7 days):
- Sessions: ${weekSessions.length}
- Total questions: ${thisWeekTotal}
- Correct: ${thisWeekCorrect}
- Accuracy: ${thisWeekAcc}%
- XP earned: ${thisWeekScore}

PREVIOUS WEEK (comparison):
- Sessions: ${prevWeekSessions.length}
- Total questions: ${prevWeekTotal}
- Correct: ${prevWeekCorrect}
- Accuracy: ${prevWeekAcc}%
- XP earned: ${prevWeekScore}

Category Breakdown This Week:
${catLines || "No sessions this week."}

Achievements This Week:
${achLines || "No new achievements."}

Generate a weekly report.`;
}
