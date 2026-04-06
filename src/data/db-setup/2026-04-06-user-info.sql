BEGIN;

CREATE TABLE IF NOT EXISTS user_info (
  "userId" text PRIMARY KEY,
  display_name text,
  image_url text,
  initial_data_setup boolean
);

COMMIT;
