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

CREATE TABLE IF NOT EXISTS saved_workout_template_map (
  id INTEGER PRIMARY KEY,
  session_id INTEGER NOT NULL,
  uuid TEXT NOT NULL UNIQUE,
  saved_workout_template_id INTEGER NULL,

  FOREIGN KEY (session_id)
      REFERENCES session(id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_saved_workout_template_map_session_id
  ON saved_workout_template_map(session_id);

CREATE INDEX IF NOT EXISTS idx_saved_workout_template_map_uuid
  ON saved_workout_template_map(uuid);

CREATE TABLE IF NOT EXISTS chat_thread (
  thread_id TEXT PRIMARY KEY,
  messages_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_run (
  run_id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER NULL,
  error TEXT NULL,
  error_code TEXT NULL,
  usage_json TEXT NULL,
  sandbox_key TEXT NULL,
  detached_since INTEGER NULL,
  cancel_requested INTEGER NULL,
  driver_epoch INTEGER NULL,
  parent_run_id TEXT NULL,
  subagent_run_id TEXT NULL,
  name TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_run_status_detached
  ON chat_run(status, detached_since);

CREATE INDEX IF NOT EXISTS idx_chat_run_thread_started
  ON chat_run(thread_id, started_at);

CREATE INDEX IF NOT EXISTS idx_chat_run_parent_started
  ON chat_run(parent_run_id, started_at);

CREATE TABLE IF NOT EXISTS chat_interrupt (
  interrupt_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at INTEGER NOT NULL,
  resolved_at INTEGER NULL,
  payload_json TEXT NOT NULL,
  response_json TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_interrupt_thread_id
  ON chat_interrupt(thread_id);

CREATE INDEX IF NOT EXISTS idx_chat_interrupt_run_id
  ON chat_interrupt(run_id);

CREATE TABLE IF NOT EXISTS chat_metadata (
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value_json TEXT NOT NULL,
  PRIMARY KEY (namespace, key)
);
`;
