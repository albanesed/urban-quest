"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

interface SessionRow {
  id: string;
  team_name: string;
  status: string;
  player_count: number;
  total_score: number;
  started_at: string;
  game: { title: string };
}

export default function SessionsPage() {
  const { loading: authLoading, operatorId } = useRequireAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  useEffect(() => {
    if (!operatorId) return;

    async function load() {
      // get operator's games first, then their sessions
      const { data: games } = await supabase
        .from("games")
        .select("id")
        .eq("operator_id", operatorId!);

      const gameIds = games?.map((g) => g.id) || [];
      if (gameIds.length === 0) return;

      const { data } = await supabase
        .from("sessions")
        .select("id, team_name, status, player_count, total_score, started_at, game:games!inner(title)")
        .in("game_id", gameIds)
        .order("started_at", { ascending: false })
        .limit(50);

      setSessions((data as unknown as SessionRow[]) || []);
    }
    load();
  }, [operatorId]);

  if (authLoading) return <div className="p-8 text-gray-400">Caricamento...</div>;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Sessioni</h1>

        {sessions.length === 0 ? (
          <p className="text-gray-500">Nessuna sessione ancora.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="py-3 pr-4">Team</th>
                  <th className="py-3 pr-4">Gioco</th>
                  <th className="py-3 pr-4">Stato</th>
                  <th className="py-3 pr-4">Giocatori</th>
                  <th className="py-3 pr-4">Punteggio</th>
                  <th className="py-3">Inizio</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-gray-800/50">
                    <td className="py-3 pr-4 font-medium">{s.team_name}</td>
                    <td className="py-3 pr-4 text-gray-400 text-sm">{s.game.title}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        s.status === "active" ? "bg-green-900/30 text-green-400" :
                        s.status === "completed" ? "bg-blue-900/30 text-blue-400" :
                        "bg-gray-700 text-gray-300"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-sm">{s.player_count}</td>
                    <td className="py-3 pr-4 text-sm">{s.total_score}</td>
                    <td className="py-3 text-sm text-gray-400">{formatDate(s.started_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
