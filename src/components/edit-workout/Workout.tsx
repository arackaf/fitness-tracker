import { Plus } from "lucide-react";
import type { FormEvent } from "react";

import { Header } from "@/components/Header";
import type { Exercise } from "@/components/ExerciseSelector";
import { WorkoutSegment } from "@/components/edit-workout/WorkoutSegment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  defaultExercise,
  defaultSegment,
  type WorkoutState,
} from "@/data/zustand-state/workout-state";

type WorkoutProps = {
  exercises: Exercise[];
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  workout: WorkoutState;
  isSaving: boolean;
  errorMessage: string | null;
  successMessage: string | null;
};

export function Workout({
  exercises,
  handleSubmit,
  workout,
  isSaving,
  errorMessage,
  successMessage,
}: WorkoutProps) {
  return (
    <div>
      <Header title="Log Workout" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Workout name</span>
            <Input
              required
              value={workout.name}
              onChange={event => {
                workout.update(state => {
                  state.name = event.target.value;
                });
              }}
              placeholder="Push Day"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Workout date</span>
            <Input
              required
              type="date"
              value={workout.workoutDate}
              onChange={event => {
                workout.update(state => {
                  state.workoutDate = event.target.value;
                });
              }}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium">Description</span>
            <Textarea
              value={workout.description ?? ""}
              onChange={event => {
                workout.update(state => {
                  state.description = event.target.value;
                });
              }}
              className="min-h-20"
              placeholder="Optional notes about this workout."
            />
          </label>
        </div>

        {workout.segments.map((segment, segmentIndex) => (
          <WorkoutSegment
            key={`segment-${segmentIndex + 1}`}
            segmentIndex={segmentIndex}
            segment={segment}
            exercises={exercises}
            canDelete={workout.segments.length > 1}
            updateWorkout={workout.update}
          />
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              workout.update(state => {
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

          <Button type="submit" disabled={isSaving} className="font-semibold">
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
    </div>
  );
}



