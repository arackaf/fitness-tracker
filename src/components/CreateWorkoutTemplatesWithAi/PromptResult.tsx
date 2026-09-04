import type {
  AIGeneratedWorkoutTemplate,
  PromptResponsePayload,
} from "@/durable-objects/WorkoutTemplateAIGeneration/types";
import { useMemo, useState, type FC } from "react";

import { Loading } from "@/components/loading-state/Loading";
import type { Exercise, MuscleGroup } from "@/data/types";
import { Button } from "../ui/button";
import { saveWorkoutTemplate } from "@/server-functions/workout-templates";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { WorkoutTemplate } from "../edit-workout-template/WorkoutTemplate";
import { DisplayWorkoutTemplate } from "../display-workout-template/DisplayWorkoutTemplate";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";

export type DisplayPromptResultProps = {
  promptResult: PromptResponsePayload;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
};
export const DisplayPromptResult: FC<DisplayPromptResultProps> = props => {
  const { promptResult, exercises, muscleGroups } = props;

  if (!promptResult || promptResult.pending)
    return (
      <div className="relative min-h-24">
        <Loading placement="local" />
      </div>
    );

  if (!promptResult.success) {
    return (
      <div className="rounded-md bg-red-900/30 p-4 text-red-300">
        Something went wrong generating this response. Please try again.
      </div>
    );
  }

  const { commentary, workouts } = promptResult;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-medium text-gray-400">Commentary</h4>
        <p className="text-gray-200">{commentary}</p>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-gray-400">Generated Workouts</h4>
        <div className="flex flex-col gap-2">
          {workouts.map((template, i) => (
            <div className="flex flex-col gap-4">
              <DisplayGeneratedWorkoutTemplate
                key={`${template.id}-${template.name}-${i}`}
                workoutTemplate={template}
                exercises={exercises}
                muscleGroups={muscleGroups}
              />
              {i !== workouts.length - 1 && <hr className="border-t-4 border-white my-4" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

type DisplayGeneratedWorkoutTemplateProps = {
  workoutTemplate: AIGeneratedWorkoutTemplate;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
};

const DisplayGeneratedWorkoutTemplate: FC<DisplayGeneratedWorkoutTemplateProps> = props => {
  return props.workoutTemplate.savedId ? (
    <DisplayGeneratedSavedWorkoutTemplate {...props} />
  ) : (
    <DisplayGeneratedUnsavedWorkoutTemplate {...props} />
  );
};

const DisplayGeneratedSavedWorkoutTemplate: FC<DisplayGeneratedWorkoutTemplateProps> = props => {
  const { workoutTemplate, exercises } = props;

  const exerciseNameById = useMemo(() => new Map(exercises.map(e => [e.id, e.name])), [exercises]);

  return <DisplayWorkoutTemplate exerciseNameById={exerciseNameById} workoutTemplate={workoutTemplate} />;
};

const DisplayGeneratedUnsavedWorkoutTemplate: FC<DisplayGeneratedWorkoutTemplateProps> = props => {
  const { workoutTemplate, exercises, muscleGroups } = props;

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveWorkoutTemplate({ data: workoutTemplate });
  };

  const form = useWorkoutTemplateForm(async state => {
    setIsSaving(true);

    try {
      await saveWorkoutTemplate({
        data: {
          ...state,
          id: workoutTemplate.id,
        },
      });
    } finally {
      setIsSaving(false);
    }
  }, workoutTemplate);

  return (
    <div className="flex flex-col gap-8">
      <WorkoutTemplate form={form} exercises={exercises} muscleGroups={muscleGroups} />
      <Button disabled={isSaving} variant="default" onClick={handleSave}>
        Save it!
      </Button>
    </div>
  );
};
