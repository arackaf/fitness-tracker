import { Check, ChevronsUpDown } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type ExerciseSelectorOption = {
  id: number;
  name: string | null;
  muscleGroups: string[] | null;
};

type ExerciseSelectorProps = {
  value: number | null;
  options: ExerciseSelectorOption[];
  onSelect: (exerciseId: number) => void;
  required?: boolean;
};

export function ExerciseSelector({
  value,
  options,
  onSelect,
  required = false,
}: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groupedOptions = useMemo(() => {
    const groups = new Map<
      string,
      Array<{
        id: number;
        name: string;
        muscleGroupListLabel: string;
        searchableText: string;
      }>
    >();

    for (const option of options) {
      const optionName = option.name ?? `Exercise #${option.id}`;
      const normalizedMuscleGroups = Array.from(
        new Set(
          (option.muscleGroups ?? [])
            .map(muscleGroup => muscleGroup.trim())
            .filter(Boolean),
        ),
      )
        .map(
          muscleGroup =>
            muscleGroup.charAt(0).toLocaleUpperCase() +
            muscleGroup.slice(1),
        )
        .sort((a, b) => a.localeCompare(b));
      const muscleGroupListLabel =
        normalizedMuscleGroups.length > 0
          ? normalizedMuscleGroups.join(", ")
          : "Ungrouped";
      const groupName = muscleGroupListLabel;

      const existingEntries = groups.get(groupName) ?? [];
      existingEntries.push({
        id: option.id,
        name: optionName,
        muscleGroupListLabel,
        searchableText: `${optionName} ${muscleGroupListLabel} ${groupName} ${option.id}`,
      });
      groups.set(groupName, existingEntries);
    }

    return Array.from(groups.entries())
      .sort(([groupNameA], [groupNameB]) =>
        groupNameA.localeCompare(groupNameB),
      )
      .map(([groupName, groupOptions]) => ({
        groupName,
        options: groupOptions.sort((optionA, optionB) =>
          optionA.name.localeCompare(optionB.name),
        ),
      }));
  }, [options]);

  const selectedOption = options.find(option => option.id === value);
  const selectedLabel = selectedOption
    ? (selectedOption.name ?? `Exercise #${selectedOption.id}`)
    : "Select an exercise";

  return (
    <>
      <input
        required={required}
        value={value ? String(value) : ""}
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
            className="min-w-64 justify-between font-normal"
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search exercise or muscle group..." />
            <CommandList>
              <CommandEmpty>No exercises found.</CommandEmpty>
              {groupedOptions.map(group => (
                <CommandGroup key={group.groupName} heading={group.groupName}>
                  {group.options.map(option => {
                    const isSelected = option.id === value;

                    return (
                      <CommandItem
                        key={`${group.groupName}-${option.id}`}
                        value={option.searchableText}
                        onSelect={() => {
                          onSelect(option.id);
                          setIsOpen(false);
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
    </>
  );
}
