"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

export default function NewStagePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    // figure out next order_index
    const { count } = await supabase
      .from("stages")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameId);

    const orderIndex = (count || 0) + 1;

    const { data: stage, error } = await supabase
      .from("stages")
      .insert({
        game_id: gameId,
        order_index: orderIndex,
        title: form.get("title") as string,
        description: form.get("description") as string,
        latitude: parseFloat(form.get("latitude") as string),
        longitude: parseFloat(form.get("longitude") as string),
        radius_m: parseInt(form.get("radius") as string) || 50,
        unlock_method: form.get("unlock_method") as string,
        narrative_text: form.get("narrative") as string,
        estimated_duration_min: parseInt(form.get("duration") as string) || 15,
      })
      .select("id")
      .single();

    if (error) {
      alert(`Errore: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push(`/games/${gameId}/stages/${stage.id}`);
  };

  if (authLoading) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Nuova tappa</h1>
        <StageForm onSubmit={handleSubmit} saving={saving} />
      </main>
    </div>
  );
}

// pulled this out so we can reuse it in the edit page if needed
function StageForm({
  onSubmit,
  saving,
  defaults,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  defaults?: Record<string, string>;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-gray-400 block mb-1">Titolo</label>
        <input name="title" required defaultValue={defaults?.title}
          className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-1">Descrizione</label>
        <textarea name="description" rows={2} defaultValue={defaults?.description}
          className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Latitudine</label>
          <input name="latitude" type="number" step="0.0000001" required defaultValue={defaults?.latitude}
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Longitudine</label>
          <input name="longitude" type="number" step="0.0000001" required defaultValue={defaults?.longitude}
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Raggio (m)</label>
          <input name="radius" type="number" defaultValue={defaults?.radius || "50"}
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Metodo sblocco</label>
          <select name="unlock_method" defaultValue={defaults?.unlock_method || "qr_and_geo"}
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white">
            <option value="qr_and_geo">QR + Geolocalizzazione</option>
            <option value="qr">Solo QR</option>
            <option value="geo">Solo Geolocalizzazione</option>
            <option value="manual">Manuale</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Durata stimata (min)</label>
          <input name="duration" type="number" defaultValue={defaults?.duration || "15"}
            className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-1">Testo narrativo (mostrato dopo il puzzle)</label>
        <textarea name="narrative" rows={4} defaultValue={defaults?.narrative}
          className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white" />
      </div>
      <button type="submit" disabled={saving}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium">
        {saving ? "Salvo..." : "Salva tappa"}
      </button>
    </form>
  );
}

