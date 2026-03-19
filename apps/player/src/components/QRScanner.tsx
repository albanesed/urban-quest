"use client";

import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  onScan: (token: string) => void;
  onError?: (err: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        // extract token from URL like https://play.urbanquest.it/scan/{token}
        const url = result.data;
        const match = url.match(/\/scan\/([a-f0-9]+)$/i);
        if (match) {
          scanner.stop();
          onScan(match[1]);
          // don't destroy — parent can re-trigger by remounting if verify fails
        }
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scannerRef.current = scanner;
    scanner.start().catch(() => {
      onError?.("Impossibile accedere alla fotocamera");
      setShowManual(true);
    });

    return () => scanner.destroy();
  }, [onScan, onError]);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!showManual && (
        <div className="relative w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-black">
          <video ref={videoRef} className="w-full h-full object-cover" />
        </div>
      )}

      <button
        onClick={() => setShowManual(!showManual)}
        className="text-sm text-indigo-400 underline"
      >
        {showManual ? "Usa fotocamera" : "Inserisci codice manualmente"}
      </button>

      {showManual && (
        <div className="flex gap-2 w-full max-w-sm">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Codice QR"
            className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-white"
          />
          <button
            onClick={handleManualSubmit}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-white font-medium"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
}
