import Link from "next/link";
import { notFound } from "next/navigation";

async function getGame(operatorSlug: string, gameSlug: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await client
    .from("games")
    .select(
      "*, operator:operators!inner(slug, name), stages(id, order_index, title, estimated_duration_min)"
    )
    .eq("operator.slug", operatorSlug)
    .eq("slug", gameSlug)
    .eq("status", "published")
    .single();

  return data;
}

export default async function GameDetailPage({
  params,
}: {
  params: { operator: string; game: string };
}) {
  const game = await getGame(params.operator, params.game);
  if (!game) notFound();

  const totalDuration = game.stages?.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, s: any) => sum + (s.estimated_duration_min || 0),
    0
  );

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <Link href="/" className="text-indigo-400 text-sm mb-4 inline-block">
        ← Tutti i giochi
      </Link>

      <h1 className="text-2xl font-bold mb-2">{game.title}</h1>
      <p className="text-gray-400 text-sm mb-4">
        {game.city} · {game.operator.name}
      </p>

      <p className="text-gray-300 mb-6">{game.description}</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{game.stages?.length || 0}</p>
          <p className="text-xs text-gray-400">Tappe</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">{totalDuration}</p>
          <p className="text-xs text-gray-400">Minuti</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold">
            {game.min_players}-{game.max_players}
          </p>
          <p className="text-xs text-gray-400">Giocatori</p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold">Tappe</h2>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {game.stages
          ?.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
          .map((stage: { id: string; order_index: number; title: string }) => (
            <div
              key={stage.id}
              className="bg-gray-800 rounded-lg px-4 py-3 flex items-center gap-3"
            >
              <span className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                {stage.order_index}
              </span>
              <span>{stage.title}</span>
            </div>
          ))}
      </div>

      <Link
        href={`/play/join?game=${game.id}`}
        className="block w-full text-center py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-lg font-semibold"
      >
        {game.price_cents > 0
          ? `Gioca — €${(game.price_cents / 100).toFixed(2)}`
          : "Gioca gratis"}
      </Link>

      <Link
        href={`/leaderboard/${game.id}`}
        className="block text-center text-indigo-400 text-sm mt-4"
      >
        Classifica
      </Link>
    </main>
  );
}
