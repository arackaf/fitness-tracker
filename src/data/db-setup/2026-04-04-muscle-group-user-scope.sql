BEGIN;

ALTER TABLE muscle_group
DROP CONSTRAINT IF EXISTS muscle_group_name_key;

ALTER TABLE muscle_group
ADD CONSTRAINT muscle_group_user_id_name_key UNIQUE ("userId", name);

COMMIT;
