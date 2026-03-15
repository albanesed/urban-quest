import { handleCors } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { access_code } = await req.json();
    if (!access_code) return errorResponse("access_code is required");

    const userClient = createUserClient(req);
    const serviceClient = createServiceClient();

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return errorResponse("not authenticated", 401);

    // find session by access code
    const { data: session, error: sessionErr } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("access_code", access_code.toUpperCase().trim())
      .single();

    if (sessionErr || !session) return errorResponse("session not found", 404);
    if (session.status !== "active")
      return errorResponse("session is not active");

    // check expiry
    if (new Date(session.expires_at) < new Date())
      return errorResponse("session has expired");

    // increment player count atomically to avoid race conditions
    await serviceClient.rpc("increment_player_count", {
      p_session_id: session.id,
    });

    // fetch current progress
    const { data: progress } = await serviceClient
      .from("session_progress")
      .select("*, stage:stages!inner(order_index, title)")
      .eq("session_id", session.id)
      .order("order_index", { referencedTable: "stages", ascending: true });

    return jsonResponse({
      session_id: session.id,
      team_name: session.team_name,
      game_id: session.game_id,
      current_stage_index: session.current_stage_index,
      total_score: session.total_score,
      progress,
    });
  } catch (err) {
    return errorResponse(`unexpected error: ${err}`, 500);
  }
});
