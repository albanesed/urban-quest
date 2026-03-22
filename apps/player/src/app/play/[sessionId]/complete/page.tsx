"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ensureAnonymousSession } from "@/lib/auth";

interface CompletionData {
  team_name: string;
  total_score: number;
  total_time_s: number;
  rank: number | null;
  game_id: string;
}

export default function CompletePage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [data, setData] = useState<CompletionData | null>(null);

  useEffect(() => {
    async function load() {
      await ensureAnonymousSession();

      const { data: session } = await supabase
        .from("sessions")
        .select("team_name, total_score, game_id, started_at, completed_at")
        .eq("id", sessionId)
        .single();

      if (!session) return;

      const { data: entry } = await supabase
        .from("leaderboard")
        .select("rank, total_time_s")
        .eq("session_id", sessionId)
        .single();

      setData({
        team_name: session.team_name,
        total_score: session.total_score,
        total_time_s: entry?.total_time_s || 0,
        rank: entry?.rank || null,
        game_id: session.game_id,
      });
    }
    load();
  }, [sessionId]);

  if (!data) {
    return (
      <main className="max-w-lg mx-auto px-4 py-8 text-center">
        <p className="text-gray-400">Caricamento...</p>
      </main>
    );
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Complimenti!</h1>
      <p className="text-gray-400 mb-8">Hai completato il gioco</p>

      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <p className="text-lg text-gray-400 mb-1">{data.team_name}</p>

        <p className="text-5xl font-bold text-indigo-400 mb-2">
          {data.total_score}
        </p>
        <p className="text-gray-400 mb-4">punti</p>

        <div className="flex justify-center gap-8">
          <div>
            <p className="text-2xl font-bold">{formatTime(data.total_time_s)}</p>
            <p className="text-xs text-gray-400">Tempo</p>
          </div>
          {data.rank && (
            <div>
              <p className="text-2xl font-bold">#{data.rank}</p>
              <p className="text-xs text-gray-400">Posizione</p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Link
          href={`/leaderboard/${data.game_id}`}
          className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
        >
          Classifica completa
        </Link>
        <Link
          href="/"
          className="block text-indigo-400 text-sm"
        >
          Torna alla home
        </Link>
      </div>
    </main>
  );
}
