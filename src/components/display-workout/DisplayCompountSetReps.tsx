import type { SegmentWithExercises } from "@/data/zustand-state/workout-state";

type DisplayCompountSetRepsProps = {
  segment: SegmentWithExercises;
  exerciseNameById: Map<number, string>;
};

export function DisplayCompountSetReps({
  segment,
  exerciseNameById,
}: DisplayCompountSetRepsProps) {
  return (
    <>
      <p className="mt-2 text-sm text-muted-foreground">
        {segment.exercises.map((exercise, exerciseIndex) => (
          <span key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${exerciseIndex}`}>
            {exerciseNameById.get(exercise.exerciseId) ??
              `Exercise #${exercise.exerciseId}`}
            {exercise.repsToFailure ? (
              <span className="ml-1 text-xs">(to failure)</span>
            ) : null}
            {exerciseIndex < segment.exercises.length - 1 ? ", " : null}
          </span>
        ))}
      </p>
      <p className="ml-4 text-sm text-muted-foreground">
        {Array.from(
          {
            length: Math.max(
              ...segment.exercises.map(exercise => exercise.reps.length),
            ),
          },
          (_, repIndex) => {
            const repsForSet = segment.exercises.map(
              exercise => exercise.reps[repIndex],
            );
            const hasAnyRepValue = repsForSet.some(rep => rep !== null);

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
  );
}
