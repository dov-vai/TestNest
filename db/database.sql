DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('multi', 'single', 'true_false', 'fill_blank');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  replaced_by_token TEXT
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

CREATE TABLE IF NOT EXISTS topic (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  type question_type NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS answer (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES question(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_idx INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_answer_question_id ON answer(question_id);

CREATE TABLE IF NOT EXISTS topic_question (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER NOT NULL REFERENCES topic(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES question(id) ON DELETE CASCADE,
  order_idx INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT uq_topic_question UNIQUE (topic_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_tq_topic_id ON topic_question(topic_id);
CREATE INDEX IF NOT EXISTS idx_tq_question_id ON topic_question(question_id);

CREATE TABLE IF NOT EXISTS user_topic_attempt (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topic(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  total_points INTEGER NOT NULL DEFAULT 0,
  earned_points INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_uta_user_id ON user_topic_attempt(user_id);
CREATE INDEX IF NOT EXISTS idx_uta_topic_id ON user_topic_attempt(topic_id);
CREATE INDEX IF NOT EXISTS idx_uta_user_topic ON user_topic_attempt(user_id, topic_id);

CREATE TABLE IF NOT EXISTS user_answer (
  id SERIAL PRIMARY KEY,
  attempt_id INTEGER NOT NULL REFERENCES user_topic_attempt(id) ON DELETE CASCADE,
  topic_question_id INTEGER NOT NULL REFERENCES topic_question(id) ON DELETE CASCADE,
  answer_id INTEGER REFERENCES answer(id) ON DELETE SET NULL,
  user_answer_text TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ua_attempt_id ON user_answer(attempt_id);
CREATE INDEX IF NOT EXISTS idx_ua_topic_question_id ON user_answer(topic_question_id);
CREATE INDEX IF NOT EXISTS idx_ua_answer_id ON user_answer(answer_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS topic_set_updated_at ON topic;
CREATE TRIGGER topic_set_updated_at
BEFORE UPDATE ON topic
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS question_set_updated_at ON question;
CREATE TRIGGER question_set_updated_at
BEFORE UPDATE ON question
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

