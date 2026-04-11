BEGIN;

ALTER TABLE workout
ADD COLUMN workout_template_id INT NULL;

ALTER TABLE workout_segment
ADD COLUMN workout_template_segment_id INT NULL;

ALTER TABLE workout_segment_exercise
ADD COLUMN workout_template_segment_exercise_id INT NULL;

ALTER TABLE workout_segment_exercise_measurement
ADD COLUMN workout_template_segment_exercise_measurement_id INT NULL,
ADD COLUMN template_reps VARCHAR(50) NULL,
ADD COLUMN template_weight_used VARCHAR(50) NULL,
ADD COLUMN template_duration VARCHAR(50) NULL,
ADD COLUMN template_distance VARCHAR(50) NULL;

COMMIT;
