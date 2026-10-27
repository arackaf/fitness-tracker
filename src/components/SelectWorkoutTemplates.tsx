import { useMemo, useState, type FC } from "react";
import { ChevronsUpDown } from "lucide-react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

interface SelectWorkoutTemplatesProps {
  workoutTemplates: WorkoutTemplateState[];
  exerciseNameById: Map<number, string>;
  onSelectTemplate: (template: WorkoutTemplateState) => void;
}

export const SelectWorkoutTemplates: FC<SelectWorkoutTemplatesProps> = props => {
  const { workoutTemplates, exerciseNameById, onSelectTemplate } = props;
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <>
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
            <CommandInput value={search} onValueChange={setSearch} placeholder="Search workout templates..." />
            <CommandList>
              <CommandEmpty>{search ? "No workout templates found" : "No workout templates remaining"}</CommandEmpty>
              <CommandGroup>
                {workoutTemplates.map(template => {
                  const exerciseSummary = getTemplateExerciseSummary(template, exerciseNameById);

                  return (
                    <CommandItem
                      key={template.id}
                      value={`${template.name} ${exerciseSummary} ${template.id}`}
                      onSelect={() => {
                        const close = workoutTemplates.length === 1;
                        onSelectTemplate(template);
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
    </>
  );
};
