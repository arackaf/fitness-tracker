import type { FC } from "react";

import type { TemplateSegmentWithExercises, Exercise, Measurement } from "@/data/workout-templates/workout-state";
import { getDisplayReps } from "./DisplayReps";

type WorkoutTemplateSegmentRepsProps = {
  segment: TemplateSegmentWithExercises;
};

export const WorkoutTemplateSegmentExerciseReps: FC<WorkoutTemplateSegmentRepsProps> = ({ segment }) => {
  return <p className="ml-4 text-sm text-muted-foreground">{getDisplayReps(segment)}</p>;
};
