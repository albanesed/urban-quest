"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

export default function NewGamePage() {
  const router = useRouter();
  const { loading: authLoading, operatorId } = useRequireAuth();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!operatorId) return;

    setSaving(true);
    const form = new FormData(e.currentTarget);

    const title = form.get("title") as string;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data, error } = await supabase
      .from("games")
      .insert({
        operator_id: operatorId,
        title,
        slug,
        city: form.get("city") as string,
        description: form.get("description") as string,
        difficulty: form.get("difficulty") as string,
        duration_min: parseInt(form.get("duration") as string) || 120,
        min_players: parseInt(form.get("minPlayers") as string) || 2,
        max_players: parseInt(form.get("maxPlayers") as string) || 6,
      })
      .select("id")
      .single();

    if (error) {
      alert(`Errore: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push(`/games/${data.id}`);
  };

  if (authLoading) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Nuovo gioco</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Titolo" name="title" required />
          <Field label="Città" name="city" required />
          <div>
            <label className="text-sm text-gray-400 block mb-1">Descrizione</label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Difficoltà</label>
              <select name="difficulty" className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white">
                <option value="easy">Facile</option>
                <option value="medium" selected>Medio</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
            <Field label="Durata (min)" name="duration" type="number" defaultValue="120" />
            <Field label="Min giocatori" name="minPlayers" type="number" defaultValue="2" />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium"
          >
            {saving ? "Salvo..." : "Crea gioco"}
          </button>
        </form>
      </main>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-sm text-gray-400 block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
      />
    </div>
  );
}
