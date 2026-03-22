import { useRef, type FC } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mutateWorkoutName } from "@/server-functions/in-class/mutate-workout-name";
import {
  getInClassWorkoutHistory,
  type InClassWorkout,
} from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/4/workouts/")({
  component: RouteComponent,
  validateSearch: (input: Record<string, string>) => {
    return {
      page: input.page ? Number(input.page) || 1 : 1,
    };
  },
  loaderDeps: ({ search }) => {
    return { page: search.page };
  },
  loader: async ({ deps }) => {
    const workoutsPayload = await getInClassWorkoutHistory({
      data: { operation: "load-workouts", page: deps.page },
    });

    return {
      page: workoutsPayload.page,
      hasNextPage: workoutsPayload.hasNextPage,
      workouts: workoutsPayload.workouts,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 1000 * 60 * 5,
  staleTime: 1000 * 60 * 5,
});

function RouteComponent() {
  const { workouts, hasNextPage } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const navigate = useNavigate();

  const { isFetching } = Route.useMatch();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1>Workouts</h1>
        {isFetching ? (
          <span className="text-sm text-pink-500">Reloading...</span>
        ) : null}
      </div>
      {workouts.map(workout => (
        <RenderWorkout key={workout.id} workout={workout} />
      ))}
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          onClick={() => {
            navigate({
              to: "/lessons/4/workouts",
              search: {
                page: page - 1,
              },
            });
          }}
          disabled={page <= 1}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={() => {
            navigate({
              to: "/lessons/4/workouts",
              search: {
                page: page + 1,
              },
            });
          }}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
      <Link to="/lessons/4/workouts/other-path">Other path</Link>
    </div>
  );
}

const RenderWorkout: FC<{
  workout: InClassWorkout;
}> = props => {
  const { workout } = props;
  const workoutNameInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="flex gap-2">
          <span>{workout.name}</span>

          <Link
            to={`/lessons/4/workouts/$id`}
            params={{ id: String(workout.id) }}
            className="ml-auto"
            preload={false}
          >
            View
          </Link>
        </span>
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
          }}
        >
          Update name
        </Button>
      </div>
    </div>
  );
};
