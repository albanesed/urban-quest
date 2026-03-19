"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { StageProgress } from "@/lib/game-state";

const FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1";

async function callEdgeFunction(name: string, body: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
}

export function useSession() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startSession(
    gameId: string,
    teamName?: string,
    playerCount = 1
  ): Promise<{ session_id: string; access_code: string; team_name: string } | null> {
    setLoading(true);
    setError(null);
    try {
      return await callEdgeFunction("start-session", {
        game_id: gameId,
        team_name: teamName,
        player_count: playerCount,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function joinSession(accessCode: string) {
    setLoading(true);
    setError(null);
    try {
      return await callEdgeFunction("join-session", {
        access_code: accessCode,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function verifyQr(
    sessionId: string,
    qrToken: string,
    latitude: number,
    longitude: number
  ) {
    setLoading(true);
    setError(null);
    try {
      return await callEdgeFunction("verify-qr", {
        session_id: sessionId,
        qr_token: qrToken,
        latitude,
        longitude,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function checkAnswer(sessionId: string, puzzleId: string, answer: string) {
    setLoading(true);
    setError(null);
    try {
      return await callEdgeFunction("check-answer", {
        session_id: sessionId,
        puzzle_id: puzzleId,
        answer,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function fetchSessionProgress(sessionId: string): Promise<StageProgress[]> {
    const { data, error: err } = await supabase
      .from("session_progress")
      .select("*, stage:stages!inner(order_index, title, latitude, longitude, radius_m)")
      .eq("session_id", sessionId)
      .order("order_index", { referencedTable: "stages", ascending: true });

    if (err) {
      setError(err.message);
      return [];
    }
    return data as StageProgress[];
  }

  return {
    loading,
    error,
    startSession,
    joinSession,
    verifyQr,
    checkAnswer,
    fetchSessionProgress,
  };
}
