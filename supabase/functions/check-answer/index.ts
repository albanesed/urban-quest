import bcrypt from "npm:bcryptjs@2.4.3";
import { handleCors } from "../_shared/cors.ts";
import { createServiceClient, createUserClient } from "../_shared/supabase.ts";
import { errorResponse, jsonResponse } from "../_shared/errors.ts";

const MAX_ATTEMPTS_PER_MINUTE = 10;

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { session_id, puzzle_id, answer } = await req.json();
    if (!session_id || !puzzle_id || answer == null)
      return errorResponse("session_id, puzzle_id and answer are required");

    const userClient = createUserClient(req);
    const serviceClient = createServiceClient();

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return errorResponse("not authenticated", 401);

    // verify session
    const { data: session } = await serviceClient
      .from("sessions")
      .select("*")
      .eq("id", session_id)
      .eq("auth_user_id", user.id)
      .eq("status", "active")
      .single();

    if (!session) return errorResponse("active session not found", 404);

    // get puzzle with its stage
    const { data: puzzle } = await serviceClient
      .from("puzzles")
      .select("*, stage:stages!inner(id, game_id, order_index)")
      .eq("id", puzzle_id)
      .single();

    if (!puzzle) return errorResponse("puzzle not found", 404);
    if (puzzle.stage.game_id !== session.game_id)
      return errorResponse("puzzle does not belong to this game");

    // get progress for this stage
    const { data: progress } = await serviceClient
      .from("session_progress")
      .select("*")
      .eq("session_id", session_id)
      .eq("stage_id", puzzle.stage_id)
      .single();

    if (!progress) return errorResponse("progress not found", 500);
    if (progress.status === "completed")
      return errorResponse("stage already completed");
    if (progress.status !== "in_progress")
      return errorResponse("stage not yet unlocked");

    // rate limit — count recent attempts from answers_log
    const recentAttempts = (progress.answers_log as Array<{ timestamp: string }>)
      .filter((a) => {
        const t = new Date(a.timestamp).getTime();
        return Date.now() - t < 60_000;
      }).length;

    if (recentAttempts >= MAX_ATTEMPTS_PER_MINUTE)
      return errorResponse("too many attempts, wait a minute", 429);

    // normalize and compare — bcrypt.compare wants (plaintext, hash) not the other way around,
    // wasted an embarrassing amount of time on that
    const normalized = String(answer).toLowerCase().trim();
    const correct = await bcrypt.compare(normalized, puzzle.answer_hash);

    // log the attempt — don't store the actual answer text, just result
    const updatedLog = [
      ...(progress.answers_log as unknown[]),
      { correct, timestamp: new Date().toISOString(), attempt: progress.attempts + 1 },
    ];

    if (!correct) {
      await serviceClient
        .from("session_progress")
        .update({
          attempts: progress.attempts + 1,
          answers_log: updatedLog,
        })
        .eq("id", progress.id);

      return jsonResponse({
        correct: false,
        attempts: progress.attempts + 1,
      });
    }

    // correct answer — calculate score (no time penalty for MVP)
    const score = Math.max(
      0,
      puzzle.points - progress.hints_used * puzzle.penalty_per_hint
    );

    // mark stage as completed
    await serviceClient
      .from("session_progress")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        score,
        attempts: progress.attempts + 1,
        answers_log: updatedLog,
      })
      .eq("id", progress.id);

    // update session totals
    const newTotalScore = session.total_score + score;
    const newHints = session.total_hints_used + progress.hints_used;

    // find next locked stage (filter by status to avoid overwriting in_progress)
    const { data: nextStage } = await serviceClient
      .from("session_progress")
      .select("id, stage:stages!inner(order_index)")
      .eq("session_id", session_id)
      .eq("status", "locked")
      .order("order_index", { referencedTable: "stages", ascending: true })
      .limit(1)
      .maybeSingle();

    let gameCompleted = false;

    if (nextStage) {
      // more stages to go
      await serviceClient
        .from("sessions")
        .update({
          total_score: newTotalScore,
          total_hints_used: newHints,
          current_stage_index: session.current_stage_index + 1,
        })
        .eq("id", session_id);

      await serviceClient
        .from("session_progress")
        .update({ status: "unlocked" })
        .eq("id", nextStage.id);
    } else {
      // last stage — complete the game
      gameCompleted = true;
      const completedAt = new Date().toISOString();

      await serviceClient
        .from("sessions")
        .update({
          total_score: newTotalScore,
          total_hints_used: newHints,
          status: "completed",
          completed_at: completedAt,
        })
        .eq("id", session_id);

      const startedAt = new Date(session.started_at).getTime();
      const totalTimeS = Math.round(
        (new Date(completedAt).getTime() - startedAt) / 1000
      );

      // insert leaderboard entry — upsert to handle race condition
      // if two devices complete simultaneously
      const { error: lbErr } = await serviceClient.from("leaderboard").upsert(
        {
          game_id: session.game_id,
          session_id: session.id,
          team_name: session.team_name,
          player_count: session.player_count,
          total_score: newTotalScore,
          total_time_s: totalTimeS,
          total_hints_used: newHints,
          completed_at: completedAt,
        },
        { onConflict: "game_id,session_id" }
      );

      if (lbErr) console.error("leaderboard upsert failed:", lbErr);

      const { error: rankErr } = await serviceClient.rpc(
        "recompute_leaderboard_ranks",
        { p_game_id: session.game_id }
      );
      if (rankErr) console.error("rank recompute failed:", rankErr);
    }

    return jsonResponse({
      correct: true,
      score,
      answer_display: puzzle.answer_display,
      game_completed: gameCompleted,
      total_score: newTotalScore,
    });
  } catch (err) {
    return errorResponse(`unexpected error: ${err}`, 500);
  }
});
