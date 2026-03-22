import { useMemo, useRef, type FC } from "react";
import {
  createFileRoute,
  Link,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mutateWorkoutName } from "@/server-functions/in-class/mutate-workout-name";
import {
  getInClassWorkoutHistory,
  type InClassWorkout,
} from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/5/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const workoutsPayload = await getInClassWorkoutHistory({
      data: { operation: "load-workouts" },
    });

    return {
      workouts: workoutsPayload.workouts,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 1000 * 60 * 5,
  staleTime: 1000 * 60 * 5,
});

function RouteComponent() {
  const { workouts } = Route.useLoaderData();

  const { exercises } = useLoaderData({
    from: "/lessons/5/workouts",
  });

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1>Workouts</h1>
      </div>
      {workouts.map(workout => (
        <RenderWorkout
          key={workout.id}
          workout={workout}
          exerciseLookup={exerciseLookup}
        />
      ))}
    </div>
  );
}

const RenderWorkout: FC<{
  workout: InClassWorkout;
  exerciseLookup: Map<number, { name: string }>;
}> = props => {
  const { workout, exerciseLookup } = props;
  const workoutNameInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="flex gap-2">
          <span>{workout.name}</span>
          <Link
            to={`/lessons/5/workouts/$id`}
            params={{ id: String(workout.id) }}
            className="ml-auto"
            preload={false}
          >
            View
          </Link>
        </span>
        <div>
          <span>Exercises:</span>
          <span>
            (
            {workout.exercises
              .map(exercise => exerciseLookup.get(exercise)!.name)
              .join(", ")}
            )
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Input ref={workoutNameInputRef} defaultValue={workout.name} />
        <Button
          type="button"
          onClick={async () => {
            const newName = workoutNameInputRef.current?.value ?? "";
            await mutateWorkoutName({
              data: {
                id: workout.id,
                newName,
              },
            });
            await router.invalidate({
              filter: route =>
                route.routeId === "/lessons/5/workouts/" ||
                (route.routeId === "/lessons/5/workouts/$id" &&
                  route.params.id === String(workout.id)),
            });
          }}
        >
          Update name
        </Button>
      </div>
    </div>
  );
};
