import { Plus, Trash2 } from "lucide-react";
import type { FC } from "react";

import type { Exercise } from "@/components/ExerciseSelector";
import { WorkoutSegmentExerciseFields } from "@/components/edit-workout/WorkoutSegmentExerciseFields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type SegmentWithExercises } from "@/data/zustand-state/workout-state";

type WorkoutSegmentProps = {
  segment: SegmentWithExercises;
  exercises: Exercise[];
  canDelete: boolean;
  onSetCountChange: (setCount: number) => void;
  onAddExercise: () => void;
  onRemoveSegment: () => void;
  onRemoveExercise: (exerciseIndex: number) => void;
  onExerciseChange: (
    exerciseIndex: number,
    edits: {
      exerciseId?: number | null;
      repsToFailure?: boolean | null;
      repIndex?: number | null;
      reps?: number | null;
    },
  ) => void;
};

export const WorkoutSegment: FC<WorkoutSegmentProps> = ({
  segment,
  exercises,
  canDelete,
  onSetCountChange,
  onAddExercise,
  onRemoveSegment,
  onRemoveExercise,
  onExerciseChange,
}) => {
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
            onSetCountChange(setCount);
          }}
        />
      </label>

      <div className="space-y-3">
        {segment.exercises.map((segmentExercise, exerciseIndex) => (
          <WorkoutSegmentExerciseFields
            key={`exercise-${exerciseIndex + 1}`}
            segmentExercise={segmentExercise}
            exercises={exercises}
            onExerciseChange={edits => {
              onExerciseChange(exerciseIndex, edits);
            }}
            onRemove={
              segment.exercises.length === 1
                ? undefined
                : () => onRemoveExercise(exerciseIndex)
            }
          />
        ))}

        <div className="flex items-center">
          <Button
            type="button"
            onClick={onAddExercise}
            variant="outline"
            size="sm"
            className="font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add exercise
          </Button>
          <Button
            type="button"
            onClick={onRemoveSegment}
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
};
