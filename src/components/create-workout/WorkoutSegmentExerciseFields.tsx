import type { WorkoutSegmentExercise } from "@/data/zustand-state/workout-state";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type ExerciseOption = {
  id: number;
  name: string | null;
  muscleGroups: string[] | null;
};

type WorkoutSegmentExerciseFieldsProps = {
  updateExercise: (
    callback: (exercise: WorkoutSegmentExercise) => void,
  ) => void;
  segmentExercise: WorkoutSegmentExercise;
  exerciseOptions: ExerciseOption[];
  onRemove?: () => void;
};

export function WorkoutSegmentExerciseFields({
  updateExercise,
  segmentExercise,
  exerciseOptions,
  onRemove,
}: WorkoutSegmentExerciseFieldsProps) {
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  const groupedExerciseOptions = useMemo(() => {
    const groups = new Map<
      string,
      Array<{
        id: number;
        name: string;
        muscleGroupListLabel: string;
        searchableText: string;
      }>
    >();

    for (const option of exerciseOptions) {
      const optionName = option.name ?? `Exercise #${option.id}`;
      const normalizedMuscleGroups = Array.from(
        new Set((option.muscleGroups ?? []).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b));
      const optionGroups =
        normalizedMuscleGroups.length > 0
          ? normalizedMuscleGroups
          : ["Ungrouped"];
      const muscleGroupListLabel =
        normalizedMuscleGroups.length > 0
          ? normalizedMuscleGroups.join(", ")
          : "Ungrouped";

      for (const groupName of optionGroups) {
        const existingGroupEntries = groups.get(groupName) ?? [];
        existingGroupEntries.push({
          id: option.id,
          name: optionName,
          muscleGroupListLabel,
          searchableText: `${optionName} ${muscleGroupListLabel} ${groupName} ${option.id}`,
        });
        groups.set(groupName, existingGroupEntries);
      }
    }

    return Array.from(groups.entries())
      .sort(([groupNameA], [groupNameB]) => groupNameA.localeCompare(groupNameB))
      .map(([groupName, optionsByGroup]) => ({
        groupName,
        options: optionsByGroup.sort((optionA, optionB) =>
          optionA.name.localeCompare(optionB.name),
        ),
      }));
  }, [exerciseOptions]);

  const selectedExercise = exerciseOptions.find(
    option => option.id === segmentExercise.exerciseId,
  );
  const selectedExerciseLabel = selectedExercise
    ? selectedExercise.name ?? `Exercise #${selectedExercise.id}`
    : "Select an exercise";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/80 bg-background/70 p-5">
      <div className="flex gap-3 items-center">
        <label className="flex flex-col gap-2 text-sm">
          <input
            required
            value={segmentExercise.exerciseId ? String(segmentExercise.exerciseId) : ""}
            readOnly
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <Popover
            open={isExercisePickerOpen}
            onOpenChange={setIsExercisePickerOpen}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={isExercisePickerOpen}
                className="min-w-64 justify-between font-normal"
              >
                <span className="truncate">{selectedExerciseLabel}</span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-64 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search exercise or muscle group..." />
                <CommandList>
                  <CommandEmpty>No exercises found.</CommandEmpty>
                  {groupedExerciseOptions.map(group => (
                    <CommandGroup key={group.groupName} heading={group.groupName}>
                      {group.options.map(option => {
                        const isSelected = option.id === segmentExercise.exerciseId;

                        return (
                          <CommandItem
                            key={`${group.groupName}-${option.id}`}
                            value={option.searchableText}
                            onSelect={() => {
                              updateExercise(exercise => {
                                exercise.exerciseId = option.id;
                              });
                              setIsExercisePickerOpen(false);
                            }}
                            className="flex items-start justify-between gap-2"
                          >
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate">{option.name}</span>
                              <span className="truncate text-xs text-muted-foreground">
                                {option.muscleGroupListLabel}
                              </span>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto size-4 shrink-0",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </label>

        <div className="flex items-end ml-auto">
          <button
            type="button"
            onClick={onRemove}
            disabled={!onRemove}
            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      <div className="flex gap-2  min-h-7">
        <div className="h-7 flex items-center">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground text-nowrap">
            <input
              type="checkbox"
              checked={segmentExercise.repsToFailure}
              onChange={event => {
                updateExercise(exercise => {
                  exercise.repsToFailure = event.target.checked;
                });
              }}
            />
            Reps to failure
          </label>
        </div>

        {!segmentExercise.repsToFailure ? (
          <div className="flex items-center gap-3 text-sm md:col-span-2 ml-2">
            <div className="h-7 flex self-start items-center">
              <span className="font-medium">Reps</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {segmentExercise.reps?.map((reps, index) => {
                const setNumber = index + 1;
                return (
                  <label
                    key={`reps-${setNumber}`}
                    className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    <span>{setNumber}:</span>
                    <input
                      required={index === 0}
                      min={1}
                      type="number"
                      value={reps}
                      onChange={event => {
                        updateExercise(exercise => {
                          exercise.reps![index] = parseInt(event.target.value);
                        });
                      }}
                      className="w-16 rounded-md border border-input bg-background px-2 py-1"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
