import { useMemo, useState } from "react";
import { useExerciseMap } from "@/lib/exercise-map";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Button } from "@/components/ui/button";
import { SelectWorkoutTemplates } from "@/components/SelectWorkoutTemplates";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { allWorkoutTemplatesQueryOptions } from "@/server-functions/workout-templates";
import { DisplaySelectedWorkoutTemplates } from "@/components/DisplaySelectedWorkoutTemplates";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { compressWorkoutTemplateForLLM } from "@/lib/compressWorkoutTemplateForLLM";
import { createAiSessionsServerFn, getAiSessionsQueryOptions } from "@/server-functions/workout-template-ai";
import { PromptInput } from "@/components/CreateWorkoutTemplatesWithAi/PromptInput";
import { PromptHistory } from "@/components/CreateWorkoutTemplatesWithAi/PromptHistory";

export const Route = createFileRoute("/app/admin/workout-templates/ai/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(allWorkoutTemplatesQueryOptions());
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
});

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const selectedTemplateIds = useMemo(
    () => new Set(selectedTemplates.map(template => template.id!)),
    [selectedTemplates],
  );

  const { data: aiSessions = [] } = useQuery(getAiSessionsQueryOptions());
  const { data: workoutTemplates } = useSuspenseQuery(allWorkoutTemplatesQueryOptions());
  const { data: exercises = [] } = useSuspenseQuery(exercisesQueryOptions());
  const exerciseNameById = useExerciseMap(exercises);
  const exerciseLookup = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise])), [exercises]);

  const handleSelectTemplate = (template: WorkoutTemplateState) => {
    setSelectedTemplates(currentTemplates => [...currentTemplates, template]);
  };

  const handleRemoveTemplate = (templateId: number) => {
    setSelectedTemplates(currentTemplates => currentTemplates.filter(template => template.id !== templateId));
  };

  const handleGenerate = async (prompt: string) => {
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
        setError("Failed to create AI session");
      }
    } catch {
      setError("Something went wrong creating the session");
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

        <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerate} isGenerating={isGenerating} />
        {error && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={reset} variant="secondary">
              Start over
            </Button>
          </div>
        )}
      </div>

      <PromptHistory sessions={aiSessions} />
    </div>
  );
}
