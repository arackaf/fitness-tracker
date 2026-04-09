import { Card } from "@/components/Card";
import { Checkbox } from "@/components/ui/checkbox";
import type { MuscleGroup } from "@/data/types";

type ExerciseFiltersProps = {
  muscleGroups: MuscleGroup[];
  selectedMuscleGroups: number[];
  onToggleMuscleGroup: (muscleGroup: MuscleGroup, checked: boolean) => void;
};

export function ExerciseFilters({ muscleGroups, selectedMuscleGroups, onToggleMuscleGroup }: ExerciseFiltersProps) {
  return (
    <Card as="section" className="mb-8 backdrop-blur-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/90">Filter by muscle group</h2>
      <div className="mt-3 flex flex-wrap gap-4">
        {muscleGroups.map(muscleGroup => {
          const isChecked = selectedMuscleGroups.includes(muscleGroup.id);

          return (
            <label key={muscleGroup.id} className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={isChecked} onCheckedChange={checked => onToggleMuscleGroup(muscleGroup, checked === true)} />
              <span className="capitalize">{muscleGroup.name}</span>
            </label>
          );
        })}
      </div>
    </Card>
  );
}
