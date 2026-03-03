import { createServerFn } from "@tanstack/react-start";

import { insertWorkout } from "@/data/workouts/insert-workout";
import type { WorkoutState } from "@/data/workouts/workout-state";

export const saveWorkout = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutState) => input)
  .handler(async ({ data }) => {
    await insertWorkout(data);
  });
