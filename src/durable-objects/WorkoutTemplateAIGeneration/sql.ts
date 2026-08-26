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
  saved_id INTEGER NULL,
  workout_templates TEXT NOT NULL,
  pending BOOLEAN NOT NULL DEFAULT true,
  error BOOLEAN NOT NULL DEFAULT false,

  FOREIGN KEY (session_id)
      REFERENCES session(id)
      ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_prompt_result (
  id INTEGER PRIMARY KEY,
  session_prompt_id INTEGER NOT NULL,
  result TEXT NOT NULL,

  FOREIGN KEY (session_prompt_id)
      REFERENCES session_prompt(id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_prompt_session_id
  ON session_prompt(session_id);

CREATE INDEX IF NOT EXISTS idx_session_prompt_result_session_prompt_id
  ON session_prompt_result(session_prompt_id);
`;
