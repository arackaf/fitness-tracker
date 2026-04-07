import { db } from "@/data/db";
import { bodyCompositionMetric, exercises, muscleGroup, userInfo } from "@/drizzle/schema";
import type { SessionUser } from "@/lib/auth.functions";
import { eq } from "drizzle-orm";

type MuscleGroupSeed = {
  name: string;
};

type ExerciseSeed = {
  name: string;
  description: string;
  muscleGroups: string[];
  isCompound: boolean;
  executionType: "repetition" | "distance" | "time";
};

type BodyCompositionMetricSeed = {
  name: string;
  measurementType: "length" | "weight" | "percentage";
};

const muscleGroupSeedData: MuscleGroupSeed[] = [
  { name: "chest" },
  { name: "shoulders" },
  { name: "biceps" },
  { name: "triceps" },
  { name: "quadriceps" },
  { name: "hamstrings" },
  { name: "calves" },
  { name: "lats" },
  { name: "back" },
  { name: "cardio" },
];

const bodyweightExerciseNames = new Set([
  "Push-Up",
  "Chest Dips",
  "Pistol Squat",
  "Glute Bridge",
  "Nordic Hamstring Curl",
  "Pull-Up",
  "Chin-Up",
  "Inverted Row",
  "Triceps Dip",
  "Bench Dip",
]);

