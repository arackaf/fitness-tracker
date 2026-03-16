type ExerciseListDisplayItem = {
  id: number;
  name: string | null;
  description: string | null;
  isCompound: boolean | null;
  muscleGroups: number[] | null;
};

type ExerciseListDisplayProps = {
  exercises: ExerciseListDisplayItem[];
};

export function ExerciseListDisplay({ exercises }: ExerciseListDisplayProps) {
  return (
    <ul className="space-y-3">
      {exercises.map(exercise => (
        <li
          key={exercise.id}
          className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-ring dark:border-slate-700/80 dark:bg-slate-800/55 dark:hover:border-slate-600"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-foreground dark:text-slate-50">
                {exercise.name ?? "Unnamed exercise"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300/80">
                {exercise.description ?? "No description yet."}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                exercise.isCompound === true
                  ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-200"
                  : "bg-secondary text-secondary-foreground dark:bg-slate-700/70 dark:text-slate-100/90"
              }`}
            >
              {exercise.isCompound === true ? "Compound" : "Isolation"}
            </span>
          </div>

          {/*TODO*/}
          {exercise.muscleGroups?.length ? (
            <p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground dark:text-sky-200/80">
              {exercise.muscleGroups.join(" • ")}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
