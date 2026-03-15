import { handleCors } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";

// This mostly duplicates what check-answer does on the last stage.
// I went back and forth on whether to keep this as a separate endpoint
// or just handle everything in check-answer. Keeping it for now because
// it's handy for debugging and in case a session gets stuck somehow.

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { session_id } = await req.json();
    if (!session_id) return errorResponse("session_id is required");

    const userClient = createUserClient(req);
    const serviceClient = createServiceClient();

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return errorResponse("not authenticated", 401);

    const { data: session } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .eq("auth_user_id", user.id)
      .single();

    if (!session) return errorResponse("session not found", 404);

    // check all stages are completed
    const { data: progress } = await serviceClient
      .from("session_progress")
      .select("status")
      .eq("session_id", session_id);

    const allCompleted = progress?.every((p) => p.status === "completed");
    if (!allCompleted)
      return errorResponse("not all stages are completed");

    // if session is already completed, just return the results
    if (session.status === "completed") {
      const { data: entry } = await serviceClient
        .from("leaderboard")
        .select("*")
        .eq("session_id", session_id)
        .single();

      return jsonResponse({
        total_score: session.total_score,
        total_time_s: entry?.total_time_s,
        rank: entry?.rank,
        team_name: session.team_name,
      });
    }

    // complete the session
    const completedAt = new Date().toISOString();
    await serviceClient
      .from("sessions")
      .update({ status: "completed", completed_at: completedAt })
      .eq("id", session_id);

    const totalTimeS = Math.round(
      (new Date(completedAt).getTime() -
        new Date(session.started_at).getTime()) /
        1000
    );

    await serviceClient.from("leaderboard").insert({
      game_id: session.game_id,
      session_id: session.id,
      team_name: session.team_name,
      player_count: session.player_count,
      total_score: session.total_score,
      total_time_s: totalTimeS,
      total_hints_used: session.total_hints_used,
      completed_at: completedAt,
    });

    await serviceClient.rpc("recompute_leaderboard_ranks", {
      p_game_id: session.game_id,
    });

    // fetch the rank we just got
    const { data: entry } = await serviceClient
      .from("leaderboard")
      .select("rank")
      .eq("session_id", session_id)
      .single();

    return jsonResponse({
      total_score: session.total_score,
      total_time_s: totalTimeS,
      rank: entry?.rank,
      team_name: session.team_name,
    });
  } catch (err) {
    return errorResponse(`unexpected error: ${err}`, 500);
  }
});
