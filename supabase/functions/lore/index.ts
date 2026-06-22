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

interface LoreResponse {
  chapterTitle: string;
  story: string;
  achievementsFramed: Array<{ title: string; description: string }>;
  nextChapterTeaser: string;
  loreRank: string;
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

    const { data: achievements } = await supabase
      .from("achievements")
      .select("achievement_id, unlocked_at")
      .eq("wallet_address", addr)
      .order("unlocked_at", { ascending: true });

    const { data: mastery } = await supabase
      .from("category_mastery")
      .select("*")
      .eq("wallet_address", addr)
      .order("mastery_xp", { ascending: false });

    const { data: sessions } = await supabase
      .from("challenge_sessions")
      .select("*")
      .eq("wallet_address", addr)
      .order("completed_at", { ascending: false })
      .limit(10);

    const userContext = buildLoreContext(
      player,
      achievements ?? [],
      mastery ?? [],
      sessions ?? []
    );
    const prompt = PROMPTS.lore();

    const result = await askGeminiJson<LoreResponse>(
      prompt.system,
      userContext,
      { temperature: 0.85, maxTokens: 3000 }
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
    console.error("lore error:", err);
    return new Response(
      JSON.stringify({ error: String(err), fallback: true }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

function buildLoreContext(
  player: Record<string, unknown>,
  achievements: Array<Record<string, unknown>>,
  mastery: Array<Record<string, unknown>>,
  sessions: Array<Record<string, unknown>>
): string {
  const achivs = achievements.map((a) => {
    const id = a.achievement_id as string;
    const date = new Date(a.unlocked_at as string).toLocaleDateString();
    return `- ${id} (unlocked ${date})`;
  }).join("\n");

  const domains = mastery.map((m) => {
    const cat = m.category_id as string;
    const lvl = (m.mastery_level as number) ?? 0;
    return `- ${cat}: Mastery Level ${lvl}`;
  }).join("\n");

  const battles = sessions.slice(0, 5).map((s) => {
    const cat = s.category_id as string;
    const correct = (s.correct_count as number) ?? 0;
    const total = (s.total_questions as number) ?? 0;
    const isBoss = s.is_boss ? " (Boss Challenge)" : "";
    const isDaily = s.is_daily ? " (Daily Challenge)" : "";
    return `- ${cat}: ${correct}/${total}${isBoss}${isDaily}`;
  }).join("\n");

  return `Nexora Chronicle — Player Profile

Hero: ${player.username}
Title: ${player.rank_tier}
Level: ${player.level}
Total XP: ${player.total_xp}
Streak: ${player.streak_days} days
Accuracy: ${Math.round((player.accuracy_rate as number) * 100)}%
Boss Victories: ${player.boss_wins}

Conquered Domains:
${domains || "No domains conquered yet."}

Legendary Feats (Achievements):
${achivs || "No feats recorded yet."}

Recent Battles:
${battles || "No battles fought yet."}

Weave this player's journey into an epic narrative. They are a knowledge-seeker in the realm of Nexora, where each category is a kingdom and each rank is a title of power.`;
}
