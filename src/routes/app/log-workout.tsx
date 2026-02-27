import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Header } from "@/components/Header";
import { WorkoutSegment } from "@/components/create-workout/WorkoutSegment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { db } from "../../drizzle/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import {
  createWorkoutState,
  defaultExercise,
  defaultSegment,
} from "@/data/zustand-state/workout-state";

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
    <section>
      <Header title="Log Workout" />
      <p className="mb-8 text-sm text-muted-foreground dark:text-slate-300/80">
        Create a full workout with segments and ordered exercises.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Workout name</span>
            <Input
              required
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Push Day - Week 6"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Workout date</span>
            <Input
              required
              type="date"
              value={workoutDate}
              onChange={event => setWorkoutDate(event.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium">Description</span>
            <Textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              className="min-h-20"
              placeholder="Optional notes about this workout."
            />
          </label>
        </div>

        {workoutState.segments.map((segment, segmentIndex) => (
          <WorkoutSegment
            key={`segment-${segmentIndex + 1}`}
            segmentIndex={segmentIndex}
            segment={segment}
            exercises={exercises}
            canDelete={workoutState.segments.length > 1}
            updateWorkout={workoutState.update}
          />
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              workoutState.update(state => {
                state.segments.push({
                  segment: defaultSegment,
                  exercises: [defaultExercise],
                });
              });
            }}
            variant="outline"
            className="font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add segment
          </Button>

          <Button
            type="submit"
            disabled={isSaving}
            className="font-semibold"
          >
            {isSaving ? "Saving..." : "Create workout"}
          </Button>
        </div>

        {errorMessage ? (
          <p className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-md border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            {successMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
