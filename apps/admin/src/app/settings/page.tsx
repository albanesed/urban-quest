"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const { loading: authLoading, operatorId } = useRequireAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!operatorId) return;
    supabase
      .from("operators")
      .select("name, email, website")
      .eq("id", operatorId)
      .single()
      .then(({ data }) => {
        if (data) {
          setName(data.name);
          setEmail(data.email);
          setWebsite(data.website || "");
        }
      });
  }, [operatorId]);

  const handleSave = async () => {
    if (!operatorId) return;
    setSaving(true);
    await supabase
      .from("operators")
      .update({ name, email, website: website || null })
      .eq("id", operatorId);
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (authLoading) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Impostazioni</h1>

        <div className="space-y-4 mb-8">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Nome operatore</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Sito web</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white"
              placeholder="https://"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium"
          >
            {saving ? "Salvo..." : "Salva"}
          </button>
        </div>

        <hr className="border-gray-800 my-8" />

        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm"
        >
          Esci
        </button>
      </main>
    </div>
  );
}
