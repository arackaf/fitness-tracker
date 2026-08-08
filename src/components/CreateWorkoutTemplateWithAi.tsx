import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown, X } from "lucide-react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { allWorkoutTemplatesQueryOptions } from "@/server-functions/workout-templates";

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

export function CreateWorkoutTemplateWithAi() {
  const [isOpen, setIsOpen] = useState(false);
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<WorkoutTemplateState[]>([]);
  const [prompt, setPrompt] = useState("");

  const { data: workoutTemplates = [], isFetching: isFetchingTemplates } = useQuery({
    ...allWorkoutTemplatesQueryOptions(),
    enabled: isOpen,
  });
  const { data: exercises = [] } = useQuery({
    ...exercisesQueryOptions(),
    enabled: isOpen,
  });

  const exerciseNameById = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise.name])), [exercises]);

  const selectedTemplateIds = useMemo(
    () => new Set(selectedTemplates.map(template => template.id)),
    [selectedTemplates],
  );

  const availableTemplates = useMemo(
    () => workoutTemplates.filter(template => template.id != null && !selectedTemplateIds.has(template.id)),
    [selectedTemplateIds, workoutTemplates],
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      setIsComboboxOpen(false);
      setSelectedTemplates([]);
      setPrompt("");
    }
  };

  const handleSelectTemplate = (template: WorkoutTemplateState) => {
    setSelectedTemplates(currentTemplates => [...currentTemplates, template]);
  };

  const handleRemoveTemplate = (templateId: number) => {
    setSelectedTemplates(currentTemplates => currentTemplates.filter(template => template.id !== templateId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="secondary">Create with AI</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create with AI</DialogTitle>
          <DialogDescription>
            Select existing templates as reference, then describe the workout you want to generate.
          </DialogDescription>
        </DialogHeader>

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
                            handleSelectTemplate(template);
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

          <div className="flex gap-2 text-sm">
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

          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Prompt</span>
            <Textarea
              value={prompt}
              onChange={event => setPrompt(event.target.value)}
              placeholder="Describe the workout template you want to create..."
              className="min-h-40"
            />
          </label>

          <Button type="button" className="self-start">
            Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
