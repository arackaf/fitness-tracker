BEGIN;

ALTER TABLE workout_template_segment_exercise_measurement
ALTER COLUMN reps TYPE varchar(50)

COMMIT;
