"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ensureAnonymousSession } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";

export default function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get("game");
  const { startSession, joinSession, loading, error } = useSession();

  const [accessCode, setAccessCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [mode, setMode] = useState<"join" | "start">(gameId ? "start" : "join");

  useEffect(() => {
    ensureAnonymousSession();
  }, []);

  const handleStart = async () => {
    if (!gameId) return;
    const result = await startSession(gameId, teamName || undefined);
    if (result) {
      router.push(`/play/${result.session_id}`);
    }
  };

  const handleJoin = async () => {
    if (!accessCode.trim()) return;
    const result = await joinSession(accessCode);
    if (result) {
      router.push(`/play/${result.session_id}`);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {mode === "start" ? "Nuova partita" : "Unisciti a una partita"}
      </h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("start")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            mode === "start"
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          Nuova partita
        </button>
        <button
          onClick={() => setMode("join")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            mode === "join"
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400"
          }`}
        >
          Ho un codice
        </button>
      </div>

      {mode === "start" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Nome del team (opzionale)
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Verrà generato automaticamente"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
            />
          </div>
          <button
            onClick={handleStart}
            disabled={loading || !gameId}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium text-lg"
          >
            {loading ? "Creo la partita..." : "Inizia"}
          </button>
        </div>
      )}

      {mode === "join" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">
              Codice di accesso
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="ES: A3F1-C9D2"
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white text-center text-xl tracking-widest font-mono"
              maxLength={9}
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={loading || !accessCode.trim()}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium text-lg"
          >
            {loading ? "Cerco la partita..." : "Unisciti"}
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
      )}
    </main>
  );
}
