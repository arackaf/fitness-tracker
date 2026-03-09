import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

type Workout = {
  id: number;
  name: string;
  date: string;
  exercises: number[];
};

type Exercise = {
  id: number;
  name: string;
};

export const Route = createFileRoute("/lessons/lesson2-final/workouts/$id")({
  component: RouteComponent,
  loader: ({ params }) => {
    const workout: Workout = {
      id: Number(params.id),
      name: "My Workout",
      date: "2026-01-01",
      exercises: [1, 2, 3],
    };

    const exercises: Exercise[] = [
      { id: 1, name: "Pull-ups" },
      { id: 2, name: "Push-ups" },
      { id: 3, name: "Bench Press" },
    ];

    return {
      workout,
      exercises,
    };
  },
});

function RouteComponent() {
  const { workout, exercises } = Route.useLoaderData();
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg">{workout.name}</h1>
      <span>Id: {workout.id}</span>
      <span>Date: {workout.date}</span>
      <span>
        exercises:
        {workout.exercises
          .map(exercise => exerciseLookup.get(exercise)!.name)
          .join(", ")}
      </span>
    </div>
  );
}
