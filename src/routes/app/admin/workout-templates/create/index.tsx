import { Fragment, useEffect, useRef, useState, type FC } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createDefaultWorkoutTemplate, type WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { saveWorkoutTemplate, workoutTemplatesQueryOptions } from "@/server-functions/workout-templates";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";

export const Route = createFileRoute("/app/admin/workout-templates/create/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [workoutTemplateState, setWorkoutTemplateState] = useState<WorkoutTemplateState>(createDefaultWorkoutTemplate());

  return (
    <SuspensePageLayout title="Create Workout Template">
      <RenderWorkoutTemplateForm
        workoutTemplateState={workoutTemplateState}
        onReset={() => setWorkoutTemplateState(createDefaultWorkoutTemplate())}
      />
    </SuspensePageLayout>
  );
}

type RenderWorkoutTemplateFormProps = {
  workoutTemplateState: WorkoutTemplateState;
  onReset: () => void;
};
const RenderWorkoutTemplateForm: FC<RenderWorkoutTemplateFormProps> = props => {
  const { workoutTemplateState, onReset } = props;
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    setFormResetKey(key => key + 1);
  }, [workoutTemplateState]);

  return (
    <Fragment key={formResetKey}>
      <RouteContent onReset={onReset} workoutTemplateState={workoutTemplateState} />
    </Fragment>
  );
};

type RouteContentProps = {
  workoutTemplateState: WorkoutTemplateState;
  onReset: () => void;
};
const RouteContent: FC<RouteContentProps> = props => {
  const { workoutTemplateState, onReset } = props;
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const addAnotherRef = useRef(false);
  const form = useWorkoutTemplateForm(async state => {
    setIsSaving(true);

    await saveWorkoutTemplate({ data: state });
    if (addAnotherRef.current) {
      onReset();
      setIsSaving(false);
    } else {
      queryClient.invalidateQueries({
        queryKey: workoutTemplatesQueryOptions(1).queryKey,
      });
      navigate({ to: "/app/admin/workout-templates" });
    }
  }, workoutTemplateState);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <WorkoutTemplate form={form} exercises={exercises} muscleGroups={muscleGroups} />
      <div className="mt-8 flex items-center gap-4">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Create workout template"}
        </Button>
        <label className="flex items-center gap-2">
          <Checkbox onCheckedChange={checked => (addAnotherRef.current = !!checked)} disabled={isSaving} />
          <span className="text-sm">Add another</span>
        </label>
        <Button type="button" variant="secondary" disabled={isSaving} className="font-semibold ml-auto" onClick={onReset}>
          Reset workout template
        </Button>
      </div>
    </form>
  );
};
