import { Plus } from "lucide-react";
import type { FC, FormEvent } from "react";

import { Header } from "@/components/Header";
import type { Exercise } from "@/components/ExerciseSelector";
import { WorkoutSegment } from "@/components/edit-workout/WorkoutSegment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type WorkoutState } from "@/data/zustand-state/workout-state";

type WorkoutProps = {
  exercises: Exercise[];
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  workout: WorkoutState;
  onWorkoutChange: (edits: {
    name?: string | null;
    workoutDate?: string | null;
    description?: string | null;
  }) => void;
  onAddSegment: () => void;
  onSegmentChange: (
    segmentIndex: number,
    edits: {
      sets?: number | null;
    },
  ) => void;
  onAddSegmentExercise: (segmentIndex: number) => void;
  onRemoveSegment: (segmentIndex: number) => void;
  onRemoveSegmentExercise: (
    segmentIndex: number,
    exerciseIndex: number,
  ) => void;
  onSegmentExerciseChange: (
    segmentIndex: number,
    exerciseIndex: number,
    edits: {
      exerciseId?: number | null;
      repsToFailure?: boolean | null;
      repIndex?: number | null;
      reps?: number | null;
    },
  ) => void;
  isSaving: boolean;
  errorMessage: string | null;
  successMessage: string | null;
};

export const Workout: FC<WorkoutProps> = ({
  exercises,
  handleSubmit,
  workout,
  onWorkoutChange,
  onAddSegment,
  onSegmentChange,
  onAddSegmentExercise,
  onRemoveSegment,
  onRemoveSegmentExercise,
  onSegmentExerciseChange,
  isSaving,
  errorMessage,
  successMessage,
}) => {
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
                onWorkoutChange({ name: event.target.value });
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
                onWorkoutChange({ workoutDate: event.target.value });
              }}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium">Description</span>
            <Textarea
              value={workout.description ?? ""}
              onChange={event => {
                onWorkoutChange({ description: event.target.value });
              }}
              className="min-h-20"
              placeholder="Optional notes about this workout."
            />
          </label>
        </div>

        {workout.segments.map((segment, segmentIndex) => (
          <WorkoutSegment
            key={`segment-${segmentIndex + 1}`}
            segment={segment}
            exercises={exercises}
            canDelete={workout.segments.length > 1}
            onSetCountChange={setCount => {
              onSegmentChange(segmentIndex, { sets: setCount });
            }}
            onAddExercise={() => {
              onAddSegmentExercise(segmentIndex);
            }}
            onRemoveSegment={() => {
              onRemoveSegment(segmentIndex);
            }}
            onRemoveExercise={exerciseIndex => {
              onRemoveSegmentExercise(segmentIndex, exerciseIndex);
            }}
            onExerciseChange={(exerciseIndex, edits) => {
              onSegmentExerciseChange(segmentIndex, exerciseIndex, edits);
            }}
          />
        ))}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={onAddSegment}
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
};
