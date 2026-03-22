"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ensureAnonymousSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";
import { useGeolocation } from "@/hooks/useGeolocation";
import { GameContext, type GameSession, type StageProgress, type GameStatus } from "@/lib/game-state";
import Timer from "@/components/Timer";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function PlaySessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { fetchSessionProgress } = useSession();
  const { position, startWatching } = useGeolocation();

  const [session, setSession] = useState<GameSession | null>(null);
  const [progress, setProgress] = useState<StageProgress[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("idle");

  // load session data
  useEffect(() => {
    async function load() {
      await ensureAnonymousSession();

      // fetch session record
      const { data: sess } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionId)
        .single();
      if (sess) setSession(sess as GameSession);

      const prog = await fetchSessionProgress(sessionId);
      setProgress(prog);
      setGameStatus("navigating");
      startWatching();
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // get the active stage from context
  const activeStage = progress.find(
    (p) => p.status === "unlocked" || p.status === "in_progress"
  );

  const completedCount = progress.filter((p) => p.status === "completed").length;

  // calculate distance to active stage
  const distanceToStage =
    activeStage?.stage && position
      ? Math.round(
          haversine(
            position.latitude,
            position.longitude,
            activeStage.stage.latitude,
            activeStage.stage.longitude
          )
        )
      : null;

  return (
    <GameContext.Provider value={{ session, progress, gameStatus, setSession, setProgress, setGameStatus }}>
      <div className="h-screen flex flex-col">
        {/* top bar */}
        <div className="bg-gray-800 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <span className="text-sm text-gray-400">
              Tappa {completedCount + 1}/{progress.length}
            </span>
          </div>
          {session?.started_at && <Timer startedAt={session.started_at} />}
        </div>

        {/* map */}
        <div className="flex-1 relative">
          <MapView
            progress={progress}
            playerLat={position?.latitude}
            playerLng={position?.longitude}
            activeStageId={activeStage?.stage_id}
          />
        </div>

        {/* bottom panel */}
        <div className="bg-gray-800 px-4 py-4 space-y-3">
          {activeStage?.stage && (
            <>
              <h2 className="font-semibold">
                {activeStage.stage.order_index}. {activeStage.stage.title}
              </h2>

              {distanceToStage !== null && (
                <p className="text-sm text-gray-400">
                  {distanceToStage > 1000
                    ? `${(distanceToStage / 1000).toFixed(1)} km`
                    : `${distanceToStage} m`}{" "}
                  dalla tappa
                </p>
              )}

              {activeStage.status === "unlocked" && (
                <button
                  onClick={() =>
                    router.push(`/play/${sessionId}/stage/${activeStage.stage!.order_index}`)
                  }
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
                >
                  Scansiona QR
                </button>
              )}

              {activeStage.status === "in_progress" && (
                <button
                  onClick={() =>
                    router.push(`/play/${sessionId}/stage/${activeStage.stage!.order_index}`)
                  }
                  className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                >
                  Risolvi enigma
                </button>
              )}
            </>
          )}

          {progress.length > 0 && progress.every((p) => p.status === "completed") && (
            <button
              onClick={() => router.push(`/play/${sessionId}/complete`)}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 rounded-lg font-medium"
            >
              Vedi risultati
            </button>
          )}
        </div>
      </div>
    </GameContext.Provider>
  );
}

// inline haversine — didn't want to import the full geo module for this
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
