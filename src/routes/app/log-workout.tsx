import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";
import { useState } from "react";

import { Workout } from "@/components/edit-workout/Workout";

import { db } from "../../drizzle/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { createWorkoutState } from "@/data/zustand-state/workout-state";

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

export const Route = createFileRoute("/app/log-workout")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0] ?? "",
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setIsSaving(true);

    try {
      // TODO
      setName("");
      setDescription("");
      setWorkoutDate(new Date().toISOString().split("T")[0] ?? "");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create workout.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const [useWorkoutState] = useState(() => createWorkoutState());
  const workoutState = useWorkoutState();

  return (
    <Workout
      exercises={exercises}
      handleSubmit={handleSubmit}
      name={name}
      setName={setName}
      description={description}
      setDescription={setDescription}
      workoutDate={workoutDate}
      setWorkoutDate={setWorkoutDate}
      workout={workoutState}
      isSaving={isSaving}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
}
