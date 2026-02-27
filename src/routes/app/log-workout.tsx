import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Header } from "@/components/Header";
import { WorkoutSegmentExerciseFields } from "@/components/create-workout/WorkoutSegmentExerciseFields";

import { db } from "../../drizzle/db";
import {
  exercises,
  workoutSegment,
  workoutSegmentExercise,
} from "../../drizzle/schema";
import {
  createWorkoutState,
  defaultExercise,
} from "@/data/zustand-state/workout-state";

type DraftSegmentExercise = {
  exerciseId: string;
  reps: string;
  repsToFailure: boolean;
};

type DraftSegment = {
  sets: string;
  exercises: DraftSegmentExercise[];
};

const createDraftExercise = (): DraftSegmentExercise => ({
  exerciseId: "",
  reps: "8",
  repsToFailure: false,
});

const createDraftSegment = (): DraftSegment => ({
  sets: "3",
  exercises: [createDraftExercise()],
});

const getExercisesForSelection = createServerFn({ method: "GET" }).handler(
  async () => {
    return db
      .select({
        id: exercises.id,
        name: exercises.name,
      })
      .from(exercises)
      .orderBy(asc(exercises.name));
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
  const { data: exerciseOptions } = useSuspenseQuery(exercisesQueryOptions());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0] ?? "",
  );
  const [segments, setSegments] = useState<DraftSegment[]>([
    createDraftSegment(),
  ]);
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
      setSegments([createDraftSegment()]);
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
            <input
              required
              value={name}
              onChange={event => setName(event.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2"
              placeholder="Push Day - Week 6"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Workout date</span>
            <input
              required
              type="date"
              value={workoutDate}
              onChange={event => setWorkoutDate(event.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium">Description</span>
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              className="min-h-20 rounded-md border border-input bg-background px-3 py-2"
              placeholder="Optional notes about this workout."
            />
          </label>
        </div>

        {workoutState.segments.map((segmentPayload, segmentIndex) => (
          <div
            key={`segment-${segmentIndex + 1}`}
            className="space-y-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">
                Segment {segmentIndex + 1}
              </h2>
              <button
                type="button"
                onClick={() => {
                  workoutState.update(state => {
                    state.segments.splice(segmentIndex, 1);
                  });
                }}
                disabled={segments.length === 1}
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove segment
              </button>
            </div>

            <label className="flex max-w-36 flex-col gap-2 text-sm">
              <span className="font-medium">Sets</span>
              <input
                required
                min={1}
                type="number"
                value={String(segmentPayload.segment.sets)}
                onChange={event => {
                  const setCount = Number(event.target.value);

                  workoutState.update(state => {
                    state.segments[segmentIndex].segment.sets = setCount;
                    state.segments[segmentIndex].exercises.forEach(exercise => {
                      if (!exercise.reps) {
                        exercise.reps = [];
                      }

                      exercise.reps.length = setCount;
                      exercise.reps[setCount - 1] =
                        exercise.reps[setCount - 2] || 0;
                    });
                  });
                }}
                className="rounded-md border border-input bg-background px-3 py-2"
              />
            </label>

            <div className="space-y-3">
              {segmentPayload.exercises.map(
                (segmentExercise, exerciseIndex) => (
                  <WorkoutSegmentExerciseFields
                    updateExercise={updater => {
                      workoutState.update(state => {
                        const exercise =
                          state.segments[segmentIndex].exercises[exerciseIndex];
                        updater(exercise);
                      });
                    }}
                    key={`segment-${segmentIndex + 1}-exercise-${exerciseIndex + 1}`}
                    segmentExercise={segmentExercise}
                    exerciseOptions={exerciseOptions}
                    onRemove={
                      workoutState.segments[segmentIndex].exercises.length === 1
                        ? undefined
                        : () =>
                            workoutState.update(state => {
                              state.segments[segmentIndex].exercises.splice(
                                exerciseIndex,
                                1,
                              );
                            })
                    }
                  />
                ),
              )}

              <button
                type="button"
                onClick={() => {
                  workoutState.update(state => {
                    state.segments[segmentIndex].exercises.push(
                      defaultExercise,
                    );
                  });
                }}
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-semibold"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add exercise
              </button>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              workoutState.update(state => {
                state.segments.push({
                  segment: workoutSegment.$inferInsert,
                  exercises: [workoutSegmentExercise.$inferInsert],
                });
              });
            }}
            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add segment
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSaving ? "Saving..." : "Create workout"}
          </button>
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
