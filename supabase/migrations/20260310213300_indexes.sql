-- Operators
CREATE INDEX idx_operators_auth_user ON operators(auth_user_id);
CREATE INDEX idx_operators_slug ON operators(slug);

-- Games
CREATE INDEX idx_games_operator ON games(operator_id);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_city ON games(city);

-- Stages
CREATE INDEX idx_stages_game ON stages(game_id);
CREATE INDEX idx_stages_qr_token ON stages(qr_code_token);

-- Puzzles
CREATE INDEX idx_puzzles_stage ON puzzles(stage_id);

-- Sessions
CREATE INDEX idx_sessions_game ON sessions(game_id);
CREATE INDEX idx_sessions_access_code ON sessions(access_code);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_auth_user ON sessions(auth_user_id);

-- Session progress
CREATE INDEX idx_progress_session ON session_progress(session_id);
CREATE INDEX idx_progress_stage ON session_progress(stage_id);
CREATE INDEX idx_progress_status ON session_progress(status);

-- Leaderboard
CREATE INDEX idx_leaderboard_game_score ON leaderboard(game_id, total_score DESC, total_time_s ASC);
