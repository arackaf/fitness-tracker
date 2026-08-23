import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronsUpDown, X } from "lucide-react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import type { ExerciseRow } from "@/data/types";
import { ModelResults } from "@/components/CreateWorkoutTemplatesWithAi/ModelResults";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { compressWorkoutTemplateForLLM } from "@/lib/compressWorkoutTemplateForLLM";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { generateWorkoutTemplateWithAi, type PromptReturnType } from "@/server-functions/workout-template-ai";
import { allWorkoutTemplatesQueryOptions } from "@/server-functions/workout-templates";
import type { GatewayModelId } from "ai";

export const Route = createFileRoute("/app/ai-sandbox/")({
  component: RouteComponent,
});

const MIN_PROMPT_LENGTH = 20;

function getTemplateExerciseSummary(
  workoutTemplate: WorkoutTemplateState,
  exerciseNameById: Map<number, string>,
): string {
  return workoutTemplate.segments
    .flatMap(segment =>
      segment.exercises.map(
        exercise => exerciseNameById.get(exercise.exerciseId) ?? `Exercise #${exercise.exerciseId}`,
      ),
    )
    .join(", ");
}

function RouteComponent() {
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<WorkoutTemplateState[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isError, setIsError] = useState(false);

  const [promptResults, setPromptResults] = useState<({ model: GatewayModelId } & PromptReturnType)[]>([]);

  const { data: workoutTemplates = [], isFetching: isFetchingTemplates } = useQuery(allWorkoutTemplatesQueryOptions());
  const { data: exercises = [] } = useQuery(exercisesQueryOptions());

  const exerciseLookup: Map<number, ExerciseRow> = useMemo(
    () => new Map(exercises.map(exercise => [exercise.id, exercise])),
    [exercises],
  );
  const exerciseNameById = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise.name])), [exercises]);

  const selectedTemplateIds = useMemo(
    () => new Set(selectedTemplates.map(template => template.id)),
    [selectedTemplates],
  );

  const availableTemplates = useMemo(
    () => workoutTemplates.filter(template => template.id != null && !selectedTemplateIds.has(template.id)),
    [selectedTemplateIds, workoutTemplates],
  );

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
    setIsError(false);
    setIsGenerating(true);

    const models: GatewayModelId[] = [
      "anthropic/claude-sonnet-4.5", //$15
      "anthropic/claude-sonnet-4.6", //$15
      "openai/gpt-5.4-nano", //$1.25
      "openai/gpt-5.4-mini", //$4.50
      "openai/gpt-5.4", //$15.00
      "openai/gpt-5", //$10.00
      "openai/o4-mini", //$4.40
    ];

    for (const model of models) {
      generateWorkoutTemplateWithAi({
        data: {
          prompt,
          model,
          workoutNames: selectedTemplates.map(template => template.name),
          exercises: exercises.map(exercise => ({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description,
          })),
          workoutTemplates: selectedTemplates.map(template => compressWorkoutTemplateForLLM(exerciseLookup, template)),
        },
      }).then(result => {
        setPromptResults(currentResults => [...currentResults, { model, ...result }]);
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Sandbox</h1>
        <p className="text-sm text-muted-foreground">
          Select existing templates as reference, then describe the workout you want to generate.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={isComboboxOpen}
              className="w-full justify-between font-normal"
            >
              <span className="truncate text-muted-foreground">Select workout templates...</span>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
            <Command>
              <CommandInput placeholder="Search workout templates..." />
              <CommandList>
                <CommandEmpty>
                  {isFetchingTemplates ? "Loading templates..." : "No workout templates found."}
                </CommandEmpty>
                <CommandGroup>
                  {availableTemplates.map(template => {
                    const exerciseSummary = getTemplateExerciseSummary(template, exerciseNameById);

                    return (
                      <CommandItem
                        key={template.id}
                        value={`${template.name} ${exerciseSummary} ${template.id}`}
                        onSelect={() => {
                          const close = availableTemplates.length === 1;
                          handleSelectTemplate(template);
                          if (close) {
                            setIsComboboxOpen(false);
                          }
                        }}
                        className="flex items-start justify-between gap-2"
                      >
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="truncate font-medium">{template.name}</span>
                          {exerciseSummary ? (
                            <span className="truncate text-xs text-muted-foreground">{exerciseSummary}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No exercises</span>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="flex gap-2 text-sm min-h-5.5">
          <span className="font-medium">Selected workouts:</span>
          {selectedTemplates.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTemplates.map(template => (
                <Badge key={template.id} variant="secondary" className="gap-1 pr-1">
                  <span className="max-w-48 truncate">{template.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${template.name}`}
                    className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    onClick={() => {
                      if (template.id != null) {
                        handleRemoveTemplate(template.id);
                      }
                    }}
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
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
                : "\u00A0"}
            </span>
            <Button
              className="cursor-pointer w-44"
              disabled={isGenerating || !isPromptValid}
              onClick={handleGenerate}
              type="button"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
            {isError ? <p className="text-sm text-destructive">There was an error generating this response.</p> : null}
          </div>
        </div>

        {promptResults.map(result =>
          result.success ? (
            <div className="flex flex-col gap-2">
              <span>{result.model.toString()}</span>
              <span>Input: {result.usage.inputTokens}</span>
              <span>Output: {result.usage.outputTokens}</span>
              <span>Cost: {result.cost}</span>
              <ModelResults
                commentary={result.commentary}
                exerciseNameById={exerciseNameById}
                generatedWorkouts={result.workouts}
              />
              <hr className="border-t-4 border-white my-4" />
            </div>
          ) : (
            <div>{result.model} Error</div>
          ),
        )}
      </div>
    </div>
  );
}
