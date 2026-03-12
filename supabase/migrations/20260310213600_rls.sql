-- Enable RLS on all tables
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- OPERATORS: owners see only their own record
CREATE POLICY "operators_select_own" ON operators FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "operators_update_own" ON operators FOR UPDATE USING (auth.uid() = auth_user_id);
CREATE POLICY "operators_insert_own" ON operators FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- GAMES: published games visible to everyone, drafts only to owner
CREATE POLICY "games_select_published" ON games FOR SELECT USING (
    status = 'published' OR
    operator_id IN (SELECT id FROM operators WHERE auth_user_id = auth.uid())
);
CREATE POLICY "games_insert_owner" ON games FOR INSERT WITH CHECK (
    operator_id IN (SELECT id FROM operators WHERE auth_user_id = auth.uid())
);
CREATE POLICY "games_update_owner" ON games FOR UPDATE USING (
    operator_id IN (SELECT id FROM operators WHERE auth_user_id = auth.uid())
);
CREATE POLICY "games_delete_owner" ON games FOR DELETE USING (
    operator_id IN (SELECT id FROM operators WHERE auth_user_id = auth.uid())
    AND status = 'draft'
);

-- STAGES: visible if game is published or operator owns it
CREATE POLICY "stages_select" ON stages FOR SELECT USING (
    game_id IN (SELECT id FROM games WHERE status = 'published')
    OR game_id IN (SELECT g.id FROM games g JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid())
);
CREATE POLICY "stages_insert_owner" ON stages FOR INSERT WITH CHECK (
    game_id IN (SELECT g.id FROM games g JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid())
);
CREATE POLICY "stages_update_owner" ON stages FOR UPDATE USING (
    game_id IN (SELECT g.id FROM games g JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid())
);
CREATE POLICY "stages_delete_owner" ON stages FOR DELETE USING (
    game_id IN (SELECT g.id FROM games g JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid())
);

-- PUZZLES: operator sees own, player sees puzzles for unlocked stages in their session
-- Note: Anonymous Auth guarantees auth_user_id is never NULL, so the IS NULL
-- vulnerability from the original spec is eliminated structurally.
CREATE POLICY "puzzles_select" ON puzzles FOR SELECT USING (
    stage_id IN (
        SELECT s.id FROM stages s
        JOIN games g ON s.game_id = g.id
        JOIN operators o ON g.operator_id = o.id
        WHERE o.auth_user_id = auth.uid()
    )
    OR
    stage_id IN (
        SELECT sp.stage_id FROM session_progress sp
        JOIN sessions ses ON sp.session_id = ses.id
        WHERE sp.status IN ('unlocked', 'in_progress', 'completed')
        AND ses.auth_user_id = auth.uid()
    )
);
CREATE POLICY "puzzles_insert_owner" ON puzzles FOR INSERT WITH CHECK (
    stage_id IN (
        SELECT s.id FROM stages s JOIN games g ON s.game_id = g.id JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid()
    )
);
CREATE POLICY "puzzles_update_owner" ON puzzles FOR UPDATE USING (
    stage_id IN (
        SELECT s.id FROM stages s JOIN games g ON s.game_id = g.id JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid()
    )
);
CREATE POLICY "puzzles_delete_owner" ON puzzles FOR DELETE USING (
    stage_id IN (
        SELECT s.id FROM stages s JOIN games g ON s.game_id = g.id JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid()
    )
);

-- SESSIONS: players see their own, operators see sessions for their games
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (
    auth_user_id = auth.uid()
    OR game_id IN (SELECT g.id FROM games g JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid())
);
CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (true);  -- controlled by edge function
CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (
    auth_user_id = auth.uid()
    OR game_id IN (SELECT g.id FROM games g JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid())
);

-- SESSION_PROGRESS: players see own session progress, operators see their games' progress
CREATE POLICY "progress_select" ON session_progress FOR SELECT USING (
    session_id IN (SELECT id FROM sessions WHERE auth_user_id = auth.uid())
    OR session_id IN (
        SELECT s.id FROM sessions s JOIN games g ON s.game_id = g.id JOIN operators o ON g.operator_id = o.id WHERE o.auth_user_id = auth.uid()
    )
);
CREATE POLICY "progress_insert" ON session_progress FOR INSERT WITH CHECK (true);  -- controlled by edge function
CREATE POLICY "progress_update" ON session_progress FOR UPDATE USING (true);  -- controlled by edge function

-- LEADERBOARD: public read for published games
CREATE POLICY "leaderboard_select" ON leaderboard FOR SELECT USING (
    game_id IN (SELECT id FROM games WHERE status = 'published')
);
CREATE POLICY "leaderboard_insert" ON leaderboard FOR INSERT WITH CHECK (true);  -- controlled by edge function
