import { createClient } from "npm:@supabase/supabase-js@2";

// Client with the user's JWT — respects RLS
export function createUserClient(req: Request) {
  const authHeader = req.headers.get("Authorization")!;
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authHeader } },
    }
  );
}

// Service role client — bypasses RLS, use with care
export function createServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}
