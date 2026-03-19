"use client";

import { createContext, useContext } from "react";

export type GameStatus =
  | "idle"
  | "joining"
  | "navigating"
  | "scanning"
  | "solving"
  | "stage_complete"
  | "game_complete";

export interface StageProgress {
  id: string;
  stage_id: string;
  status: "locked" | "unlocked" | "in_progress" | "completed";
  score: number;
  hints_used: number;
  attempts: number;
  stage?: {
    order_index: number;
    title: string;
    latitude: number;
    longitude: number;
    radius_m: number;
  };
}

export interface GameSession {
  id: string;
  game_id: string;
  team_name: string;
  access_code: string;
  status: "active" | "paused" | "completed" | "abandoned";
  current_stage_index: number;
  total_score: number;
  total_hints_used: number;
  started_at: string;
}

export interface GameState {
  session: GameSession | null;
  progress: StageProgress[];
  gameStatus: GameStatus;
  setSession: (s: GameSession | null) => void;
  setProgress: (p: StageProgress[]) => void;
  setGameStatus: (s: GameStatus) => void;
}

export const GameContext = createContext<GameState>({
  session: null,
  progress: [],
  gameStatus: "idle",
  setSession: () => {},
  setProgress: () => {},
  setGameStatus: () => {},
});

export const useGameState = () => useContext(GameContext);
