import Link from "next/link";

interface LeaderboardEntry {
  id: string;
  rank: number;
  team_name: string;
  total_score: number;
  total_time_s: number;
  player_count: number;
  total_hints_used: number;
}

async function getLeaderboard(gameId: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: game } = await client
    .from("games")
    .select("title")
    .eq("id", gameId)
    .single();

  const { data: entries } = await client
    .from("leaderboard")
    .select("*")
    .eq("game_id", gameId)
    .order("rank", { ascending: true })
    .limit(50);

  return { game, entries: (entries ?? []) as LeaderboardEntry[] };
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default async function LeaderboardPage({
  params,
}: {
  params: { gameId: string };
}) {
  const { game, entries } = await getLeaderboard(params.gameId);

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="text-indigo-400 text-sm mb-4 inline-block">
        ← Home
      </Link>

      <h1 className="text-2xl font-bold mb-1">Classifica</h1>
      <p className="text-gray-400 mb-6">{game?.title}</p>

      {entries.length === 0 ? (
        <p className="text-gray-500">Nessun risultato ancora.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry: LeaderboardEntry) => (
            <div
              key={entry.id}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg ${
                entry.rank <= 3 ? "bg-indigo-900/30" : "bg-gray-800"
              }`}
            >
              <span
                className={`w-8 text-center font-bold ${
                  entry.rank === 1
                    ? "text-amber-400"
                    : entry.rank === 2
                      ? "text-gray-300"
                      : entry.rank === 3
                        ? "text-amber-700"
                        : "text-gray-500"
                }`}
              >
                #{entry.rank}
              </span>
              <div className="flex-1">
                <p className="font-medium">{entry.team_name}</p>
                <p className="text-xs text-gray-400">
                  {entry.player_count} giocatori · {formatTime(entry.total_time_s)}
                </p>
              </div>
              <span className="font-bold text-indigo-400">
                {entry.total_score}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
