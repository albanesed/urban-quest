"use client";

import { useState } from "react";

interface Puzzle {
  id: string;
  type: "text" | "multiple_choice" | "numeric" | "photo";
  question: string;
  options?: { id: string; text: string }[];
  points: number;
}

interface PuzzleCardProps {
  puzzle: Puzzle;
  onSubmit: (answer: string) => void;
  loading?: boolean;
  result?: { correct: boolean; attempts?: number; answer_display?: string } | null;
}

export default function PuzzleCard({ puzzle, onSubmit, loading, result }: PuzzleCardProps) {
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const handleSubmit = () => {
    const val = puzzle.type === "multiple_choice" ? selectedOption : answer;
    if (val.trim()) onSubmit(val.trim());
  };

  if (result?.correct) {
    return (
      <div className="bg-green-900/30 border border-green-600 rounded-xl p-6 text-center">
        <p className="text-2xl mb-2">Corretto!</p>
        <p className="text-green-300">{result.answer_display}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <p className="text-lg mb-1 font-medium">{puzzle.question}</p>
      <p className="text-sm text-gray-400 mb-4">{puzzle.points} punti</p>

      {puzzle.type === "text" && (
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="La tua risposta..."
          className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white text-lg"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      )}

      {puzzle.type === "numeric" && (
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="0"
          className="w-full px-4 py-3 bg-gray-700 rounded-lg text-white text-lg text-center"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      )}

      {puzzle.type === "multiple_choice" && puzzle.options && (
        <div className="flex flex-col gap-2">
          {puzzle.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                selectedOption === opt.id
                  ? "border-indigo-500 bg-indigo-900/30"
                  : "border-gray-600 bg-gray-700 hover:border-gray-500"
              }`}
            >
              {opt.text}
            </button>
          ))}
        </div>
      )}

      {result && !result.correct && (
        <p className="text-red-400 text-sm mt-2">
          Risposta sbagliata. Tentativo {result.attempts}.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || (!answer.trim() && !selectedOption)}
        className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                   rounded-lg text-white font-medium text-lg transition-colors"
      >
        {loading ? "Verifico..." : "Rispondi"}
      </button>
    </div>
  );
}
