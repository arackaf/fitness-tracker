import type { WorkoutState } from "@/data/zustand-state/workout-state";

type DisplayWorkoutProps = {
  workout: WorkoutState;
  exerciseNameById: Map<number, string>;
};

export function DisplayWorkout({
  workout,
  exerciseNameById,
}: DisplayWorkoutProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55">
      <header className="mb-3">
        <h3 className="text-lg font-semibold">{workout.name}</h3>
        <p className="text-sm text-muted-foreground">{workout.workoutDate}</p>
        {workout.description ? (
          <p className="mt-2 text-sm">{workout.description}</p>
        ) : null}
      </header>

      <div className="flex flex-col gap-3">
        {workout.segments.map((segment, segmentIndex) => (
          <section
            key={`${segment.segmentOrder}-${segmentIndex}`}
            className="rounded-lg border border-border/80 bg-background/70 p-3"
          >
            <p className="text-sm font-medium">{segment.sets} sets</p>

            {segment.exercises.length > 1 ? (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  {segment.exercises.map((exercise, exerciseIndex) => (
                    <span
                      key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${exerciseIndex}`}
                    >
                      {exerciseNameById.get(exercise.exerciseId) ??
                        `Exercise #${exercise.exerciseId}`}
                      {exercise.repsToFailure ? (
                        <span className="ml-1 text-xs">(to failure)</span>
                      ) : null}
                      {exerciseIndex < segment.exercises.length - 1
                        ? ", "
                        : null}
                    </span>
                  ))}
                </p>
                <p className="ml-4 text-sm text-muted-foreground">
                  {Array.from(
                    {
                      length: Math.max(
                        ...segment.exercises.map(
                          exercise => exercise.reps.length,
                        ),
                      ),
                    },
                    (_, repIndex) => {
                      const repsForSet = segment.exercises.map(
                        exercise => exercise.reps[repIndex],
                      );
                      const hasAnyRepValue = repsForSet.some(
                        rep => rep !== null,
                      );

                      if (!hasAnyRepValue) {
                        return "";
                      }

                      return `(${repsForSet.map(rep => (rep ?? "_").toString()).join(", ")})`;
                    },
                  )
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </>
            ) : (
              <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                {segment.exercises.map((exercise, exerciseIndex) => (
                  <li
                    key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${exerciseIndex}`}
                  >
                    {exerciseNameById.get(exercise.exerciseId) ??
                      `Exercise #${exercise.exerciseId}`}
                    {exercise.repsToFailure ? (
                      <span className="ml-1 text-xs">(to failure)</span>
                    ) : null}
                    :{" "}
                    {exercise.reps.some(rep => rep !== null)
                      ? exercise.reps
                          .map(rep => (rep ?? "_").toString())
                          .join(", ")
                      : ""}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
