import { useMemo, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SelectWorkoutTemplates } from "@/components/SelectWorkoutTemplates";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { allWorkoutTemplatesQueryOptions } from "@/server-functions/workout-templates";
import { DisplaySelectedWorkoutTemplates } from "@/components/DisplaySelectedWorkoutTemplates";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { compressWorkoutTemplateForLLM } from "@/lib/compressWorkoutTemplateForLLM";
import { createAiSessionsServerFn, getAiSessionsQueryOptions } from "@/server-functions/workout-template-ai";

export const Route = createFileRoute("/app/admin/workout-templates/ai/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(allWorkoutTemplatesQueryOptions());
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
});

const MIN_PROMPT_LENGTH = 20;

function RouteComponent() {
  return (
    <SuspensePageLayout title="Create with AI">
      <RouteComponentContent />
    </SuspensePageLayout>
  );
}

function RouteComponentContent() {
  const navigate = useNavigate();
  const [selectedTemplates, setSelectedTemplates] = useState<WorkoutTemplateState[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedTemplateIds = useMemo(
    () => new Set(selectedTemplates.map(template => template.id!)),
    [selectedTemplates],
  );

  const { data: workoutTemplates } = useSuspenseQuery(allWorkoutTemplatesQueryOptions());
  const { data: exercises = [] } = useSuspenseQuery(exercisesQueryOptions());
  const exerciseNameById = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise.name])), [exercises]);
  const exerciseLookup = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise])), [exercises]);

  const { data: sessions } = useQuery(getAiSessionsQueryOptions());
  console.log({ sessions });

  const trimmedPromptLength = prompt.trim().length;
  const remainingPromptChars = MIN_PROMPT_LENGTH - trimmedPromptLength;
  const isPromptValid = remainingPromptChars <= 0;

  const handleSelectTemplate = (template: WorkoutTemplateState) => {
    setSelectedTemplates(currentTemplates => [...currentTemplates, template]);
  };

  const handleRemoveTemplate = (templateId: number) => {
    setSelectedTemplates(currentTemplates => currentTemplates.filter(template => template.id !== templateId));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await createAiSessionsServerFn({
        data: {
          promptInfo: {
            prompt,
            exercises: exercises.map(e => ({ id: e.id, name: e.name, description: e.description })),
            workoutTemplates: selectedTemplates.map(t => compressWorkoutTemplateForLLM(exerciseLookup, t)),
          },
        },
      });
      if (result?.id) {
        navigate({ to: "/app/admin/workout-templates/ai/$id", params: { id: String(result.id) } });
      } else {
        setError("Failed to create AI session. Please try again.");
      }
    } catch {
      setError("Something went wrong creating the session. Please try again.");
    }
  };

  const reset = () => {
    setPrompt("");
    setSelectedTemplates([]);
    setError(null);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Select existing templates as a reference and describe the workout you want to generate.
        </p>

        <div className="flex flex-col gap-4">
          <SelectWorkoutTemplates
            workoutTemplates={workoutTemplates.filter(template => !selectedTemplateIds.has(template.id!))}
            exerciseNameById={exerciseNameById}
            onSelectTemplate={handleSelectTemplate}
          />
          <DisplaySelectedWorkoutTemplates
            selectedTemplates={selectedTemplates}
            onRemoveTemplate={handleRemoveTemplate}
          />
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Prompt</span>
            <Textarea
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              placeholder="What are you looking for?"
              className="min-h-40"
            />
          </label>
          <div className="flex flex-col gap-2 self-start">
            <span className="text-xs text-muted-foreground">
              {!isPromptValid
                ? `${remainingPromptChars} more character${remainingPromptChars === 1 ? "" : "s"} minimum prompt`
                : " "}
            </span>
            <Button
              className="cursor-pointer w-44"
              disabled={!isPromptValid || isGenerating}
              type="button"
              onClick={handleGenerate}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
            {error && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-destructive">{error}</p>
                <Button onClick={reset} variant="secondary">
                  Start over
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
