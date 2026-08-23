export const initialWorkoutTemplateDDL = `

CREATE TABLE IF NOT EXISTS session (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  saved_id INTEGER NULL
);

CREATE TABLE IF NOT EXISTS session_prompt (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  prompt TEXT NOT NULL,
  workout_templates TEXT NOT NULL,
  result TEXT,
  pending BOOLEAN NOT NULL DEFAULT TRUE,
  error BOOLEAN NOT NULL DEFAULT FALSE,

  FOREIGN KEY (session_id)
      REFERENCES session(id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_prompt_session_id
  ON session_prompt(session_id);
`;
