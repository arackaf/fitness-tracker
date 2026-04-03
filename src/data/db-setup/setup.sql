

CREATE TYPE execution_type AS ENUM ('repetition', 'distance', 'time');
CREATE TYPE duration_unit AS ENUM ('seconds', 'minutes', 'hours');
CREATE TYPE distance_unit AS ENUM ('feet', 'yards', 'miles', 'km');
CREATE TYPE exercise_weight_unit AS ENUM ('lbs', 'kg');
CREATE TYPE body_composition_measurement_type AS ENUM ('length', 'weight', 'percentage');
CREATE TYPE body_composition_length_unit AS ENUM ('inches', 'cm');
CREATE TYPE body_composition_weight_unit AS ENUM ('lbs', 'kg');

CREATE TABLE IF NOT EXISTS muscle_group (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS exercises (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  muscle_groups INT[] NOT NULL,
  is_compound BOOL,
  is_bodyweight BOOL,
  execution_type execution_type NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups_gin
  ON exercises
  USING GIN (muscle_groups);

-- ================================================================================
-- Workout Templates
-- ================================================================================

CREATE TABLE IF NOT EXISTS workout_template (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS workout_template_segment (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_template_id INT NOT NULL REFERENCES workout_template(id) ON DELETE CASCADE,
  segment_order INT NOT NULL CHECK (segment_order > 0),
  sets INT NOT NULL CHECK (sets > 0)
);
CREATE INDEX IF NOT EXISTS idx_workout_template_segment_template_id_segment_order
  ON workout_template_segment (workout_template_id, segment_order);

CREATE TABLE IF NOT EXISTS workout_template_segment_exercise (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_template_segment_id INT NOT NULL REFERENCES workout_template_segment(id) ON DELETE CASCADE,
  exercise_order INT NOT NULL CHECK (exercise_order > 0),
  exercise_id INT NOT NULL REFERENCES exercises(id),
  execution_type execution_type,
  exercise_weight_unit exercise_weight_unit,
  duration_unit duration_unit,
  distance_unit distance_unit
);
CREATE INDEX IF NOT EXISTS idx_workout_template_segment_exercise_segment_id_exercise_order
  ON workout_template_segment_exercise (workout_template_segment_id, exercise_order);

CREATE TABLE IF NOT EXISTS workout_template_segment_exercise_measurement (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_template_segment_exercise_id INT NOT NULL REFERENCES workout_template_segment_exercise(id) ON DELETE CASCADE,
  set_order INT NOT NULL CHECK (set_order > 0),
  reps INT,
  reps_to_failure BOOL,
  weight_used NUMERIC(8, 2),
  duration NUMERIC(8, 2),
  distance NUMERIC(8, 2)
);

-- ================================================================================
-- Workouts
-- ================================================================================

CREATE TABLE IF NOT EXISTS workout (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  workout_date DATE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_workout_workout_date
  ON workout (workout_date);

CREATE TABLE IF NOT EXISTS workout_segment (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_id INT NOT NULL REFERENCES workout(id) ON DELETE CASCADE,
  segment_order INT NOT NULL CHECK (segment_order > 0),
  sets INT NOT NULL CHECK (sets > 0)
);
CREATE INDEX IF NOT EXISTS idx_workout_segment_workout_id_segment_order
  ON workout_segment (workout_id, segment_order);

CREATE TABLE IF NOT EXISTS workout_segment_exercise (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_segment_id INT NOT NULL REFERENCES workout_segment(id) ON DELETE CASCADE,
  exercise_order INT NOT NULL CHECK (exercise_order > 0),
  exercise_id INT NOT NULL REFERENCES exercises(id),
  execution_type execution_type,
  exercise_weight_unit exercise_weight_unit,
  duration_unit duration_unit,
  distance_unit distance_unit
);
CREATE INDEX IF NOT EXISTS idx_workout_segment_exercise_segment_id_exercise_order
  ON workout_segment_exercise (workout_segment_id, exercise_order);

CREATE TABLE IF NOT EXISTS workout_segment_exercise_measurement (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  workout_segment_exercise_id INT NOT NULL REFERENCES workout_segment_exercise(id) ON DELETE CASCADE,
  set_order INT NOT NULL CHECK (set_order > 0),
  reps INT,
  weight_used NUMERIC(8, 2),
  duration NUMERIC(8, 2),
  distance NUMERIC(8, 2)
);
CREATE INDEX IF NOT EXISTS idx_workout_segment_exercise_measurement_exercise_id_set_order
  ON workout_segment_exercise_measurement (workout_segment_exercise_id, set_order);



-- ================================================================================
-- Body Composition
-- ================================================================================

CREATE TABLE IF NOT EXISTS body_composition_metric (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  measurement_type body_composition_measurement_type NOT NULL
);

CREATE TABLE IF NOT EXISTS body_composition_measurement (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  body_composition_metric_id INT NOT NULL REFERENCES body_composition_metric(id),
  measurement_date TIMESTAMP NOT NULL,
  value NUMERIC(8, 2) NOT NULL,
  length_unit body_composition_length_unit,
  weight_unit body_composition_weight_unit
);


