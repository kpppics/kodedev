-- ==========================================
-- PROMPTCRAFT ACADEMY — PostgreSQL Schema
-- ==========================================
-- Run with: psql -d promptcraft -f schema.sql
-- ==========================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- ==========================================
-- USERS (parents and teachers)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('parent', 'teacher')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- CHILDREN
-- ==========================================
CREATE TABLE IF NOT EXISTS children (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username            TEXT UNIQUE NOT NULL,
  display_name        TEXT NOT NULL,
  age                 INTEGER NOT NULL CHECK (age BETWEEN 4 AND 17),
  pin_hash            TEXT NOT NULL,          -- bcrypt-hashed 4-digit PIN
  xp                  INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level               INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  streak              INTEGER NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_active         DATE,
  consent_given_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- PROJECTS
-- ==========================================
-- user_id references either users.id or children.id (polymorphic).
-- This is intentional: teachers can also create sample projects.
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,               -- child or teacher
  track_id      TEXT NOT NULL CHECK (track_id IN (
                  'story-studio','web-builder','game-maker',
                  'art-factory','music-maker','code-explainer')),
  title         TEXT NOT NULL,
  prompt        TEXT NOT NULL,
  result        TEXT NOT NULL,
  prompt_score  JSONB,                        -- { clarity, creativity, context, result, overall, feedback, suggestions }
  score_overall INTEGER GENERATED ALWAYS AS (
    COALESCE((prompt_score->>'overall')::integer, 0)
  ) STORED,
  is_public     BOOLEAN NOT NULL DEFAULT FALSE,
  likes         INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  remixed_from  UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- XP EVENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS xp_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  event_type  TEXT NOT NULL,                 -- 'project_created', 'quest_completed', 'level_up', etc.
  xp_amount   INTEGER NOT NULL DEFAULT 0,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- BADGES
-- ==========================================
CREATE TABLE IF NOT EXISTS badge_awards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  badge_id    TEXT NOT NULL,
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- ==========================================
-- DAILY QUESTS
-- ==========================================
CREATE TABLE IF NOT EXISTS daily_quests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  track_id    TEXT CHECK (track_id IN (
                'story-studio','web-builder','game-maker',
                'art-factory','music-maker','code-explainer')),
  xp_reward   INTEGER NOT NULL DEFAULT 100 CHECK (xp_reward > 0),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 day'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- QUEST COMPLETIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS quest_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  quest_id     UUID NOT NULL REFERENCES daily_quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, quest_id)
);

-- ==========================================
-- PROMPT BATTLES
-- ==========================================
CREATE TABLE IF NOT EXISTS battles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge      TEXT NOT NULL,
  track_id       TEXT NOT NULL,
  starts_at      TIMESTAMPTZ NOT NULL,
  ends_at        TIMESTAMPTZ NOT NULL,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  status         TEXT NOT NULL DEFAULT 'upcoming'
                   CHECK (status IN ('upcoming','active','voting','completed')),
  winner_id      UUID,                       -- references children.id
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- BATTLE ENTRIES
-- ==========================================
CREATE TABLE IF NOT EXISTS battle_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id   UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL,
  prompt      TEXT NOT NULL,
  result      TEXT NOT NULL,
  votes       INTEGER NOT NULL DEFAULT 0 CHECK (votes >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (battle_id, user_id)
);

-- ==========================================
-- SAVED PROMPTS (Library)
-- ==========================================
CREATE TABLE IF NOT EXISTS saved_prompts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  prompt       TEXT NOT NULL,
  track_id     TEXT NOT NULL,
  score        INTEGER NOT NULL DEFAULT 0,
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  remix_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- SUBSCRIPTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier                   TEXT NOT NULL CHECK (tier IN ('free','junior','family','classroom')),
  status                 TEXT NOT NULL CHECK (status IN ('active','expired','cancelled')),
  is_lifetime            BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at             TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_active_user
  ON subscriptions (user_id)
  WHERE status = 'active';

-- ==========================================
-- CLASSROOMS
-- ==========================================
CREATE TABLE IF NOT EXISTS classrooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  join_code   TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- CLASSROOM STUDENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS classroom_students (
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  child_id     UUID NOT NULL,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (classroom_id, child_id)
);

-- ==========================================
-- CLASSROOM CHALLENGES
-- ==========================================
CREATE TABLE IF NOT EXISTS classroom_challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  track_id     TEXT NOT NULL,
  due_date     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- CLASSROOM SUBMISSIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS classroom_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES classroom_challenges(id) ON DELETE CASCADE,
  child_id     UUID NOT NULL,
  project_id   UUID REFERENCES projects(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade        TEXT,
  feedback     TEXT,
  UNIQUE (challenge_id, child_id)
);

-- ==========================================
-- SCREEN TIME SETTINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS screen_time_settings (
  child_id        UUID PRIMARY KEY,
  daily_limit_min INTEGER NOT NULL DEFAULT 120 CHECK (daily_limit_min >= 15),
  allowed_start   TIME NOT NULL DEFAULT '07:00',
  allowed_end     TIME NOT NULL DEFAULT '21:00',
  break_reminder  INTEGER NOT NULL DEFAULT 30 CHECK (break_reminder >= 5),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id    ON projects (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_public      ON projects (is_public, created_at DESC) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_projects_track       ON projects (track_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id   ON xp_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_type      ON xp_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_badge_awards_user    ON badge_awards (user_id);
CREATE INDEX IF NOT EXISTS idx_battles_status       ON battles (status, ends_at);
CREATE INDEX IF NOT EXISTS idx_battle_entries_battle ON battle_entries (battle_id, votes DESC);
CREATE INDEX IF NOT EXISTS idx_quest_completions_user ON quest_completions (user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_children_parent_id   ON children (parent_id);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_user   ON saved_prompts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_prompts_public ON saved_prompts (is_public, created_at DESC) WHERE is_public = TRUE;

-- ==========================================
-- SEED: sample daily quests (idempotent)
-- ==========================================
INSERT INTO daily_quests (id, title, description, track_id, xp_reward, expires_at)
SELECT
  gen_random_uuid(),
  title,
  description,
  track_id,
  xp_reward,
  NOW() + INTERVAL '1 day'
FROM (VALUES
  ('Story Starter', 'Write a story about an unexpected friendship between two unlikely characters', 'story-studio', 100),
  ('Web Wonder', 'Build a webpage that shows your favourite hobby', 'web-builder', 100),
  ('Game On!', 'Create a simple quiz game about any topic you love', 'game-maker', 150),
  ('Art Dreams', 'Generate a prompt for a magical underwater city', 'art-factory', 75),
  ('Music Mood', 'Describe the perfect song for a rainy afternoon', 'music-maker', 75),
  ('Code Detective', 'Explain what a "for loop" does to a 5-year-old', 'code-explainer', 100)
) AS q(title, description, track_id, xp_reward)
WHERE NOT EXISTS (
  SELECT 1 FROM daily_quests WHERE title = q.title AND expires_at > NOW()
);
