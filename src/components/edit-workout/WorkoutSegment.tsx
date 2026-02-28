import { Plus, Trash2 } from "lucide-react";

import type { Exercise } from "@/components/ExerciseSelector";
import { WorkoutSegmentExerciseFields } from "@/components/edit-workout/WorkoutSegmentExerciseFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  defaultExercise,
  type SegmentWithExercises,
  type WorkoutState,
} from "@/data/zustand-state/workout-state";

type WorkoutSegmentProps = {
  segmentIndex: number;
  segment: SegmentWithExercises;
  exercises: Exercise[];
  canDelete: boolean;
  updateWorkout: (callback: (state: WorkoutState) => void) => void;
};

export function WorkoutSegment({
  segmentIndex,
  segment,
  exercises,
  canDelete,
  updateWorkout,
}: WorkoutSegmentProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55">
      <label className="flex items-center max-w-36 gap-2 text-sm">
        <span className="font-medium">Sets:</span>
        <Input
          required
          min={1}
          type="number"
          value={String(segment.segment.sets)}
          onChange={event => {
            const setCount = Number(event.target.value);

            updateWorkout(state => {
              state.segments[segmentIndex].segment.sets = setCount;
              state.segments[segmentIndex].exercises.forEach(exercise => {
                if (!exercise.reps) {
                  exercise.reps = [];
                }

                exercise.reps.length = setCount;
                exercise.reps[setCount - 1] = exercise.reps[setCount - 2] || 0;
              });
            });
          }}
        />
      </label>

      <div className="space-y-3">
        {segment.exercises.map((segmentExercise, exerciseIndex) => (
          <WorkoutSegmentExerciseFields
            updateExercise={updater => {
              updateWorkout(state => {
                const exercise =
                  state.segments[segmentIndex].exercises[exerciseIndex];
                updater(exercise);
              });
            }}
            key={`segment-${segmentIndex + 1}-exercise-${exerciseIndex + 1}`}
            segmentExercise={segmentExercise}
            exercises={exercises}
            onRemove={
              segment.exercises.length === 1
                ? undefined
                : () =>
                    updateWorkout(state => {
                      state.segments[segmentIndex].exercises.splice(
                        exerciseIndex,
                        1,
                      );
                    })
            }
          />
        ))}

        <div className="flex items-center">
          <Button
            type="button"
            onClick={() => {
              updateWorkout(state => {
                state.segments[segmentIndex].exercises.push(defaultExercise);
              });
            }}
            variant="outline"
            size="sm"
            className="font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add exercise
          </Button>
          <Button
            type="button"
            onClick={() => {
              updateWorkout(state => {
                state.segments.splice(segmentIndex, 1);
              });
            }}
            disabled={!canDelete}
            variant="secondary"
            size="sm"
            className="ml-auto"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove segment
          </Button>
        </div>
      </div>
    </div>
  );
}
