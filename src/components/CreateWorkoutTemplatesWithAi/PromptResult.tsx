import type { CompressedWorkoutTemplate } from "@/lib/compressWorkoutTemplateForLLM";
import type { PromptResponsePayload, SuccessPromptResult } from "@/durable-objects/WorkoutTemplateAIGeneration/types";
import type { FC } from "react";

import { Loading } from "@/components/loading-state/Loading";

export const DisplayPromptResult: FC<{ promptResult: PromptResponsePayload }> = props => {
  const { promptResult } = props;

  if (!promptResult)
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
    <div className="space-y-4">
      {workouts.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-400">Referenced Templates</h4>
          <div className="flex flex-wrap gap-2">
            {workouts.map((t, i) => (
              <span key={i} className="rounded bg-gray-700 px-2 py-1 text-sm text-gray-200">
                {t.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-1 text-sm font-medium text-gray-400">Prompt</h4>
        <p className="text-gray-200">{prompt.prompt}</p>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-400">Commentary</h4>
          <p className="text-gray-200">{parsedResult.commentary}</p>
        </div>

        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-400">Generated Workouts</h4>
          <div className="space-y-2">
            {parsedResult.workouts.map((_, i) => (
              <div key={i} className="rounded-md border border-gray-600 bg-gray-800 p-3 text-gray-300">
                Workout Template {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
