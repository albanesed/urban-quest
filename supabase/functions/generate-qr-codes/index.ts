import QRCode from "npm:qrcode@1.5.3";
import { handleCors } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";

const PLAYER_BASE_URL =
  Deno.env.get("PLAYER_URL") || "https://play.urbanquest.it";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { game_id } = await req.json();
    if (!game_id) return errorResponse("game_id is required");

    const userClient = createUserClient(req);
    const serviceClient = createServiceClient();

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return errorResponse("not authenticated", 401);

    // verify operator owns this game
    const { data: game } = await serviceClient
      .from("games")
      .select("id, operator:operators!inner(auth_user_id)")
      .eq("id", game_id)
      .single();

    if (!game) return errorResponse("game not found", 404);
    if ((game.operator as any).auth_user_id !== user.id)
      return errorResponse("not your game", 403);

    // get all stages
    const { data: stages } = await serviceClient
      .from("stages")
      .select("id, order_index, qr_code_token")
      .eq("game_id", game_id)
      .order("order_index");

    if (!stages || stages.length === 0)
      return errorResponse("no stages found — did you forget to add them?");

    const results = [];

    for (const stage of stages) {
      const url = `${PLAYER_BASE_URL}/scan/${stage.qr_code_token}`;

      // generate QR as PNG buffer
      const pngBuffer = await QRCode.toBuffer(url, {
        type: "png",
        width: 600,
        margin: 2,
        errorCorrectionLevel: "H",
      });

      // upload to supabase storage
      const filePath = `${game_id}/stage-${stage.order_index}.png`;
      const { error: uploadErr } = await serviceClient.storage
        .from("qr-codes")
        .upload(filePath, pngBuffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadErr) {
        console.error(`upload failed for stage ${stage.order_index}:`, uploadErr);
        results.push({
          stage_id: stage.id,
          order_index: stage.order_index,
          qr_url: null,
          error: uploadErr.message,
        });
        continue;
      }

      const {
        data: { publicUrl },
      } = serviceClient.storage.from("qr-codes").getPublicUrl(filePath);

      results.push({
        stage_id: stage.id,
        order_index: stage.order_index,
        qr_url: publicUrl,
      });
    }

    return jsonResponse({ qr_codes: results });
  } catch (err) {
    return errorResponse(`unexpected error: ${err}`, 500);
  }
});
