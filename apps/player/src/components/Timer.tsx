"use client";

import { useState, useEffect } from "react";

// simple elapsed time display, nothing fancy
export default function Timer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <span className="font-mono text-gray-400">
      {hours > 0 ? `${pad(hours)}:` : ""}
      {pad(minutes)}:{pad(seconds)}
    </span>
  );
}
