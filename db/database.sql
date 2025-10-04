DO $$ BEGIN
  CREATE TYPE question_type AS ENUM ('multi', 'single', 'true_false', 'fill_blank');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS topic (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  user_id INTEGER,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS question (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  type question_type NOT NULL
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

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS topic_set_updated_at ON topic;
CREATE TRIGGER topic_set_updated_at
BEFORE UPDATE ON topic
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

