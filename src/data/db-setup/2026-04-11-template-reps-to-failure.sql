BEGIN;

ALTER TABLE workout_segment_exercise_measurement
ADD COLUMN template_reps_to_failure BOOL NULL;

COMMIT;
