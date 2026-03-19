import { supabase } from "./supabase";
import { generateAnonymousName } from "./names";

/**
 * Makes sure we always have some kind of auth session.
 * If the user isn't logged in, creates an anonymous account
 * with a fun Italian name. The user never sees a login form.
 */
export async function ensureAnonymousSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session;

  const name = generateAnonymousName();
  const { data, error } = await supabase.auth.signInAnonymously({
    options: { data: { display_name: name } },
  });

  if (error) {
    console.error("anonymous sign-in failed:", error);
    return null;
  }

  return data.session;
}
