import { Suspense } from "react";
import JoinContent from "./JoinContent";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-8 text-gray-400">Caricamento...</div>}>
      <JoinContent />
    </Suspense>
  );
}
