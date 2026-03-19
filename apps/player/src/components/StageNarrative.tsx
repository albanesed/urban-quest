"use client";

interface StageNarrativeProps {
  title: string;
  text: string;
  score: number;
  onContinue: () => void;
}

export default function StageNarrative({
  title,
  text,
  score,
  onContinue,
}: StageNarrativeProps) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-bold text-indigo-300">{title}</h2>
      <p className="text-gray-300 leading-relaxed whitespace-pre-line">{text}</p>
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <span className="text-green-400 font-medium">+{score} punti</span>
        <button
          onClick={onContinue}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-medium"
        >
          Continua
        </button>
      </div>
    </div>
  );
}
