"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useRequireAuth } from "@/lib/require-auth";
import { supabase } from "@/lib/supabase";

interface QRResult {
  stage_id: string;
  order_index: number;
  qr_url: string | null;
  error?: string;
}

export default function QRCodesPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { loading: authLoading } = useRequireAuth();
  const [qrCodes, setQrCodes] = useState<QRResult[]>([]);
  const [generating, setGenerating] = useState(false);

  const generateAll = async () => {
    setGenerating(true);
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-qr-codes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ game_id: gameId }),
      }
    );

    const data = await res.json();
    setQrCodes(data.qr_codes || []);
    setGenerating(false);
  };

  if (authLoading) return <div className="p-8 text-gray-400">Caricamento...</div>;

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <Link href={`/games/${gameId}`} className="text-indigo-400 text-sm">← Gioco</Link>
        <h1 className="text-2xl font-bold mt-1 mb-6">QR Codes</h1>

        <button
          onClick={generateAll}
          disabled={generating}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg font-medium mb-6"
        >
          {generating ? "Genero..." : "Genera tutti i QR codes"}
        </button>

        {qrCodes.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {qrCodes.map((qr) => (
              <div key={qr.stage_id} className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-sm font-medium mb-2">Tappa {qr.order_index}</p>
                {qr.qr_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qr.qr_url} alt={`QR Tappa ${qr.order_index}`} className="mx-auto mb-2" />
                    <a
                      href={qr.qr_url}
                      download
                      className="text-indigo-400 text-xs hover:underline"
                    >
                      Scarica PNG
                    </a>
                  </>
                ) : (
                  <p className="text-red-400 text-xs">{qr.error || "Errore"}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
