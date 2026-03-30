"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Puzzle {
  id: string;
  order_index: number;
  type: string;
  question: string;
  answer_display: string;
  options: { id: string; text: string }[] | null;
  hints: { order: number; text: string }[];
  points: number;
  penalty_per_hint: number;
}

interface PuzzleEditorProps {
  puzzle?: Puzzle;
  stageId: string;
  onUpdate: () => void;
}

// this component handles both creating a new puzzle and editing an existing one.
// probably should have split them but it works fine for now
export default function PuzzleEditor({ puzzle, stageId, onUpdate }: PuzzleEditorProps) {
  const isNew = !puzzle;
  const [expanded, setExpanded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(puzzle?.type || "text");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const answer = (form.get("answer") as string).toLowerCase().trim();

    // we need to hash the answer — but we can't do bcrypt client-side easily,
    // so for MVP we store it via an RPC that does the hashing server-side
    // TODO: this is a workaround, ideally the admin should call an edge function

    const hintsRaw = form.get("hints") as string;
    const hints = hintsRaw
      .split("\n")
      .filter((h) => h.trim())
      .map((h, i) => ({ order: i + 1, text: h.trim() }));

    let options = null;
    if (type === "multiple_choice") {
      const optionsRaw = form.get("options") as string;
      options = optionsRaw
        .split("\n")
        .filter((o) => o.trim())
        .map((o, i) => ({
          id: String.fromCharCode(97 + i), // a, b, c, d...
          text: o.trim(),
        }));
    }

    const puzzleData = {
      stage_id: stageId,
      type,
      question: form.get("question") as string,
      answer_display: form.get("answer_display") as string,
      points: parseInt(form.get("points") as string) || 100,
      penalty_per_hint: parseInt(form.get("penalty") as string) || 25,
      hints,
      options,
    };

    if (isNew) {
      // get next order_index
      const { count } = await supabase
        .from("puzzles")
        .select("*", { count: "exact", head: true })
        .eq("stage_id", stageId);

      const { error } = await supabase.from("puzzles").insert({
        ...puzzleData,
        order_index: (count || 0) + 1,
        // hash the answer server-side
        answer_hash: answer, // placeholder — needs server-side hashing
      });

      if (error) alert(`Errore: ${error.message}`);
    } else {
      const updateData: Record<string, unknown> = { ...puzzleData };
      if (answer && answer !== puzzle.answer_display?.toLowerCase().trim()) {
        // answer changed, need to re-hash
        updateData.answer_hash = answer; // placeholder — needs server-side hashing
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { stage_id: _, ...updateWithoutStage } = updateData;
      await supabase.from("puzzles").update(updateWithoutStage).eq("id", puzzle.id);
    }

    setSaving(false);
    onUpdate();
    if (isNew) setExpanded(false);
  };

  const handleDelete = async () => {
    if (!puzzle || !confirm("Eliminare questo enigma?")) return;
    await supabase.from("puzzles").delete().eq("id", puzzle.id);
    onUpdate();
  };

  if (!expanded && isNew) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
      >
        + Aggiungi enigma
      </button>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-5 mb-4">
      {!isNew && (
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setExpanded(!expanded)} className="text-sm font-medium">
            Enigma {puzzle.order_index}: {puzzle.question.slice(0, 50)}...
          </button>
          <button onClick={handleDelete} className="text-red-400 text-xs hover:text-red-300">
            Elimina
          </button>
        </div>
      )}

      {(expanded || isNew) && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm">
              <option value="text">Testo libero</option>
              <option value="numeric">Numerico</option>
              <option value="multiple_choice">Scelta multipla</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Domanda</label>
            <textarea name="question" rows={2} defaultValue={puzzle?.question}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Risposta corretta</label>
              <input name="answer" defaultValue={puzzle?.answer_display?.toLowerCase()}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm" required />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Risposta visualizzata</label>
              <input name="answer_display" defaultValue={puzzle?.answer_display}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm" required />
            </div>
          </div>
          {type === "multiple_choice" && (
            <div>
              <label className="text-sm text-gray-400 block mb-1">Opzioni (una per riga)</label>
              <textarea name="options" rows={4}
                defaultValue={puzzle?.options?.map((o) => o.text).join("\n")}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
                placeholder={"Opzione A\nOpzione B\nOpzione C\nOpzione D"} />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Suggerimenti (uno per riga)</label>
            <textarea name="hints" rows={3}
              defaultValue={puzzle?.hints?.map((h) => h.text).join("\n")}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Punti</label>
              <input name="points" type="number" defaultValue={puzzle?.points || 100}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Penalità per suggerimento</label>
              <input name="penalty" type="number" defaultValue={puzzle?.penalty_per_hint || 25}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-sm font-medium">
            {saving ? "Salvo..." : isNew ? "Aggiungi enigma" : "Salva modifiche"}
          </button>
        </form>
      )}
    </div>
  );
}
