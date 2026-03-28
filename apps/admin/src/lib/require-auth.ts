"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

// hook that redirects to login if not authenticated
export function useRequireAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [operatorId, setOperatorId] = useState<string | null>(null);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }

      // check if operator record exists
      const { data: operator } = await supabase
        .from("operators")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (operator) {
        setOperatorId(operator.id);
      }
      setLoading(false);
    }
    check();
  }, [router]);

  return { loading, operatorId };
}
