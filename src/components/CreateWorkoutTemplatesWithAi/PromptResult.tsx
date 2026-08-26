import type { CompressedWorkoutTemplate } from "@/lib/compressWorkoutTemplateForLLM";
import type { PromptResponsePayload, SuccessPromptResult } from "@/durable-objects/WorkoutTemplateAIGeneration/types";
import type { FC } from "react";

import { Loading } from "@/components/loading-state/Loading";

export const DisplayPromptResult: FC<{ promptResult: PromptResponsePayload }> = props => {
  const { promptResult } = props;

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
          {workouts.map((_, i) => (
            <div key={i} className="rounded-md border border-gray-600 bg-gray-800 p-3 text-gray-300">
              Workout Template {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
