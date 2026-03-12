CREATE TYPE operator_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE game_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE game_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE unlock_method AS ENUM ('qr', 'geo', 'qr_and_geo', 'manual');
CREATE TYPE puzzle_type AS ENUM ('text', 'multiple_choice', 'numeric', 'photo');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
CREATE TYPE stage_progress_status AS ENUM ('locked', 'unlocked', 'in_progress', 'completed');
