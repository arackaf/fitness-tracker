import type { FC } from "react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";

type ModelResultsProps = {
  commentary?: string;
  exerciseNameById: Map<number, string>;
  generatedWorkouts: WorkoutTemplateState[];
};

export const ModelResults: FC<ModelResultsProps> = ({ commentary, exerciseNameById, generatedWorkouts }) => {
  const hasResults = generatedWorkouts.length > 0 || commentary != null;

  if (!hasResults) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      {commentary ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Commentary</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{commentary}</p>
        </div>
      ) : null}
      {generatedWorkouts.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium">Generated workouts</h3>
          {generatedWorkouts.map((workoutTemplate, templateIndex) => (
            <DisplayWorkoutTemplate
              key={`${workoutTemplate.name}-${templateIndex}`}
              workoutTemplate={workoutTemplate}
              exerciseNameById={exerciseNameById}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
