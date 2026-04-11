BEGIN;

ALTER TABLE workout_template_segment_exercise_measurement
ALTER COLUMN duration TYPE varchar(50),
ALTER COLUMN distance TYPE varchar(50);

COMMIT;
