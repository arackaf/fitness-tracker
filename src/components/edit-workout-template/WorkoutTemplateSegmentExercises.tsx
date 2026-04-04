import { type FC } from "react";
import { Plus } from "lucide-react";

import { type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { createDefaultExercise } from "@/data/workout-templates/workout-state";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import type { MuscleGroup } from "@/data/types";
import { WorkoutTemplateSegmentExercise } from "./WorkoutTemplateSegmentExercise";

type WorkoutTemplateSegmentExercisesProps = {
  form: WorkoutTemplateForm;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  segmentIndex: number;
  segmentSets: number;
};

export const WorkoutTemplateSegmentExercises: FC<WorkoutTemplateSegmentExercisesProps> = ({
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
          {segmentExercisesField.state.value.map((segmentExercise, exerciseIndex) => (
            <WorkoutTemplateSegmentExercise
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
          ))}

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
