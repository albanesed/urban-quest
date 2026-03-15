-- Used by check-answer edge function when a game is completed
CREATE OR REPLACE FUNCTION recompute_leaderboard_ranks(p_game_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE leaderboard SET rank = sub.r
    FROM (
        SELECT id, RANK() OVER (ORDER BY total_score DESC, total_time_s ASC) AS r
        FROM leaderboard WHERE game_id = p_game_id
    ) sub
    WHERE leaderboard.id = sub.id;
END;
$$ LANGUAGE plpgsql;
