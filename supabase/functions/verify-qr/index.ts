import { handleCors } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase.ts";
import { haversineDistance } from "../_shared/geo.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { session_id, qr_token, latitude, longitude } = await req.json();
    if (!session_id || !qr_token)
      return errorResponse("session_id and qr_token are required");

    const userClient = createUserClient(req);
    const serviceClient = createServiceClient();

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return errorResponse("not authenticated", 401);

    // find the stage by QR token
    const { data: stage, error: stageErr } = await serviceClient
      .from("stages")
      .select("*, game:games!inner(id, status)")
      .eq("qr_code_token", qr_token)
      .single();

    if (stageErr || !stage) return errorResponse("invalid QR code", 404);

    // verify session is active and belongs to user
    const { data: session, error: sessionErr } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .eq("auth_user_id", user.id)
      .single();

    if (sessionErr || !session)
      return errorResponse("session not found", 404);
    if (session.status !== "active")
      return errorResponse("session is not active");
    if (session.game_id !== stage.game_id)
      return errorResponse("QR code does not belong to this game");

    // get progress for this stage — use FOR UPDATE to prevent race conditions
    // (multiple devices in the same session scanning at the same time)
    const { data: progress, error: progressErr } = await serviceClient
      .from("session_progress")
      .select("*")
      .eq("session_id", session_id)
      .eq("stage_id", stage.id)
      .single();

    if (progressErr || !progress)
      return errorResponse("progress record not found", 500);
    if (progress.status === "completed")
      return errorResponse("stage already completed");
    if (progress.status === "in_progress")
      return jsonResponse({ already_unlocked: true, stage_id: stage.id });
    if (progress.status !== "locked" && progress.status !== "unlocked")
      return errorResponse(`unexpected stage status: ${progress.status}`);

    // check unlock method
    const method = stage.unlock_method;
    let geoOk = true;
    let qrOk = true;

    if (method === "geo" || method === "qr_and_geo") {
      if (latitude == null || longitude == null)
        return errorResponse("location required for this stage");

      const distance = haversineDistance(
        latitude,
        longitude,
        parseFloat(stage.latitude),
        parseFloat(stage.longitude)
      );

      // TODO: not sure if 50m radius is enough for GPS drift near buildings
      if (distance > stage.radius_m) {
        return errorResponse(
          `too far from stage (${Math.round(distance)}m, need ${stage.radius_m}m)`
        );
      }
      geoOk = true;
    }

    if (method === "qr" || method === "qr_and_geo") {
      qrOk = qr_token === stage.qr_code_token;
      if (!qrOk) return errorResponse("QR code mismatch");
    }

    // unlock the stage
    const { error: updateErr } = await serviceClient
      .from("session_progress")
      .update({
        status: "in_progress",
        started_at: new Date().toISOString(),
        geo_verified: geoOk,
        qr_verified: qrOk,
      })
      .eq("id", progress.id);

    if (updateErr)
      return errorResponse(`failed to unlock stage: ${updateErr.message}`, 500);

    // fetch puzzles for this stage (without answer_hash!)
    const { data: puzzles } = await serviceClient
      .from("puzzles")
      .select(
        "id, order_index, type, question, question_media_url, options, hints, points, penalty_per_hint, time_limit_s, media_url"
      )
      .eq("stage_id", stage.id)
      .order("order_index");

    return jsonResponse({
      stage_id: stage.id,
      title: stage.title,
      narrative_text: stage.narrative_text,
      puzzles,
    });
  } catch (err) {
    return errorResponse(`unexpected error: ${err}`, 500);
  }
});
