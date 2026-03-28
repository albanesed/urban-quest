"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
  totalGames: number;
  publishedGames: number;
  activeSessions: number;
  completedSessions: number;
}

export default function DashboardPage() {
  const { loading: authLoading, operatorId } = useRequireAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!operatorId) return;

    async function loadStats() {
      const { count: totalGames } = await supabase
        .from("games")
        .select("*", { count: "exact", head: true })
        .eq("operator_id", operatorId!);

      const { count: publishedGames } = await supabase
        .from("games")
        .select("*", { count: "exact", head: true })
        .eq("operator_id", operatorId!)
        .eq("status", "published");

      // sessions for operator's games
      const { data: games } = await supabase
        .from("games")
        .select("id")
        .eq("operator_id", operatorId!);

      const gameIds = games?.map((g) => g.id) || [];

      let activeSessions = 0;
      let completedSessions = 0;

      if (gameIds.length > 0) {
        const { count: active } = await supabase
          .from("sessions")
          .select("*", { count: "exact", head: true })
          .in("game_id", gameIds)
          .eq("status", "active");

        const { count: completed } = await supabase
          .from("sessions")
          .select("*", { count: "exact", head: true })
          .in("game_id", gameIds)
          .eq("status", "completed");

        activeSessions = active || 0;
        completedSessions = completed || 0;
      }

      setStats({
        totalGames: totalGames || 0,
        publishedGames: publishedGames || 0,
        activeSessions,
        completedSessions,
      });
    }

    loadStats();
  }, [operatorId]);

  if (authLoading) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {stats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Giochi totali" value={stats.totalGames} />
            <StatCard label="Pubblicati" value={stats.publishedGames} />
            <StatCard label="Sessioni attive" value={stats.activeSessions} />
            <StatCard label="Completate" value={stats.completedSessions} />
          </div>
        ) : (
          <p className="text-gray-500">Caricamento statistiche...</p>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-800 rounded-xl p-5">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}
