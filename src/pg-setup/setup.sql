CREATE TABLE IF NOT EXISTS users (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(250) NOT NULL,
  password VARCHAR(250) NOT NULL,
  display_name VARCHAR(250) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (username)
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'muscle_group') THEN
    CREATE TYPE muscle_group AS ENUM (
      'chest',
      'shoulders',
      'biceps',
      'triceps',
      'quadriceps',
      'hamstrings',
      'calves',
      'lats',
      'back'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS exercises (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(150),
  description TEXT,
  muscle_groups muscle_group[],
  is_compound BOOL
);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups_gin
  ON exercises
  USING GIN (muscle_groups);

CREATE TABLE IF NOT EXISTS workout (
  id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(50),
  description TEXT
);

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
  reps INT NOT NULL CHECK (reps > 0)
);
CREATE INDEX IF NOT EXISTS idx_workout_segment_exercise_segment_id_exercise_order
  ON workout_segment_exercise (workout_segment_id, exercise_order);

-- ================================================================================

INSERT INTO exercises (id, name, description, muscle_groups, is_compound)
OVERRIDING SYSTEM VALUE
SELECT seed.id, seed.name, seed.description, seed.muscle_groups, seed.is_compound
FROM (
  VALUES
    (1, 'Barbell Bench Press', 'Lie on a flat bench, lower the bar to your chest, then press it back up with control.', ARRAY['chest', 'triceps', 'shoulders']::muscle_group[], true),
    (2, 'Incline Dumbbell Press', 'Set the bench to an incline and press dumbbells from chest level to full extension overhead of your chest.', ARRAY['chest', 'shoulders', 'triceps']::muscle_group[], true),
    (3, 'Decline Bench Press', 'Use a decline bench, lower the bar to the lower chest, and press to lockout.', ARRAY['chest', 'triceps', 'shoulders']::muscle_group[], true),
    (4, 'Push-Up', 'Start in a plank, lower your chest toward the floor, and push back to straight arms.', ARRAY['chest', 'triceps', 'shoulders']::muscle_group[], true),
    (5, 'Dumbbell Fly', 'With a slight elbow bend, open your arms wide and bring the dumbbells together over your chest.', ARRAY['chest', 'shoulders']::muscle_group[], false),
    (6, 'Cable Fly', 'Set cables at chest height, step forward, and sweep your hands together in front of your chest.', ARRAY['chest', 'shoulders']::muscle_group[], false),
    (7, 'Chest Dips', 'Lean slightly forward on dip bars, lower your body, and press back up.', ARRAY['chest', 'triceps', 'shoulders']::muscle_group[], true),
    (8, 'Machine Chest Press', 'Sit with handles at chest level and press forward until arms are extended, then return slowly.', ARRAY['chest', 'triceps', 'shoulders']::muscle_group[], true),
    (9, 'Pec Deck', 'Sit with elbows on pads and bring arms inward until they meet, then return under control.', ARRAY['chest']::muscle_group[], false),

    (10, 'Back Squat', 'Place a bar on your upper back, sit down until thighs are at least parallel, then stand up.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (11, 'Front Squat', 'Rack the bar on your shoulders, keep your torso upright, squat down, and drive back up.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (12, 'Goblet Squat', 'Hold a dumbbell at your chest, squat deep with an upright torso, then stand.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (13, 'Bulgarian Split Squat', 'Place rear foot on a bench, lower into a split squat, and press through the front foot.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (14, 'Leg Press', 'Place feet on the platform, lower the sled until knees bend deeply, and press it away.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (15, 'Walking Lunge', 'Step forward into a lunge, push through the front leg, and continue stepping.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (16, 'Step-Up', 'Step onto a box with one leg, drive up, then lower back down with control.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (17, 'Leg Extension', 'Sit in the machine and extend your knees until legs are straight, then lower slowly.', ARRAY['quadriceps']::muscle_group[], false),
    (18, 'Hack Squat', 'Set your back against the pad, squat down under control, and drive up through your feet.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),
    (19, 'Pistol Squat', 'Balance on one leg, squat down as low as possible, then stand back up.', ARRAY['quadriceps', 'hamstrings']::muscle_group[], true),

    (20, 'Romanian Deadlift', 'Hold the bar close, hinge at the hips with soft knees, then stand by driving hips forward.', ARRAY['hamstrings', 'back']::muscle_group[], true),
    (21, 'Conventional Deadlift', 'Pull the bar from the floor by pushing through the legs and extending your hips and knees.', ARRAY['hamstrings', 'back', 'lats']::muscle_group[], true),
    (22, 'Sumo Deadlift', 'Take a wide stance, grip inside your knees, and stand up with the bar in a straight path.', ARRAY['hamstrings', 'back', 'quadriceps']::muscle_group[], true),
    (23, 'Good Morning', 'Place a bar on your back, hinge forward at the hips, and return to standing.', ARRAY['hamstrings', 'back']::muscle_group[], true),
    (24, 'Hip Thrust', 'Rest upper back on a bench, drive hips up with feet planted, and squeeze at the top.', ARRAY['hamstrings']::muscle_group[], true),
    (25, 'Glute Bridge', 'Lie on your back with knees bent, lift hips up, then lower under control.', ARRAY['hamstrings']::muscle_group[], false),
    (26, 'Lying Leg Curl', 'Lie face down on the machine and curl your heels toward your hips.', ARRAY['hamstrings']::muscle_group[], false),
    (27, 'Seated Leg Curl', 'Sit in the machine, pull the pad down with your legs, then return slowly.', ARRAY['hamstrings']::muscle_group[], false),
    (28, 'Nordic Hamstring Curl', 'Anchor your feet, lower your body forward slowly, and pull back up.', ARRAY['hamstrings']::muscle_group[], false),
    (29, 'Single-Leg Romanian Deadlift', 'Balance on one leg, hinge forward while extending the other leg back, then stand.', ARRAY['hamstrings', 'back']::muscle_group[], true),

    (30, 'Standing Calf Raise', 'Raise your heels as high as possible, pause at the top, and lower fully.', ARRAY['calves']::muscle_group[], false),
    (31, 'Seated Calf Raise', 'Sit with weight on knees and lift your heels up, then lower with control.', ARRAY['calves']::muscle_group[], false),
    (32, 'Donkey Calf Raise', 'Hinge at the hips and perform heel raises through a full range of motion.', ARRAY['calves']::muscle_group[], false),
    (33, 'Single-Leg Calf Raise', 'Stand on one foot, raise your heel up, and lower below step level if possible.', ARRAY['calves']::muscle_group[], false),
    (34, 'Calf Press on Leg Press', 'Use the leg press platform and press through the balls of your feet only.', ARRAY['calves']::muscle_group[], false),

    (35, 'Overhead Press', 'Press a bar or dumbbells from shoulder height to overhead while keeping your core tight.', ARRAY['shoulders', 'triceps']::muscle_group[], true),
    (36, 'Seated Dumbbell Shoulder Press', 'Press dumbbells overhead from shoulder level while seated upright.', ARRAY['shoulders', 'triceps']::muscle_group[], true),
    (37, 'Arnold Press', 'Start palms facing you, rotate as you press overhead, then reverse on the way down.', ARRAY['shoulders', 'triceps']::muscle_group[], true),
    (38, 'Lateral Raise', 'Lift dumbbells out to the sides until shoulder height, then lower slowly.', ARRAY['shoulders']::muscle_group[], false),
    (39, 'Front Raise', 'Raise a dumbbell or plate in front of you to shoulder height, then lower.', ARRAY['shoulders']::muscle_group[], false),
    (40, 'Rear Delt Fly', 'Hinge forward and open your arms out wide to target the rear shoulders.', ARRAY['shoulders']::muscle_group[], false),
    (41, 'Face Pull', 'Pull a rope attachment toward your face with elbows high, then return under control.', ARRAY['shoulders', 'back']::muscle_group[], false),
    (42, 'Upright Row', 'Pull a bar or dumbbells upward close to your body to upper chest height.', ARRAY['shoulders', 'lats']::muscle_group[], false),
    (43, 'Push Press', 'Dip slightly at the knees and drive the bar overhead using leg momentum.', ARRAY['shoulders', 'triceps', 'quadriceps']::muscle_group[], true),
    (44, 'Landmine Press', 'Press the bar upward and forward from shoulder level in an arc.', ARRAY['shoulders', 'chest', 'triceps']::muscle_group[], true),

    (45, 'Pull-Up', 'Hang from a bar, pull your chest toward it, and lower until arms are straight.', ARRAY['lats', 'biceps', 'back']::muscle_group[], true),
    (46, 'Chin-Up', 'Use a supinated grip, pull up until your chin clears the bar, then lower.', ARRAY['lats', 'biceps', 'back']::muscle_group[], true),
    (47, 'Lat Pulldown', 'Pull the bar down toward your upper chest and control it back up.', ARRAY['lats', 'biceps']::muscle_group[], true),
    (48, 'Bent-Over Barbell Row', 'Hinge at the hips, row the bar to your torso, and lower with control.', ARRAY['back', 'lats', 'biceps']::muscle_group[], true),
    (49, 'Single-Arm Dumbbell Row', 'Support one hand on a bench and row the dumbbell toward your hip.', ARRAY['lats', 'back', 'biceps']::muscle_group[], true),
    (50, 'Seated Cable Row', 'Pull the handle toward your torso while keeping your chest up.', ARRAY['back', 'lats', 'biceps']::muscle_group[], true),
    (51, 'T-Bar Row', 'Hinge and row the loaded bar toward your midsection, then lower slowly.', ARRAY['back', 'lats', 'biceps']::muscle_group[], true),
    (52, 'Chest-Supported Row', 'Lie chest-down on a bench and row weights up without swinging.', ARRAY['back', 'lats', 'biceps']::muscle_group[], true),
    (53, 'Inverted Row', 'Hang under a bar, pull your chest to the bar, and lower under control.', ARRAY['back', 'lats', 'biceps']::muscle_group[], true),
    (54, 'Straight-Arm Pulldown', 'With straight arms, pull the cable down to your thighs using your lats.', ARRAY['lats']::muscle_group[], false),

    (55, 'Barbell Curl', 'Curl the bar upward without swinging, squeeze at the top, and lower slowly.', ARRAY['biceps']::muscle_group[], false),
    (56, 'Dumbbell Curl', 'Curl dumbbells up with elbows by your sides, then lower with control.', ARRAY['biceps']::muscle_group[], false),
    (57, 'Hammer Curl', 'Keep neutral grips and curl dumbbells up while keeping elbows tucked.', ARRAY['biceps']::muscle_group[], false),
    (58, 'Preacher Curl', 'Brace your arms on the pad and curl the weight up through full range.', ARRAY['biceps']::muscle_group[], false),
    (59, 'Concentration Curl', 'Sit and curl one dumbbell with your elbow braced on your thigh.', ARRAY['biceps']::muscle_group[], false),
    (60, 'Cable Curl', 'Curl a cable handle upward with constant tension and control on the way down.', ARRAY['biceps']::muscle_group[], false),
    (61, 'Reverse Curl', 'Use an overhand grip and curl the bar up while keeping wrists neutral.', ARRAY['biceps']::muscle_group[], false),

    (62, 'Close-Grip Bench Press', 'Use a narrower grip, lower the bar to your chest, and press up.', ARRAY['triceps', 'chest']::muscle_group[], true),
    (63, 'Triceps Dip', 'Keep torso upright, lower on dip bars, and press back up mainly with triceps.', ARRAY['triceps', 'shoulders']::muscle_group[], true),
    (64, 'Skull Crusher', 'Lower an EZ bar toward your forehead by bending elbows, then extend back up.', ARRAY['triceps']::muscle_group[], false),
    (65, 'Overhead Triceps Extension', 'Raise a dumbbell or cable overhead and extend elbows to straighten arms.', ARRAY['triceps']::muscle_group[], false),
    (66, 'Cable Pushdown', 'Push the cable handle down by extending your elbows and return slowly.', ARRAY['triceps']::muscle_group[], false),
    (67, 'Rope Triceps Pushdown', 'Push the rope down and spread the ends apart at the bottom.', ARRAY['triceps']::muscle_group[], false),
    (68, 'Bench Dip', 'Place hands on a bench, lower your body, and press up to straight elbows.', ARRAY['triceps', 'shoulders']::muscle_group[], false),
    (69, 'Kickback', 'Hinge forward, keep upper arm still, and extend your elbow to move the weight back.', ARRAY['triceps']::muscle_group[], false)
) AS seed(id, name, description, muscle_groups, is_compound)
WHERE NOT EXISTS (
  SELECT 1
  FROM exercises e
  WHERE e.name = seed.name
);