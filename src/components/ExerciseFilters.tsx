import { Checkbox } from "@/components/ui/checkbox";
import type { MuscleGroup } from "@/data/types";

type ExerciseFiltersProps = {
  muscleGroups: MuscleGroup[];
  selectedMuscleGroups: number[];
  onToggleMuscleGroup: (muscleGroup: MuscleGroup, checked: boolean) => void;
};

export function ExerciseFilters({ muscleGroups, selectedMuscleGroups, onToggleMuscleGroup }: ExerciseFiltersProps) {
  return (
    <section className="mb-8 rounded-xl border border-border bg-card p-4 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-800/55">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground dark:text-slate-300/90">
        Filter by muscle group
      </h2>
      <div className="mt-3 flex flex-wrap gap-4">
        {muscleGroups.map(muscleGroup => {
          const isChecked = selectedMuscleGroups.includes(muscleGroup.id);

          return (
            <label
              key={muscleGroup.id}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground dark:text-slate-200/90"
            >
              <Checkbox checked={isChecked} onCheckedChange={checked => onToggleMuscleGroup(muscleGroup, checked === true)} />
              <span className="capitalize">{muscleGroup.name}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
