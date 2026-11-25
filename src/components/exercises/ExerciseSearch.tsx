import { useEffect, useMemo, useState, type FC } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { exercisesSearchQueryOptions } from "@/server-functions/exercises-query-options";
import type { MuscleGroup } from "./ExerciseSelector";

const DEBOUNCE_MS = 300;

export type SelectedExercise = {
  id: number;
  name: string;
};

type ExerciseSearchProps = {
  selectedExercise?: SelectedExercise | null;
  muscleGroups: MuscleGroup[];
  excludeExercises?: number[];
  onSelect: (exercise: SelectedExercise) => void;
  className?: string;
};

type MuscleGroupOption = {
  id: number;
  name: string;
  muscleGroupListLabel: string;
};

export const ExerciseSearch: FC<ExerciseSearchProps> = props => {
  const { selectedExercise, muscleGroups, excludeExercises = [], onSelect, className = "" } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed === searchTerm) {
      return;
    }
    const timeout = setTimeout(() => setSearchTerm(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [inputValue, searchTerm]);

  const { data: exercises = [], isFetching } = useQuery({
    ...exercisesSearchQueryOptions(searchTerm),
    enabled: searchTerm.length > 0,
    placeholderData: keepPreviousData,
  });

  const muscleGroupLookup = useMemo(() => {
    return new Map(muscleGroups.map(group => [group.id, group]));
  }, [muscleGroups]);

  const groupedOptions = useMemo(() => {
    if (!searchTerm) {
      return [];
    }

    const groups = new Map<string, MuscleGroupOption[]>();
    const excluded = new Set(excludeExercises);

    for (const exercise of exercises) {
      if (excluded.has(exercise.id)) {
        continue;
      }

      const normalizedMuscleGroups = exercise.muscleGroups
        .map(group => muscleGroupLookup.get(group)!)
        .filter(group => group)
        .map(group => group.name.charAt(0).toLocaleUpperCase() + group.name.slice(1))
        .sort((a, b) => a.localeCompare(b));

      const groupName = normalizedMuscleGroups.length > 0 ? normalizedMuscleGroups.join(", ") : "Ungrouped";

      const existingEntries = groups.get(groupName) ?? [];
      existingEntries.push({
        id: exercise.id,
        name: exercise.name,
        muscleGroupListLabel: groupName,
      });
      groups.set(groupName, existingEntries);
    }

    return Array.from(groups.entries())
      .sort(([groupNameA], [groupNameB]) => groupNameA.localeCompare(groupNameB))
      .map(([groupName, groupOptions]) => ({
        groupName,
        options: groupOptions.sort((optionA, optionB) => optionA.name.localeCompare(optionB.name)),
      }));
  }, [exercises, excludeExercises, muscleGroupLookup, searchTerm]);

  const emptyMessage = !searchTerm ? "Search for exercises" : isFetching ? "Searching..." : "No exercises found.";

  return (
    <>
      <input
        value={selectedExercise ? String(selectedExercise.id) : ""}
        readOnly
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "min-w-40 px-2 sm:px-4 max-w-40 sm:min-w-64 sm:max-w-64 justify-between font-normal",
              className,
            )}
          >
            <span className="truncate">{selectedExercise?.name ?? "Select an exercise"}</span>
            <ChevronsUpDown className="ml-0 sm:ml-2 size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-64 p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search exercise..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={e => {
                const trimmed = inputValue.trim();
                // Search immediately on Enter if the debounced search hasn't caught up yet;
                // otherwise let cmdk select the highlighted item.
                if (e.key === "Enter" && trimmed !== searchTerm) {
                  e.preventDefault();
                  setSearchTerm(trimmed);
                }
              }}
            />
            <CommandList>
              {groupedOptions.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</div>
              )}
              {groupedOptions.map(group => (
                <CommandGroup key={group.groupName} heading={group.groupName}>
                  {group.options.map(option => {
                    const isSelected = option.id === selectedExercise?.id;

                    return (
                      <CommandItem
                        key={`${group.groupName}-${option.id}`}
                        value={`${option.id}`}
                        onSelect={() => {
                          onSelect({ id: option.id, name: option.name });
                          setIsOpen(false);
                        }}
                        className="flex items-start justify-between gap-2"
                      >
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{option.name}</span>
                          <span className="truncate text-xs text-muted-foreground">{option.muscleGroupListLabel}</span>
                        </div>
                        <Check className={cn("ml-auto size-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};
