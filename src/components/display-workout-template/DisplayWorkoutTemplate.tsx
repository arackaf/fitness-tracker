import type { FC } from "react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

import { WorkoutTemplateSegment } from "./WorkoutTemplateSegment";

type DisplayWorkoutTemplateProps = {
  exerciseNameById: Map<number, string>;
  workoutTemplate: WorkoutTemplateState;
};

export const DisplayWorkoutTemplate: FC<DisplayWorkoutTemplateProps> = ({
  workoutTemplate,
  exerciseNameById,
}) => {
  return (
    <article className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{workoutTemplate.name}</h3>
        </div>
      </header>

      {workoutTemplate.description ? (
        <p className="mb-3 text-sm">{workoutTemplate.description}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {workoutTemplate.segments.map((segment, segmentIndex) => (
          <WorkoutTemplateSegment
            key={`${segment.segmentOrder}-${segmentIndex}`}
            segment={segment}
            exerciseNameById={exerciseNameById}
          />
        ))}
      </div>
    </article>
  );
};
