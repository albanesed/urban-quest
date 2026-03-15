import { handleCors } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase.ts";
import { generateAnonymousName } from "../_shared/names.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { game_id, team_name, player_count } = await req.json();
    if (!game_id) return errorResponse("game_id is required");

    const userClient = createUserClient(req);
    const serviceClient = createServiceClient();

    // get the user from JWT
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return errorResponse("not authenticated", 401);

    // verify game exists and is published
    const { data: game, error: gameErr } = await serviceClient
      .from("games")
      .select("id, status")
      .eq("id", game_id)
      .single();

    if (gameErr || !game) return errorResponse("game not found", 404);
    if (game.status !== "published")
      return errorResponse("can't start a session on an unpublished game");

    // generate access code
    const { data: codeResult } = await serviceClient.rpc(
      "generate_access_code"
    );
    const accessCode = codeResult as string;

    const finalTeamName = team_name || generateAnonymousName();

    // create session
    const { data: session, error: sessionErr } = await serviceClient
      .from("sessions")
      .insert({
        game_id,
        auth_user_id: user.id,
        team_name: finalTeamName,
        player_count: player_count || 1,
        access_code: accessCode,
      })
      .select()
      .single();

    if (sessionErr) return errorResponse(`session creation failed: ${sessionErr.message}`, 500);

    // get all stages for this game, ordered
    const { data: stages } = await serviceClient
      .from("stages")
      .select("id, order_index")
      .eq("game_id", game_id)
      .order("order_index");

    if (!stages || stages.length === 0)
      return errorResponse("game has no stages", 500);

    // create progress rows: first stage unlocked, rest locked
    const progressRows = stages.map((stage, i) => ({
      session_id: session.id,
      stage_id: stage.id,
      status: i === 0 ? "unlocked" : "locked",
    }));

    const { error: progressErr } = await serviceClient
      .from("session_progress")
      .insert(progressRows);

    if (progressErr)
      return errorResponse(`progress init failed: ${progressErr.message}`, 500);

    return jsonResponse({
      session_id: session.id,
      access_code: accessCode,
      team_name: finalTeamName,
    });
  } catch (err) {
    return errorResponse(`unexpected error: ${err}`, 500);
  }
});
