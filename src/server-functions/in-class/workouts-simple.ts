import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkouts } from "@/data/workouts/get-workouts";

export const workoutHistoryQueryOptions = () => {
  return queryOptions({
    queryKey: ["workouts"],
    queryFn: () => {
      return getInClassWorkoutHistory();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

export const getInClassWorkoutHistory = createServerFn({
  method: "GET",
}).handler(async () => {
  const payload = await getWorkouts({
    page: 1,
  });

  return payload.workouts.map(workout => {
    return {
      id: workout.id,
      name: workout.name,
      date: workout.workoutDate,
      exercises: workout.segments.flatMap(segment =>
        segment.exercises.map(exercise => exercise.exerciseId),
      ),
    };
  });
});

export const workoutByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout", id],
    queryFn: () => getInClassWorkoutById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getInClassWorkoutById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const { workouts } = await getWorkouts({ id: data.id });

    const workout = workouts[0] ?? null;
    if (workout) {
      return {
        id: workout.id,
        name: workout.name,
        date: workout.workoutDate,
        exercises: workout.segments.flatMap(segment =>
          segment.exercises.map(exercise => exercise.exerciseId),
        ),
      };
    }

    return null;
  });
