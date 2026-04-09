import type { FC } from "react";
import { Link } from "@tanstack/react-router";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Button } from "@/components/ui/button";

import { WorkoutTemplateSegment } from "./WorkoutTemplateSegment";

type DisplayWorkoutTemplateProps = {
  exerciseNameById: Map<number, string>;
  workoutTemplate: WorkoutTemplateState;
};

export const DisplayWorkoutTemplate: FC<DisplayWorkoutTemplateProps> = ({ workoutTemplate, exerciseNameById }) => {
  return (
    <article className="rounded-xl ui-card p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{workoutTemplate.name}</h3>
        </div>
        {workoutTemplate.id != null ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/admin/workout-templates/edit/$id" params={{ id: String(workoutTemplate.id) }}>
              Edit
            </Link>
          </Button>
        ) : null}
      </header>

      {workoutTemplate.description ? <p className="mb-3 text-sm">{workoutTemplate.description}</p> : null}

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
