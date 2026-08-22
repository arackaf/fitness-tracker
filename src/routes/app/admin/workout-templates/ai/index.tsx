import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SelectWorkoutTemplates } from "@/components/SelectWorkoutTemplates";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { allWorkoutTemplatesQueryOptions } from "@/server-functions/workout-templates";

export const Route = createFileRoute("/app/admin/workout-templates/ai/")({
  component: RouteComponent,
});

const MIN_PROMPT_LENGTH = 20;

function RouteComponent() {
  const [selectedTemplates, setSelectedTemplates] = useState<WorkoutTemplateState[]>([]);
  const [prompt, setPrompt] = useState("");
  const selectedTemplateIdLookup = useMemo(
    () => new Map(selectedTemplates.map(template => [template.id, template])),
    [selectedTemplates],
  );

  const { data: workoutTemplates = [], isFetching: isFetchingTemplates } = useQuery(allWorkoutTemplatesQueryOptions());
  const { data: exercises = [] } = useQuery(exercisesQueryOptions());
  const exerciseNameById = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise.name])), [exercises]);

  const trimmedPromptLength = prompt.trim().length;
  const remainingPromptChars = MIN_PROMPT_LENGTH - trimmedPromptLength;
  const isPromptValid = remainingPromptChars <= 0;

  const handleSelectTemplate = (template: WorkoutTemplateState) => {
    setSelectedTemplates(currentTemplates => [...currentTemplates, template]);
  };

  const handleRemoveTemplate = (templateId: number) => {
    setSelectedTemplates(currentTemplates => currentTemplates.filter(template => template.id !== templateId));
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h2 className="text-lg font-semibold">Create with AI</h2>
      <p className="text-sm text-muted-foreground">
        Select existing templates as reference, then describe the workout you want to generate.
      </p>

      <div className="flex flex-col gap-4">
        <SelectWorkoutTemplates
          workoutTemplates={workoutTemplates}
          exerciseNameById={exerciseNameById}
          isFetchingTemplates={isFetchingTemplates}
          selectedTemplates={selectedTemplates}
          onSelectTemplate={handleSelectTemplate}
          onRemoveTemplate={handleRemoveTemplate}
        />

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
            <Button className="cursor-pointer w-44" disabled={!isPromptValid} type="button">
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
