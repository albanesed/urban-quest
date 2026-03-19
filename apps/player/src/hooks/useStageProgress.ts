"use client";

import { useMemo } from "react";
import { useGameState } from "@/lib/game-state";

export function useStageProgress() {
  const { progress } = useGameState();

  const currentStage = useMemo(() => {
    if (!progress.length) return null;
    // find the first non-completed stage
    const active = progress.find(
      (p) => p.status === "in_progress" || p.status === "unlocked"
    );
    return active || progress[progress.length - 1];
  }, [progress]);

  const completedCount = useMemo(
    () => progress.filter((p) => p.status === "completed").length,
    [progress]
  );

  const totalStages = progress.length;

  const isLastStage = useMemo(() => {
    if (!currentStage?.stage) return false;
    return currentStage.stage.order_index === totalStages;
  }, [currentStage, totalStages]);

  return {
    currentStage,
    completedCount,
    totalStages,
    isLastStage,
    progress,
  };
}
