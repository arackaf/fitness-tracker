INSERT INTO muscle_group (id, name)
OVERRIDING SYSTEM VALUE
SELECT seed.id, seed.name
FROM (
  VALUES
    (1, 'chest'),
    (2, 'shoulders'),
    (3, 'biceps'),
    (4, 'triceps'),
    (5, 'quadriceps'),
    (6, 'hamstrings'),
    (7, 'calves'),
    (8, 'lats'),
    (9, 'back'),
    (10, 'cardio')
) AS seed(id, name)
WHERE NOT EXISTS (
  SELECT 1
  FROM muscle_group mg
  WHERE mg.name = seed.name
);

WITH exercise_seed AS (
  SELECT *
  FROM (
    VALUES
      (1, 'Bench Press', 'Lie on a flat bench, lower the bar to your chest, then press it back up with control.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (2, 'Incline Dumbbell Press', 'Set the bench to an incline and press dumbbells from chest level to full extension overhead of your chest.', ARRAY['chest', 'shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (3, 'Decline Bench Press', 'Use a decline bench, lower the bar to the lower chest, and press to lockout.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (4, 'Push-Up', 'Start in a plank, lower your chest toward the floor, and push back to straight arms.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (5, 'Dumbbell Fly', 'With a slight elbow bend, open your arms wide and bring the dumbbells together over your chest.', ARRAY['chest', 'shoulders'], false, 'repetition', NULL, NULL),
      (6, 'Cable Fly', 'Set cables at chest height, step forward, and sweep your hands together in front of your chest.', ARRAY['chest', 'shoulders'], false, 'repetition', NULL, NULL),
      (7, 'Chest Dips', 'Lean slightly forward on dip bars, lower your body, and press back up.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (8, 'Machine Chest Press', 'Sit with handles at chest level and press forward until arms are extended, then return slowly.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (9, 'Pec Deck', 'Sit with elbows on pads and bring arms inward until they meet, then return under control.', ARRAY['chest'], false, 'repetition', NULL, NULL),
      (10, 'Dumbell Bench Press', 'Lie on a flat bench, lower dumbbells to chest level, then press them back up with control.', ARRAY['chest', 'triceps', 'shoulders'], true, 'repetition', NULL, NULL),

      (11, 'Back Squat', 'Place a bar on your upper back, sit down until thighs are at least parallel, then stand up.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (12, 'Front Squat', 'Rack the bar on your shoulders, keep your torso upright, squat down, and drive back up.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (13, 'Goblet Squat', 'Hold a dumbbell at your chest, squat deep with an upright torso, then stand.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (14, 'Bulgarian Split Squat', 'Place rear foot on a bench, lower into a split squat, and press through the front foot.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (15, 'Leg Press', 'Place feet on the platform, lower the sled until knees bend deeply, and press it away.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (16, 'Walking Lunge', 'Step forward into a lunge, push through the front leg, and continue stepping.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (17, 'Step-Up', 'Step onto a box with one leg, drive up, then lower back down with control.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (18, 'Leg Extension', 'Sit in the machine and extend your knees until legs are straight, then lower slowly.', ARRAY['quadriceps'], false, 'repetition', NULL, NULL),
      (19, 'Hack Squat', 'Set your back against the pad, squat down under control, and drive up through your feet.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),
      (20, 'Pistol Squat', 'Balance on one leg, squat down as low as possible, then stand back up.', ARRAY['quadriceps', 'hamstrings'], true, 'repetition', NULL, NULL),

      (21, 'Romanian Deadlift', 'Hold the bar close, hinge at the hips with soft knees, then stand by driving hips forward.', ARRAY['hamstrings', 'back'], true, 'repetition', NULL, NULL),
      (22, 'Conventional Deadlift', 'Pull the bar from the floor by pushing through the legs and extending your hips and knees.', ARRAY['hamstrings', 'back', 'lats'], true, 'repetition', NULL, NULL),
      (23, 'Sumo Deadlift', 'Take a wide stance, grip inside your knees, and stand up with the bar in a straight path.', ARRAY['hamstrings', 'back', 'quadriceps'], true, 'repetition', NULL, NULL),
      (24, 'Good Morning', 'Place a bar on your back, hinge forward at the hips, and return to standing.', ARRAY['hamstrings', 'back'], true, 'repetition', NULL, NULL),
      (25, 'Hip Thrust', 'Rest upper back on a bench, drive hips up with feet planted, and squeeze at the top.', ARRAY['hamstrings'], true, 'repetition', NULL, NULL),
      (26, 'Glute Bridge', 'Lie on your back with knees bent, lift hips up, then lower under control.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (27, 'Lying Leg Curl', 'Lie face down on the machine and curl your heels toward your hips.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (28, 'Seated Leg Curl', 'Sit in the machine, pull the pad down with your legs, then return slowly.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (29, 'Nordic Hamstring Curl', 'Anchor your feet, lower your body forward slowly, and pull back up.', ARRAY['hamstrings'], false, 'repetition', NULL, NULL),
      (30, 'Single-Leg Romanian Deadlift', 'Balance on one leg, hinge forward while extending the other leg back, then stand.', ARRAY['hamstrings', 'back'], true, 'repetition', NULL, NULL),

      (31, 'Standing Calf Raise', 'Raise your heels as high as possible, pause at the top, and lower fully.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (32, 'Seated Calf Raise', 'Sit with weight on knees and lift your heels up, then lower with control.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (33, 'Donkey Calf Raise', 'Hinge at the hips and perform heel raises through a full range of motion.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (34, 'Single-Leg Calf Raise', 'Stand on one foot, raise your heel up, and lower below step level if possible.', ARRAY['calves'], false, 'repetition', NULL, NULL),
      (35, 'Calf Press on Leg Press', 'Use the leg press platform and press through the balls of your feet only.', ARRAY['calves'], false, 'repetition', NULL, NULL),

      (36, 'Overhead Press', 'Press a bar or dumbbells from shoulder height to overhead while keeping your core tight.', ARRAY['shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (37, 'Seated Dumbbell Shoulder Press', 'Press dumbbells overhead from shoulder level while seated upright.', ARRAY['shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (38, 'Arnold Press', 'Start palms facing you, rotate as you press overhead, then reverse on the way down.', ARRAY['shoulders', 'triceps'], true, 'repetition', NULL, NULL),
      (39, 'Lateral Raise', 'Lift dumbbells out to the sides until shoulder height, then lower slowly.', ARRAY['shoulders'], false, 'repetition', NULL, NULL),
      (40, 'Front Raise', 'Raise a dumbbell or plate in front of you to shoulder height, then lower.', ARRAY['shoulders'], false, 'repetition', NULL, NULL),
      (41, 'Rear Delt Fly', 'Hinge forward and open your arms out wide to target the rear shoulders.', ARRAY['shoulders'], false, 'repetition', NULL, NULL),
      (42, 'Face Pull', 'Pull a rope attachment toward your face with elbows high, then return under control.', ARRAY['shoulders', 'back'], false, 'repetition', NULL, NULL),
      (43, 'Upright Row', 'Pull a bar or dumbbells upward close to your body to upper chest height.', ARRAY['shoulders', 'lats'], false, 'repetition', NULL, NULL),
      (44, 'Push Press', 'Dip slightly at the knees and drive the bar overhead using leg momentum.', ARRAY['shoulders', 'triceps', 'quadriceps'], true, 'repetition', NULL, NULL),
      (45, 'Landmine Press', 'Press the bar upward and forward from shoulder level in an arc.', ARRAY['shoulders', 'chest', 'triceps'], true, 'repetition', NULL, NULL),

      (46, 'Pull-Up', 'Hang from a bar, pull your chest toward it, and lower until arms are straight.', ARRAY['lats', 'biceps', 'back'], true, 'repetition', NULL, NULL),
      (47, 'Chin-Up', 'Use a supinated grip, pull up until your chin clears the bar, then lower.', ARRAY['lats', 'biceps', 'back'], true, 'repetition', NULL, NULL),
      (48, 'Lat Pulldown', 'Pull the bar down toward your upper chest and control it back up.', ARRAY['lats', 'biceps'], true, 'repetition', NULL, NULL),
      (49, 'Bent-Over Barbell Row', 'Hinge at the hips, row the bar to your torso, and lower with control.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (50, 'Single-Arm Dumbbell Row', 'Support one hand on a bench and row the dumbbell toward your hip.', ARRAY['lats', 'back', 'biceps'], true, 'repetition', NULL, NULL),
      (51, 'Seated Cable Row', 'Pull the handle toward your torso while keeping your chest up.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (52, 'T-Bar Row', 'Hinge and row the loaded bar toward your midsection, then lower slowly.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (53, 'Chest-Supported Row', 'Lie chest-down on a bench and row weights up without swinging.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (54, 'Inverted Row', 'Hang under a bar, pull your chest to the bar, and lower under control.', ARRAY['back', 'lats', 'biceps'], true, 'repetition', NULL, NULL),
      (55, 'Straight-Arm Pulldown', 'With straight arms, pull the cable down to your thighs using your lats.', ARRAY['lats'], false, 'repetition', NULL, NULL),

      (56, 'Barbell Curl', 'Curl the bar upward without swinging, squeeze at the top, and lower slowly.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (57, 'Dumbbell Curl', 'Curl dumbbells up with elbows by your sides, then lower with control.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (58, 'Hammer Curl', 'Keep neutral grips and curl dumbbells up while keeping elbows tucked.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (59, 'Preacher Curl', 'Brace your arms on the pad and curl the weight up through full range.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (60, 'Concentration Curl', 'Sit and curl one dumbbell with your elbow braced on your thigh.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (61, 'Cable Curl', 'Curl a cable handle upward with constant tension and control on the way down.', ARRAY['biceps'], false, 'repetition', NULL, NULL),
      (62, 'Reverse Curl', 'Use an overhand grip and curl the bar up while keeping wrists neutral.', ARRAY['biceps'], false, 'repetition', NULL, NULL),

      (63, 'Close-Grip Bench Press', 'Use a narrower grip, lower the bar to your chest, and press up.', ARRAY['triceps', 'chest'], true, 'repetition', NULL, NULL),
      (64, 'Triceps Dip', 'Keep torso upright, lower on dip bars, and press back up mainly with triceps.', ARRAY['triceps', 'shoulders'], true, 'repetition', NULL, NULL),
      (65, 'Skull Crusher', 'Lower an EZ bar toward your forehead by bending elbows, then extend back up.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (66, 'Overhead Triceps Extension', 'Raise a dumbbell or cable overhead and extend elbows to straighten arms.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (67, 'Cable Pushdown', 'Push the cable handle down by extending your elbows and return slowly.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (68, 'Rope Triceps Pushdown', 'Push the rope down and spread the ends apart at the bottom.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (69, 'Bench Dip', 'Place hands on a bench, lower your body, and press up to straight elbows.', ARRAY['triceps', 'shoulders'], false, 'repetition', NULL, NULL),
      (70, 'Kickback', 'Hinge forward, keep upper arm still, and extend your elbow to move the weight back.', ARRAY['triceps'], false, 'repetition', NULL, NULL),
      (71, 'Running', 'Run at a sustainable pace over a measured distance.', ARRAY['cardio'], true, 'distance', 'miles', NULL),
      (72, 'Rowing', 'Row continuously with controlled strokes for a set duration.', ARRAY['back', 'lats', 'biceps'], true, 'time', NULL, 'minutes')
  ) AS seed(id, name, description, muscle_groups, is_compound, execution_type, seed_distance_unit, seed_duration_unit)
),
inserted_exercises AS (
  INSERT INTO exercises (id, name, description, muscle_groups, is_compound, is_bodyweight, execution_type)
  OVERRIDING SYSTEM VALUE
  SELECT
    seed.id,
    seed.name,
    seed.description,
    ARRAY(
      SELECT mg.id
      FROM unnest(seed.muscle_groups) WITH ORDINALITY AS seed_mg(muscle_group_name, ord)
      JOIN muscle_group mg ON mg.name = seed_mg.muscle_group_name
      ORDER BY seed_mg.ord
    )::INT[],
    seed.is_compound,
    CASE
      WHEN seed.name IN (
        'Push-Up',
        'Chest Dips',
        'Pistol Squat',
        'Glute Bridge',
        'Nordic Hamstring Curl',
        'Pull-Up',
        'Chin-Up',
        'Inverted Row',
        'Triceps Dip',
        'Bench Dip'
      ) THEN true
      ELSE false
    END AS is_bodyweight,
    seed.execution_type::execution_type
  FROM exercise_seed seed
  WHERE NOT EXISTS (
    SELECT 1
    FROM exercises e
    WHERE e.name = seed.name
  )
  RETURNING id, name
)
SELECT 1;

INSERT INTO body_composition_metric (name, measurement_type)
SELECT seed.name, seed.measurement_type::body_composition_measurement_type
FROM (
  VALUES
    ('Waist', 'length'),
    ('Bodyweight', 'weight'),
    ('Bodyfat %', 'percentage')
) AS seed(name, measurement_type);