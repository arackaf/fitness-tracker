import type { SegmentWithExercises } from "@/data/zustand-state/workout-state";

type DisplaySimpleSetRepsProps = {
  segment: SegmentWithExercises;
  exerciseNameById: Map<number, string>;
};

export function DisplaySimpleSetReps({
  segment,
  exerciseNameById,
}: DisplaySimpleSetRepsProps) {
  const exercise = segment.exercises[0];

  return (
    <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
      <li>
        {exerciseNameById.get(exercise.exerciseId) ??
          `Exercise #${exercise.exerciseId}`}
        {exercise.repsToFailure ? (
          <span className="ml-1 text-xs">(to failure)</span>
        ) : null}
        :
        <span className="ml-1">
          {exercise.reps.some(rep => rep !== null)
            ? exercise.reps.map(rep => (rep ?? "_").toString()).join(", ")
            : ""}
        </span>
      </li>
    </ul>
  );
}
