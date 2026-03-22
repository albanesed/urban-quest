"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ensureAnonymousSession } from "@/lib/auth";
import { useSession } from "@/hooks/useSession";
import { useGeolocation } from "@/hooks/useGeolocation";
import PuzzleCard from "@/components/PuzzleCard";
import HintSystem from "@/components/HintSystem";
import StageNarrative from "@/components/StageNarrative";

const QRScanner = dynamic(() => import("@/components/QRScanner"), {
  ssr: false,
});

type Phase = "scan" | "puzzle" | "narrative";

export default function StagePage() {
  const { sessionId, n } = useParams<{ sessionId: string; n: string }>();
  const router = useRouter();
  const { verifyQr, checkAnswer, loading, error } = useSession();
  const { position, startWatching } = useGeolocation();

  const [phase, setPhase] = useState<Phase>("scan");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stageData, setStageData] = useState<Record<string, any> | null>(null);
  const [puzzleResult, setPuzzleResult] = useState<{ correct: boolean; attempts?: number; score?: number; answer_display?: string; game_completed?: boolean } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars

  useEffect(() => {
    ensureAnonymousSession();
    startWatching();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQrScan = async (token: string) => {
    if (!position) {
      // GPS not ready yet — tell the user instead of silently dropping
      alert("In attesa del GPS... riprova tra qualche secondo");
      return;
    }
    const result = await verifyQr(
      sessionId,
      token,
      position.latitude,
      position.longitude
    );
    if (result) {
      setStageData(result);
      setPhase(result.already_unlocked ? "puzzle" : "puzzle");
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!stageData?.puzzles?.[0]) return;
    const result = await checkAnswer(
      sessionId,
      stageData.puzzles[0].id,
      answer
    );
    if (result) {
      setPuzzleResult(result);
      if (result.correct) {
        setPhase("narrative");
      }
    }
  };

  const handleContinue = () => {
    if (puzzleResult?.game_completed) {
      router.push(`/play/${sessionId}/complete`);
    } else {
      router.push(`/play/${sessionId}`);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <button
        onClick={() => router.push(`/play/${sessionId}`)}
        className="text-indigo-400 text-sm mb-4 inline-block"
      >
        ← Mappa
      </button>

      <h1 className="text-xl font-bold mb-6">
        Tappa {n}
        {stageData?.title ? ` — ${stageData.title}` : ""}
      </h1>

      {phase === "scan" && (
        <div className="space-y-4">
          <p className="text-gray-400">
            Scansiona il QR code che trovi nella tappa.
          </p>
          <QRScanner onScan={handleQrScan} />
          {!position && (
            <p className="text-amber-400 text-sm">
              In attesa della posizione GPS...
            </p>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}

      {phase === "puzzle" && stageData?.puzzles?.[0] && (
        <div className="space-y-6">
          <PuzzleCard
            puzzle={stageData.puzzles[0]}
            onSubmit={handleAnswer}
            loading={loading}
            result={puzzleResult}
          />
          {stageData.puzzles[0].hints?.length > 0 && (
            <HintSystem
              hints={stageData.puzzles[0].hints}
              penaltyPerHint={stageData.puzzles[0].penalty_per_hint}
              onReveal={() => setHintsUsed((h) => h + 1)}
            />
          )}
        </div>
      )}

      {phase === "narrative" && stageData && (
        <StageNarrative
          title={stageData.title}
          text={stageData.narrative_text || ""}
          score={puzzleResult?.score || 0}
          onContinue={handleContinue}
        />
      )}
    </main>
  );
}
