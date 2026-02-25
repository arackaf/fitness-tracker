import { Checkbox } from "@/components/ui/checkbox";

type ExerciseFiltersProps = {
  muscleGroups: string[];
  selectedMuscleGroups: string[];
  onToggleMuscleGroup: (muscleGroup: string, checked: boolean) => void;
};

export function ExerciseFilters({
  muscleGroups,
  selectedMuscleGroups,
  onToggleMuscleGroup,
}: ExerciseFiltersProps) {
  return (
    <section className="mb-8 rounded-xl border border-slate-700/80 bg-slate-800/55 p-4 backdrop-blur-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300/90">
        Filter by muscle group
      </h2>
      <div className="mt-3 flex flex-wrap gap-4">
        {muscleGroups.map(muscleGroup => {
          const isChecked = selectedMuscleGroups.includes(muscleGroup);

          return (
            <label
              key={muscleGroup}
              className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-200/90"
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={checked =>
                  onToggleMuscleGroup(muscleGroup, checked === true)
                }
              />
              <span className="capitalize">{muscleGroup}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
