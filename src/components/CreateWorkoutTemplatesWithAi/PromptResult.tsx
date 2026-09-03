import type { PromptResponsePayload } from "@/durable-objects/WorkoutTemplateAIGeneration/types";
import type { FC } from "react";

import { Loading } from "@/components/loading-state/Loading";
import { WorkoutTemplateDetailForm } from "../edit-workout-template/WorkoutTemplateDetailForm";
import type { Exercise, MuscleGroup } from "@/data/types";

export type DisplayPromptResultProps = {
  promptResult: PromptResponsePayload;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
};
export const DisplayPromptResult: FC<DisplayPromptResultProps> = props => {
  const { promptResult, exercises, muscleGroups } = props;

  if (!promptResult || promptResult.pending)
    return (
      <div className="relative min-h-24">
        <Loading placement="local" />
      </div>
    );

  if (!promptResult.success) {
    return (
      <div className="rounded-md bg-red-900/30 p-4 text-red-300">
        Something went wrong generating this response. Please try again.
      </div>
    );
  }

  const { commentary, workouts } = promptResult;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-medium text-gray-400">Commentary</h4>
        <p className="text-gray-200">{commentary}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-gray-400">Generated Workouts</h4>
        <div className="flex flex-col gap-y-2">
          {workouts.map((template, i) => (
            <WorkoutTemplateDetailForm exercises={exercises} workoutTemplate={template} muscleGroups={muscleGroups} />
          ))}
        </div>
      </div>
    </div>
  );
};
