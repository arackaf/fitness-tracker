import type { FC } from "react";
import { Plus } from "lucide-react";

import { type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { createDefaultExercise } from "@/data/workouts/workout-state";
import type { WorkoutForm } from "@/lib/workout-form";

import type { MuscleGroup } from "@/data/types";
import { WorkoutSegmentExercise } from "./WorkoutSegmentExercise";

type WorkoutSegmentExercisesProps = {
  form: WorkoutForm;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  segmentIndex: number;
  segmentSets: number;
};

export const WorkoutSegmentExercises: FC<WorkoutSegmentExercisesProps> = ({
  form,
  exercises,
  muscleGroups,
  segmentIndex,
  segmentSets,
}) => {
  return (
    <form.Field
      mode="array"
      name={`segments[${segmentIndex}].exercises`}
      children={segmentExercisesField => (
        <>
          {segmentExercisesField.state.value.map(
            (segmentExercise, exerciseIndex) => (
              <WorkoutSegmentExercise
                key={`segment-${segmentIndex}-exercise-${segmentExercise.id}`}
              form={form}
              exercises={exercises}
              muscleGroups={muscleGroups}
              segmentIndex={segmentIndex}
              exerciseIndex={exerciseIndex}
              canRemove={segmentExercisesField.state.value.length > 1}
              onRemove={() =>
                segmentExercisesField.removeValue(exerciseIndex, {
                  dontValidate: true,
                })
              }
              />
            ),
          )}

          <div className="flex items-center">
            <Button
              type="button"
              onClick={() => {
                const defaultExercise = createDefaultExercise(segmentSets);

                segmentExercisesField.pushValue({
                  ...defaultExercise,
                  exerciseOrder: segmentExercisesField.state.value.length + 1,
                });
              }}
              variant="outline"
              size="sm"
              className="font-semibold cursor-pointer"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add exercise
            </Button>
          </div>
        </>
      )}
    />
  );
};
