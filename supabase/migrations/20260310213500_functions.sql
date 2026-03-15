-- Atomic player count increment — avoids read-then-write race in join-session
CREATE OR REPLACE FUNCTION increment_player_count(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE sessions SET player_count = player_count + 1 WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Generate a unique access code like "A3F1-C9D2"
-- Uses md5 hex chars (0-9, A-F) — not full alphanumeric but good enough for MVP
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        code := upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));
        SELECT EXISTS(SELECT 1 FROM sessions WHERE access_code = code) INTO exists_already;
        EXIT WHEN NOT exists_already;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;
