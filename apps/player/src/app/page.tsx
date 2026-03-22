import Link from "next/link";

export const dynamic = "force-dynamic";

interface GameListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  city: string;
  difficulty: string;
  duration_min: number;
  min_players: number;
  max_players: number;
  operator: { slug: string; name: string };
}

async function getPublishedGames(): Promise<GameListItem[]> {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await client
    .from("games")
    .select(
      "id, title, slug, description, city, difficulty, duration_min, min_players, max_players, operator:operators!inner(slug, name)"
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as GameListItem[];
}

export default async function HomePage() {
  const games = await getPublishedGames();

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Urban Quest</h1>
      <p className="text-gray-400 mb-8">Esplora la città risolvendo enigmi</p>

      {games.length === 0 ? (
        <p className="text-gray-500">Nessun gioco disponibile al momento.</p>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/${game.operator.slug}/${game.slug}`}
              className="block bg-gray-800 rounded-xl p-5 hover:bg-gray-750 transition-colors"
            >
              <h2 className="text-xl font-semibold mb-1">{game.title}</h2>
              <p className="text-sm text-gray-400 mb-3">
                {game.city} · {game.difficulty} · {game.duration_min} min
              </p>
              <p className="text-gray-300 text-sm line-clamp-2">
                {game.description}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {game.min_players}-{game.max_players} giocatori · di{" "}
                {game.operator.name}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/play/join"
          className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
        >
          Hai un codice? Unisciti a una partita
        </Link>
      </div>
    </main>
  );
}
