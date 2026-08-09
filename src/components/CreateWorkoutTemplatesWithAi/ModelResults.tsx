import { useState, type FC } from "react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { Button } from "../ui/button";
import { saveWorkoutTemplate } from "@/server-functions/workout-templates";

type ModelResultsProps = {
  commentary?: string;
  exerciseNameById: Map<number, string>;
  generatedWorkouts: WorkoutTemplateState[];
};

export const ModelResults: FC<ModelResultsProps> = ({ commentary, exerciseNameById, generatedWorkouts }) => {
  const [workoutsToShow, setWorkoutsToShow] = useState<WorkoutTemplateState[]>(generatedWorkouts);

  const saveIt = async (workoutTemplate: WorkoutTemplateState) => {
    await saveWorkoutTemplate({ data: workoutTemplate });
    setWorkoutsToShow(currentWorkouts => currentWorkouts.filter(workout => workout !== workoutTemplate));
  };

  return (
    <div className="flex flex-col gap-4 border-t pt-4">
      {commentary ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Commentary</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{commentary}</p>
        </div>
      ) : null}
      {generatedWorkouts.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-medium">Generated workouts</h3>
          {workoutsToShow.map((workoutTemplate, templateIndex) => (
            <DisplayGeneratedWorkoutTemplate
              workoutTemplate={workoutTemplate}
              exerciseNameById={exerciseNameById}
              saveWorkoutTemplate={saveIt}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

type DisplayGeneratedWorkoutTemplateProps = {
  workoutTemplate: WorkoutTemplateState;
  exerciseNameById: Map<number, string>;
  saveWorkoutTemplate: (workoutTemplate: WorkoutTemplateState) => Promise<void>;
};

const DisplayGeneratedWorkoutTemplate: FC<DisplayGeneratedWorkoutTemplateProps> = props => {
  const { workoutTemplate, exerciseNameById, saveWorkoutTemplate } = props;
  const [enabled, setEnabled] = useState(false);

  const handleSave = async () => {
    setEnabled(false);
    await saveWorkoutTemplate(workoutTemplate);
  };

  return (
    <DisplayWorkoutTemplate
      workoutTemplate={workoutTemplate}
      exerciseNameById={exerciseNameById}
      footer={
        <div className="mt-2">
          <Button variant="secondary" onClick={handleSave}>
            Save it!
          </Button>
        </div>
      }
    />
  );
};
