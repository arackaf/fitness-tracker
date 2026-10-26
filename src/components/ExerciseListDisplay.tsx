import { type FC } from "react";
import { Card } from "@/components/Card";
import type { Exercise } from "@/data/exercises/get-full-exercises";

type ExerciseListDisplayProps = {
  exercises: Exercise[];
};

export const ExerciseListDisplay: FC<ExerciseListDisplayProps> = props => {
  const { exercises } = props;

  return (
    <ul className="space-y-3">
      {exercises.map(({ exercise, muscleGroupNames }) => (
        <Card as="li" key={exercise.id} hoverStyle="border" className="rounded-xl shadow-sm transition">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold">{exercise.name ?? "Unnamed exercise"}</p>
              <p className="mt-1 text-sm">{exercise.description ?? "No description yet."}</p>
            </div>
            {exercise.isCompound ? (
              <span className="rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-400/20 text-emerald-200">
                Compound
              </span>
            ) : null}
          </div>

          {exercise.muscleGroups?.length ? (
            <p className="mt-3 text-xs uppercase tracking-wide text-sky-200/80">{muscleGroupNames.join(" • ")}</p>
          ) : null}
        </Card>
      ))}
    </ul>
  );
};