const exerciseSeedData: ExerciseSeed[] = [
  {
    name: "Bench Press",
    description: "Lie on a flat bench, lower the bar to your chest, then press it back up with control.",
    muscleGroups: ["chest", "triceps", "shoulders"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Incline Dumbbell Press",
    description: "Set the bench to an incline and press dumbbells from chest level to full extension overhead of your chest.",
    muscleGroups: ["chest", "shoulders", "triceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Decline Bench Press",
    description: "Use a decline bench, lower the bar to the lower chest, and press to lockout.",
    muscleGroups: ["chest", "triceps", "shoulders"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Push-Up",
    description: "Start in a plank, lower your chest toward the floor, and push back to straight arms.",
    muscleGroups: ["chest", "triceps", "shoulders"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Dumbbell Fly",
    description: "With a slight elbow bend, open your arms wide and bring the dumbbells together over your chest.",
    muscleGroups: ["chest", "shoulders"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Cable Fly",
    description: "Set cables at chest height, step forward, and sweep your hands together in front of your chest.",
    muscleGroups: ["chest", "shoulders"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Chest Dips",
    description: "Lean slightly forward on dip bars, lower your body, and press back up.",
    muscleGroups: ["chest", "triceps", "shoulders"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Machine Chest Press",
    description: "Sit with handles at chest level and press forward until arms are extended, then return slowly.",
    muscleGroups: ["chest", "triceps", "shoulders"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Pec Deck",
    description: "Sit with elbows on pads and bring arms inward until they meet, then return under control.",
    muscleGroups: ["chest"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Dumbell Bench Press",
    description: "Lie on a flat bench, lower dumbbells to chest level, then press them back up with control.",
    muscleGroups: ["chest", "triceps", "shoulders"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Back Squat",
    description: "Place a bar on your upper back, sit down until thighs are at least parallel, then stand up.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Front Squat",
    description: "Rack the bar on your shoulders, keep your torso upright, squat down, and drive back up.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Goblet Squat",
    description: "Hold a dumbbell at your chest, squat deep with an upright torso, then stand.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Bulgarian Split Squat",
    description: "Place rear foot on a bench, lower into a split squat, and press through the front foot.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Leg Press",
    description: "Place feet on the platform, lower the sled until knees bend deeply, and press it away.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Walking Lunge",
    description: "Step forward into a lunge, push through the front leg, and continue stepping.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Step-Up",
    description: "Step onto a box with one leg, drive up, then lower back down with control.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Leg Extension",
    description: "Sit in the machine and extend your knees until legs are straight, then lower slowly.",
    muscleGroups: ["quadriceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Hack Squat",
    description: "Set your back against the pad, squat down under control, and drive up through your feet.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Pistol Squat",
    description: "Balance on one leg, squat down as low as possible, then stand back up.",
    muscleGroups: ["quadriceps", "hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Romanian Deadlift",
    description: "Hold the bar close, hinge at the hips with soft knees, then stand by driving hips forward.",
    muscleGroups: ["hamstrings", "back"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Conventional Deadlift",
    description: "Pull the bar from the floor by pushing through the legs and extending your hips and knees.",
    muscleGroups: ["hamstrings", "back", "lats"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Sumo Deadlift",
    description: "Take a wide stance, grip inside your knees, and stand up with the bar in a straight path.",
    muscleGroups: ["hamstrings", "back", "quadriceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Good Morning",
    description: "Place a bar on your back, hinge forward at the hips, and return to standing.",
    muscleGroups: ["hamstrings", "back"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Hip Thrust",
    description: "Rest upper back on a bench, drive hips up with feet planted, and squeeze at the top.",
    muscleGroups: ["hamstrings"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Glute Bridge",
    description: "Lie on your back with knees bent, lift hips up, then lower under control.",
    muscleGroups: ["hamstrings"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Lying Leg Curl",
    description: "Lie face down on the machine and curl your heels toward your hips.",
    muscleGroups: ["hamstrings"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Seated Leg Curl",
    description: "Sit in the machine, pull the pad down with your legs, then return slowly.",
    muscleGroups: ["hamstrings"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Nordic Hamstring Curl",
    description: "Anchor your feet, lower your body forward slowly, and pull back up.",
    muscleGroups: ["hamstrings"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Single-Leg Romanian Deadlift",
    description: "Balance on one leg, hinge forward while extending the other leg back, then stand.",
    muscleGroups: ["hamstrings", "back"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Standing Calf Raise",
    description: "Raise your heels as high as possible, pause at the top, and lower fully.",
    muscleGroups: ["calves"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Seated Calf Raise",
    description: "Sit with weight on knees and lift your heels up, then lower with control.",
    muscleGroups: ["calves"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Donkey Calf Raise",
    description: "Hinge at the hips and perform heel raises through a full range of motion.",
    muscleGroups: ["calves"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Single-Leg Calf Raise",
    description: "Stand on one foot, raise your heel up, and lower below step level if possible.",
    muscleGroups: ["calves"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Calf Press on Leg Press",
    description: "Use the leg press platform and press through the balls of your feet only.",
    muscleGroups: ["calves"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Overhead Press",
    description: "Press a bar or dumbbells from shoulder height to overhead while keeping your core tight.",
    muscleGroups: ["shoulders", "triceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Seated Dumbbell Shoulder Press",
    description: "Press dumbbells overhead from shoulder level while seated upright.",
    muscleGroups: ["shoulders", "triceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Arnold Press",
    description: "Start palms facing you, rotate as you press overhead, then reverse on the way down.",
    muscleGroups: ["shoulders", "triceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Lateral Raise",
    description: "Lift dumbbells out to the sides until shoulder height, then lower slowly.",
    muscleGroups: ["shoulders"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Front Raise",
    description: "Raise a dumbbell or plate in front of you to shoulder height, then lower.",
    muscleGroups: ["shoulders"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Rear Delt Fly",
    description: "Hinge forward and open your arms out wide to target the rear shoulders.",
    muscleGroups: ["shoulders"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Face Pull",
    description: "Pull a rope attachment toward your face with elbows high, then return under control.",
    muscleGroups: ["shoulders", "back"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Upright Row",
    description: "Pull a bar or dumbbells upward close to your body to upper chest height.",
    muscleGroups: ["shoulders", "lats"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Push Press",
    description: "Dip slightly at the knees and drive the bar overhead using leg momentum.",
    muscleGroups: ["shoulders", "triceps", "quadriceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Landmine Press",
    description: "Press the bar upward and forward from shoulder level in an arc.",
    muscleGroups: ["shoulders", "chest", "triceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Pull-Up",
    description: "Hang from a bar, pull your chest toward it, and lower until arms are straight.",
    muscleGroups: ["lats", "biceps", "back"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Chin-Up",
    description: "Use a supinated grip, pull up until your chin clears the bar, then lower.",
    muscleGroups: ["lats", "biceps", "back"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Lat Pulldown",
    description: "Pull the bar down toward your upper chest and control it back up.",
    muscleGroups: ["lats", "biceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Bent-Over Barbell Row",
    description: "Hinge at the hips, row the bar to your torso, and lower with control.",
    muscleGroups: ["back", "lats", "biceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Single-Arm Dumbbell Row",
    description: "Support one hand on a bench and row the dumbbell toward your hip.",
    muscleGroups: ["lats", "back", "biceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Seated Cable Row",
    description: "Pull the handle toward your torso while keeping your chest up.",
    muscleGroups: ["back", "lats", "biceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "T-Bar Row",
    description: "Hinge and row the loaded bar toward your midsection, then lower slowly.",
    muscleGroups: ["back", "lats", "biceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Chest-Supported Row",
    description: "Lie chest-down on a bench and row weights up without swinging.",
    muscleGroups: ["back", "lats", "biceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Inverted Row",
    description: "Hang under a bar, pull your chest to the bar, and lower under control.",
    muscleGroups: ["back", "lats", "biceps"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Straight-Arm Pulldown",
    description: "With straight arms, pull the cable down to your thighs using your lats.",
    muscleGroups: ["lats"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Barbell Curl",
    description: "Curl the bar upward without swinging, squeeze at the top, and lower slowly.",
    muscleGroups: ["biceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Dumbbell Curl",
    description: "Curl dumbbells up with elbows by your sides, then lower with control.",
    muscleGroups: ["biceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Hammer Curl",
    description: "Keep neutral grips and curl dumbbells up while keeping elbows tucked.",
    muscleGroups: ["biceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Preacher Curl",
    description: "Brace your arms on the pad and curl the weight up through full range.",
    muscleGroups: ["biceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Concentration Curl",
    description: "Sit and curl one dumbbell with your elbow braced on your thigh.",
    muscleGroups: ["biceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Cable Curl",
    description: "Curl a cable handle upward with constant tension and control on the way down.",
    muscleGroups: ["biceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Reverse Curl",
    description: "Use an overhand grip and curl the bar up while keeping wrists neutral.",
    muscleGroups: ["biceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Close-Grip Bench Press",
    description: "Use a narrower grip, lower the bar to your chest, and press up.",
    muscleGroups: ["triceps", "chest"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Triceps Dip",
    description: "Keep torso upright, lower on dip bars, and press back up mainly with triceps.",
    muscleGroups: ["triceps", "shoulders"],
    isCompound: true,
    executionType: "repetition",
  },
  {
    name: "Skull Crusher",
    description: "Lower an EZ bar toward your forehead by bending elbows, then extend back up.",
    muscleGroups: ["triceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Overhead Triceps Extension",
    description: "Raise a dumbbell or cable overhead and extend elbows to straighten arms.",
    muscleGroups: ["triceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Cable Pushdown",
    description: "Push the cable handle down by extending your elbows and return slowly.",
    muscleGroups: ["triceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Rope Triceps Pushdown",
    description: "Push the rope down and spread the ends apart at the bottom.",
    muscleGroups: ["triceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Bench Dip",
    description: "Place hands on a bench, lower your body, and press up to straight elbows.",
    muscleGroups: ["triceps", "shoulders"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Kickback",
    description: "Hinge forward, keep upper arm still, and extend your elbow to move the weight back.",
    muscleGroups: ["triceps"],
    isCompound: false,
    executionType: "repetition",
  },
  {
    name: "Running",
    description: "Run at a sustainable pace over a measured distance.",
    muscleGroups: ["cardio"],
    isCompound: true,
    executionType: "distance",
  },
  {
    name: "Rowing",
    description: "Row continuously with controlled strokes for a set duration.",
    muscleGroups: ["back", "lats", "biceps"],
    isCompound: true,
    executionType: "time",
  },
];

const bodyCompositionMetricSeedData: BodyCompositionMetricSeed[] = [
  { name: "Waist", measurementType: "length" },
  { name: "Bodyweight", measurementType: "weight" },
  { name: "Bodyfat %", measurementType: "percentage" },
];

const getMuscleGroupId = (name: string, muscleGroupIdByName: Map<string, number>) => {
  const muscleGroupId = muscleGroupIdByName.get(name);
  if (!muscleGroupId) {
    throw new Error(`Missing muscle group id for '${name}'`);
  }
  return muscleGroupId;
};

export const setupNewUser = async (user: SessionUser) => {
  const start = performance.now();

  const { id: userId, name, image } = user;

  const existingUserResults = await db.select().from(userInfo).for("update").where(eq(userInfo.userId, userId)).limit(1);
  const existingUser = existingUserResults[0];

  if (existingUser) {
    return;
  }

  await db.transaction(
    async tx => {
      await tx.insert(userInfo).values({
        userId,
        displayName: name,
        imageUrl: image,
        initialDataSetup: true,
      });

      const insertedMuscleGroups = await tx
        .insert(muscleGroup)
        .values(muscleGroupSeedData.map(seed => ({ userId, name: seed.name })))
        .returning({ id: muscleGroup.id, name: muscleGroup.name });

      const muscleGroupIdByName = new Map(
        insertedMuscleGroups.map(insertedMuscleGroup => [insertedMuscleGroup.name, insertedMuscleGroup.id]),
      );

      const exerciseRows = exerciseSeedData.map(seed => ({
        userId,
        name: seed.name,
        description: seed.description,
        muscleGroups: seed.muscleGroups.map(name => getMuscleGroupId(name, muscleGroupIdByName)),
        isCompound: seed.isCompound,
        isBodyweight: bodyweightExerciseNames.has(seed.name),
        executionType: seed.executionType,
      }));

      await tx.insert(exercises).values(exerciseRows);

      await tx.insert(bodyCompositionMetric).values(
        bodyCompositionMetricSeedData.map(seed => ({
          userId,
          name: seed.name,
          measurementType: seed.measurementType,
        })),
      );
    },
    { isolationLevel: "repeatable read" },
  );

  const end = performance.now();
  console.log(`Setup new user ${userId}: ${end - start}ms`);
};
