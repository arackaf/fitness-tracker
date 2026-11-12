import type { FC } from "react";

import type { TemplateSegmentWithExercises } from "@/data/workout-templates/workout-state";
import { getDisplayReps } from "./DisplayReps";
import type { DeepPartial } from "@tanstack/ai";

type WorkoutTemplateSegmentRepsProps = {
  segment: DeepPartial<TemplateSegmentWithExercises>;
};

export const WorkoutTemplateSegmentExerciseReps: FC<WorkoutTemplateSegmentRepsProps> = ({ segment }) => {
  return <p className="ml-4 text-sm text-muted-foreground">{getDisplayReps(segment)}</p>;
};
