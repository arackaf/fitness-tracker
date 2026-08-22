export const initialWorkoutTemplateDDL = `

CREATE TABLE IF NOT EXISTS session (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS session_prompt (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  prompt TEXT NOT NULL,
  workout_templates TEXT NOT NULL,
  exercises TEXT NOT NULL,
  result TEXT,

  FOREIGN KEY (session_id)
      REFERENCES session(id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_prompt_session_id
  ON session_prompt(session_id);
`;
