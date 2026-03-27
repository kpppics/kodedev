-- ==========================================
-- PROMPTCRAFT ACADEMY — PostgreSQL Schema
-- ==========================================

-- Users (parents and teachers)
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('parent', 'teacher')),
  display_name TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Child profiles
CREATE TABLE children (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar      TEXT DEFAULT '🧒',
  age         INTEGER NOT NULL CHECK (age BETWEEN 4 AND 18),
  pin         TEXT NOT NULL,             -- hashed parent PIN for child login
  xp          INTEGER DEFAULT 0,
  level       INTEGER DEFAULT 1,
  streak      INTEGER DEFAULT 0,
  last_active DATE,
  safe_mode   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  track_id    TEXT NOT NULL,
  title       TEXT NOT NULL,
  prompt      TEXT NOT NULL,
  result      TEXT NOT NULL,
  score_clarity     INTEGER DEFAULT 0,
  score_creativity  INTEGER DEFAULT 0,
  score_context     INTEGER DEFAULT 0,
  score_result      INTEGER DEFAULT 0,
  score_overall     INTEGER DEFAULT 0,
  score_feedback    TEXT,
  is_public   BOOLEAN DEFAULT FALSE,
  likes       INTEGER DEFAULT 0,
  remixed_from UUID REFERENCES projects(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- XP events log
CREATE TABLE xp_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Badge awards
CREATE TABLE badge_awards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  badge_id    TEXT NOT NULL,
  earned_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, badge_id)
);

-- Daily quests
CREATE TABLE daily_quests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  track_id    TEXT,
  xp_reward   INTEGER NOT NULL DEFAULT 100,
  date        DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Quest completions
CREATE TABLE quest_completions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  quest_id    UUID NOT NULL REFERENCES daily_quests(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, quest_id)
);

-- Prompt battles
CREATE TABLE battles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge   TEXT NOT NULL,
  track_id    TEXT NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  voting_ends_at TIMESTAMPTZ NOT NULL,
  status      TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','voting','completed')),
  winner_id   UUID REFERENCES children(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Battle entries
CREATE TABLE battle_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id   UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  prompt      TEXT NOT NULL,
  result      TEXT NOT NULL,
  votes       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battle_id, child_id)
);

-- Saved prompts library
CREATE TABLE saved_prompts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  prompt      TEXT NOT NULL,
  track_id    TEXT NOT NULL,
  score       INTEGER DEFAULT 0,
  is_public   BOOLEAN DEFAULT FALSE,
  remix_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier        TEXT NOT NULL CHECK (tier IN ('free','junior','family','classroom')),
  status      TEXT NOT NULL CHECK (status IN ('active','expired','cancelled')),
  is_lifetime BOOLEAN DEFAULT FALSE,
  starts_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Classrooms
CREATE TABLE classrooms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  join_code   TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Classroom students
CREATE TABLE classroom_students (
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  joined_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(classroom_id, child_id)
);

-- Classroom challenges
CREATE TABLE classroom_challenges (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  track_id    TEXT NOT NULL,
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Classroom submissions
CREATE TABLE classroom_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID NOT NULL REFERENCES classroom_challenges(id) ON DELETE CASCADE,
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  project_id    UUID REFERENCES projects(id),
  submitted_at  TIMESTAMPTZ DEFAULT NOW(),
  grade         TEXT,
  feedback      TEXT,
  UNIQUE(challenge_id, child_id)
);

-- Screen time settings
CREATE TABLE screen_time_settings (
  child_id        UUID PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
  daily_limit_min INTEGER DEFAULT 120,
  allowed_start   TIME DEFAULT '07:00',
  allowed_end     TIME DEFAULT '21:00',
  break_reminder  INTEGER DEFAULT 30,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_projects_child     ON projects(child_id, created_at DESC);
CREATE INDEX idx_projects_public    ON projects(is_public, created_at DESC) WHERE is_public;
CREATE INDEX idx_xp_events_child    ON xp_events(child_id, created_at DESC);
CREATE INDEX idx_badge_awards_child ON badge_awards(child_id);
CREATE INDEX idx_battles_status     ON battles(status, ends_at);
