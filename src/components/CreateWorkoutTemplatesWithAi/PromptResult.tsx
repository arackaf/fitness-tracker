import type { CompressedWorkoutTemplate } from "@/lib/compressWorkoutTemplateForLLM";
import type { QueriedPromptResult, SuccessPromptResult } from "@/durable-objects/WorkoutTemplateAIGeneration/types";
import type { FC } from "react";

import { Loading } from "@/components/loading-state/Loading";

export const DisplayPromptResult: FC<{ promptResult: QueriedPromptResult }> = ({ promptResult }) => {
  const { prompt, result } = promptResult;

  if (!prompt) return null;

  if (prompt.error) {
    return <div className="rounded-md bg-red-900/30 p-4 text-red-300">Something went wrong generating this response. Please try again.</div>;
  }

  const referencedTemplates: CompressedWorkoutTemplate[] = JSON.parse(prompt.workoutTemplates);
  const parsedResult: SuccessPromptResult | null = result?.result ? JSON.parse(result.result) : null;

  return (
    <div className="space-y-4">
      {referencedTemplates.length > 0 && (
        <div>
          <h4 className="mb-1 text-sm font-medium text-gray-400">Referenced Templates</h4>
          <div className="flex flex-wrap gap-2">
            {referencedTemplates.map((t, i) => (
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

      {prompt.pending ? (
        <div className="relative min-h-24">
          <Loading placement="local" />
        </div>
      ) : parsedResult ? (
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
      ) : null}
    </div>
  );
};
