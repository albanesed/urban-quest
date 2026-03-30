"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";
import PuzzleEditor from "@/components/PuzzleEditor";

interface Stage {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius_m: number;
  unlock_method: string;
  narrative_text: string;
  estimated_duration_min: number;
}

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

export default function StageEditorPage() {
  const { gameId, stageId } = useParams<{ gameId: string; stageId: string }>();
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [stage, setStage] = useState<Stage | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase
        .from("stages")
        .select("*")
        .eq("id", stageId)
        .single();
      if (s) setStage(s as Stage);

      const { data: p } = await supabase
        .from("puzzles")
        .select("id, order_index, type, question, answer_display, options, hints, points, penalty_per_hint")
        .eq("stage_id", stageId)
        .order("order_index");
      setPuzzles((p as Puzzle[]) || []);
    }
    load();
  }, [stageId]);

  const handleSaveStage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    await supabase
      .from("stages")
      .update({
        title: form.get("title") as string,
        description: form.get("description") as string,
        latitude: parseFloat(form.get("latitude") as string),
        longitude: parseFloat(form.get("longitude") as string),
        radius_m: parseInt(form.get("radius") as string) || 50,
        unlock_method: form.get("unlock_method") as string,
        narrative_text: form.get("narrative") as string,
        estimated_duration_min: parseInt(form.get("duration") as string) || 15,
      })
      .eq("id", stageId);

    setSaving(false);
  };

  const handleDeleteStage = async () => {
    if (!confirm("Sei sicuro di voler eliminare questa tappa?")) return;
    await supabase.from("stages").delete().eq("id", stageId);
    router.push(`/games/${gameId}`);
  };

  if (authLoading || !stage) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-3xl">
        <Link href={`/games/${gameId}`} className="text-indigo-400 text-sm">← Gioco</Link>
        <h1 className="text-2xl font-bold mt-1 mb-6">{stage.title}</h1>

        {/* stage form */}
        <form onSubmit={handleSaveStage} className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Titolo</label>
              <input name="title" defaultValue={stage.title} required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Metodo sblocco</label>
              <select name="unlock_method" defaultValue={stage.unlock_method}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white">
                <option value="qr_and_geo">QR + Geo</option>
                <option value="qr">Solo QR</option>
                <option value="geo">Solo Geo</option>
                <option value="manual">Manuale</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Descrizione</label>
            <textarea name="description" rows={2} defaultValue={stage.description || ""}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Latitudine</label>
              <input name="latitude" type="number" step="0.0000001" defaultValue={stage.latitude} required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Longitudine</label>
              <input name="longitude" type="number" step="0.0000001" defaultValue={stage.longitude} required
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Raggio (m)</label>
              <input name="radius" type="number" defaultValue={stage.radius_m}
                className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Durata (min)</label>
            <input name="duration" type="number" defaultValue={stage.estimated_duration_min}
              className="w-full px-3 py-3 bg-gray-800 rounded-lg text-white w-24" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Testo narrativo</label>
            <textarea name="narrative" rows={4} defaultValue={stage.narrative_text || ""}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium">
              {saving ? "Salvo..." : "Salva tappa"}
            </button>
            <button type="button" onClick={handleDeleteStage}
              className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm">
              Elimina
            </button>
          </div>
        </form>

        <hr className="border-gray-800 my-8" />

        {/* puzzles section */}
        <h2 className="text-xl font-bold mb-4">Enigmi ({puzzles.length})</h2>
        {puzzles.map((puzzle) => (
          <PuzzleEditor key={puzzle.id} puzzle={puzzle} stageId={stageId} onUpdate={() => {
            // reload puzzles
            supabase.from("puzzles")
              .select("id, order_index, type, question, answer_display, options, hints, points, penalty_per_hint")
              .eq("stage_id", stageId)
              .order("order_index")
              .then(({ data }) => setPuzzles((data as Puzzle[]) || []));
          }} />
        ))}
        <PuzzleEditor stageId={stageId} onUpdate={() => {
          supabase.from("puzzles")
            .select("id, order_index, type, question, answer_display, options, hints, points, penalty_per_hint")
            .eq("stage_id", stageId)
            .order("order_index")
            .then(({ data }) => setPuzzles((data as Puzzle[]) || []));
        }} />
      </main>
    </div>
  );
}
