"use client";

import { useState } from "react";

interface Hint {
  order: number;
  text: string;
}

interface HintSystemProps {
  hints: Hint[];
  penaltyPerHint: number;
  onReveal: (hintIndex: number) => void;
}

export default function HintSystem({ hints, penaltyPerHint, onReveal }: HintSystemProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const revealNext = () => {
    setShowConfirm(false);
    const nextIndex = revealedCount;
    setRevealedCount(nextIndex + 1);
    onReveal(nextIndex);
  };

  const sortedHints = [...hints].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {/* already revealed hints */}
      {sortedHints.slice(0, revealedCount).map((hint, i) => (
        <div key={i} className="bg-amber-900/20 border border-amber-700 rounded-lg p-3">
          <p className="text-sm text-amber-200">
            Suggerimento {i + 1}: {hint.text}
          </p>
        </div>
      ))}

      {/* reveal button */}
      {revealedCount < hints.length && (
        <>
          {showConfirm ? (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-amber-400">
                Perdi {penaltyPerHint} punti. Sicuro?
              </span>
              <button
                onClick={revealNext}
                className="px-3 py-1 bg-amber-600 rounded text-sm text-white"
              >
                Si
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-1 bg-gray-600 rounded text-sm text-white"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Suggerimento {revealedCount + 1}/{hints.length} (-{penaltyPerHint}{" "}
              punti)
            </button>
          )}
        </>
      )}
    </div>
  );
}
