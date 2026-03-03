import { useState } from "react";
import { asc } from "drizzle-orm";

import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { Workout } from "@/components/edit-workout/Workout";
import type { WorkoutState } from "@/data/workouts/workout-state";
import { insertWorkout } from "@/data/workouts/insert-workout";
import { db } from "@/drizzle/db";
import { exercises as exercisesTable } from "@/drizzle/schema";

import { useWorkoutForm } from "@/lib/workout-form";
import { Header } from "@/components/Header";

const getExercisesForSelection = createServerFn({ method: "GET" }).handler(
  async () => {
    return db
      .select({
        id: exercisesTable.id,
        name: exercisesTable.name,
        muscleGroups: exercisesTable.muscleGroups,
      })
      .from(exercisesTable)
      .orderBy(asc(exercisesTable.name));
  },
);

const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "for-workout-create"],
    queryFn: () => getExercisesForSelection(),
  });

const saveWorkout = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutState) => input)
  .handler(async ({ data }) => {
    await insertWorkout(data);
  });

export const Route = createFileRoute("/app/log-workout/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  const [isSaving, setIsSaving] = useState(false);
  const form = useWorkoutForm(async state => {
    console.log("Submitting", state);

    setIsSaving(true);

    try {
      await saveWorkout({ data: state });
    } finally {
      setIsSaving(false);
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <section>
      <Header title="Log Workout" />
      <form onSubmit={handleSubmit}>
        <Workout form={form} exercises={exercises} isSaving={isSaving} />
      </form>
    </section>
  );
}
