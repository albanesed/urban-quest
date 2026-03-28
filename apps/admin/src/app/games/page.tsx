"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

interface Game {
  id: string;
  title: string;
  city: string;
  status: string;
  difficulty: string;
  created_at: string;
}

export default function GamesPage() {
  const { loading: authLoading, operatorId } = useRequireAuth();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!operatorId) return;
    supabase
      .from("games")
      .select("id, title, city, status, difficulty, created_at")
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setGames((data as Game[]) || []));
  }, [operatorId]);

  if (authLoading) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">I tuoi giochi</h1>
          <Link
            href="/games/new"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium"
          >
            + Nuovo gioco
          </Link>
        </div>

        {games.length === 0 ? (
          <p className="text-gray-500">Nessun gioco. Crea il primo!</p>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/games/${game.id}`}
                className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{game.title}</h2>
                    <p className="text-sm text-gray-400">
                      {game.city} · {game.difficulty}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      game.status === "published"
                        ? "bg-green-900/30 text-green-400"
                        : game.status === "draft"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {game.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
