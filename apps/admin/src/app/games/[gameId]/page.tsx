"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

interface Stage {
  id: string;
  order_index: number;
  title: string;
  latitude: number;
  longitude: number;
}

export default function GameEditorPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { loading: authLoading } = useRequireAuth();
  const [game, setGame] = useState<Record<string, unknown> | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    async function load() {
      const { data: g } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();
      setGame(g);

      const { data: s } = await supabase
        .from("stages")
        .select("id, order_index, title, latitude, longitude")
        .eq("game_id", gameId)
        .order("order_index");
      setStages((s as Stage[]) || []);
    }
    load();
  }, [gameId]);

  const togglePublish = async () => {
    if (!game) return;
    const newStatus = game.status === "published" ? "draft" : "published";
    await supabase.from("games").update({ status: newStatus }).eq("id", gameId);
    setGame({ ...game, status: newStatus });
  };

  if (authLoading || !game) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/games" className="text-indigo-400 text-sm">← Giochi</Link>
            <h1 className="text-2xl font-bold mt-1">{game.title as string}</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/games/${gameId}/qr-codes`}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              QR Codes
            </Link>
            <button
              onClick={togglePublish}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                game.status === "published"
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {game.status === "published" ? "Ritira" : "Pubblica"}
            </button>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-3">
          Tappe ({stages.length})
        </h2>

        {stages.length === 0 ? (
          <p className="text-gray-500 mb-4">Nessuna tappa. Aggiungine una!</p>
        ) : (
          <div className="space-y-2 mb-4">
            {stages.map((stage) => (
              <Link
                key={stage.id}
                href={`/games/${gameId}/stages/${stage.id}`}
                className="flex items-center gap-4 bg-gray-800 rounded-lg p-4 hover:bg-gray-750"
              >
                <span className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {stage.order_index}
                </span>
                <div className="flex-1">
                  <p className="font-medium">{stage.title}</p>
                  <p className="text-xs text-gray-400">
                    {stage.latitude}, {stage.longitude}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link
          href={`/games/${gameId}/stages/new`}
          className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          + Aggiungi tappa
        </Link>
      </main>
    </div>
  );
}
