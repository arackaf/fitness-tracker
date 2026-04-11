BEGIN;

ALTER TABLE workout_template_segment_exercise_measurement
ALTER COLUMN weight_used TYPE varchar(50);

COMMIT;
