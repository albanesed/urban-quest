-- Operators: escape room businesses, tour operators, local tourism boards
CREATE TABLE operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    website TEXT,
    stripe_customer_id TEXT,
    plan operator_plan DEFAULT 'free',
    settings JSONB DEFAULT '{
        "branding": {
            "primary_color": "#E94560",
            "secondary_color": "#1A1A2E",
            "logo_url": null
        },
        "notifications": {
            "email_on_booking": true,
            "email_on_completion": true
        }
    }'::jsonb,
    max_games INTEGER DEFAULT 1,
    max_stages_per_game INTEGER DEFAULT 5,
    max_sessions_per_month INTEGER DEFAULT 20,
    commission_rate DECIMAL(4,2) DEFAULT 15.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games: individual escape room experiences in a city
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'IT',
    status game_status DEFAULT 'draft',
    difficulty game_difficulty DEFAULT 'medium',
    price_cents INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'EUR',
    duration_min INTEGER DEFAULT 120,
    min_players INTEGER DEFAULT 2,
    max_players INTEGER DEFAULT 6,
    cover_image_url TEXT,
    locale TEXT DEFAULT 'it',
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(operator_id, slug)
);

-- Stages: geo-located checkpoints within a game
CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    radius_m INTEGER DEFAULT 50,
    unlock_method unlock_method DEFAULT 'qr_and_geo',
    qr_code_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    narrative_text TEXT,
    narrative_audio_url TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,
    estimated_duration_min INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id, order_index)
);

-- Puzzles: questions tied to a stage
CREATE TABLE puzzles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 1,
    type puzzle_type DEFAULT 'text',
    question TEXT NOT NULL,
    question_media_url TEXT,
    answer_hash TEXT NOT NULL,  -- bcrypt hash of the correct answer (lowercased, trimmed)
    answer_display TEXT,  -- shown after solving
    options JSONB,  -- for multiple_choice: [{"id": "a", "text": "Option A"}, ...]
    hints JSONB DEFAULT '[]'::jsonb,  -- [{"order": 1, "text": "hint text"}, ...]
    points INTEGER DEFAULT 100,
    penalty_per_hint INTEGER DEFAULT 25,
    time_limit_s INTEGER,  -- null = unlimited
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stage_id, order_index)
);

-- Sessions: a team's playthrough of a game
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE RESTRICT,
    auth_user_id UUID REFERENCES auth.users(id),  -- always set via Anonymous Auth
    team_name TEXT NOT NULL,
    player_count INTEGER DEFAULT 1,
    status session_status DEFAULT 'active',
    access_code TEXT UNIQUE NOT NULL,
    current_stage_index INTEGER DEFAULT 1,
    total_score INTEGER DEFAULT 0,
    total_hints_used INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    stripe_payment_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Per-stage progress within a session
CREATE TABLE session_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    status stage_progress_status DEFAULT 'locked',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    score INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    answers_log JSONB DEFAULT '[]'::jsonb,  -- [{answer, correct, timestamp}]
    geo_verified BOOLEAN DEFAULT FALSE,
    qr_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, stage_id)
);

-- Leaderboard: one row per completed session, rank computed on write
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    player_count INTEGER,
    total_score INTEGER NOT NULL,
    total_time_s INTEGER NOT NULL,
    total_hints_used INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL,
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(game_id, session_id)
);
