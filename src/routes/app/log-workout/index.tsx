import { Fragment, useEffect, useState, type FC } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Workout } from "@/components/edit-workout/Workout";
import { ImportWorkoutTemplate } from "@/components/ImportWorkoutTemplate";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";

import { useWorkoutForm } from "@/lib/workout-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { saveWorkout } from "@/server-functions/workouts";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createDefaultWorkout,
  defaultworkoutDate,
  type WorkoutState,
} from "@/data/workouts/workout-state";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

export const Route = createFileRoute("/app/log-workout/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

const templateToWorkout = (template: WorkoutTemplateState): WorkoutState => {
  return {
    ...template,
    workoutDate: defaultworkoutDate(),
    segments: template.segments.map(segment => {
      return {
        ...segment,
        exercises: segment.exercises.map(exercise => {
          const nextMeasurements = exercise.measurements.map(
            (measurement, measurementIndex) => ({
              ...measurement,
              workoutSegmentExerciseId: 0,
              setOrder: measurementIndex + 1,
            }),
          );

          return {
            ...exercise,
            workoutSegmentId: 0,
            reps: nextMeasurements.map(measurement => measurement.reps ?? null),
            repsToFailure: nextMeasurements.some(
              measurement => measurement.repsToFailure === true,
            ),
            measurements: nextMeasurements,
          };
        }),
      };
    }),
  };
};

function RouteComponent() {
  const [workoutState, setWorkoutState] = useState<WorkoutState>(
    createDefaultWorkout(),
  );
  return (
    <SuspensePageLayout
      title="Log Workout"
      headerChildren={
        <ImportWorkoutTemplate
          onSelected={template => setWorkoutState(templateToWorkout(template))}
        />
      }
    >
      <RenderWorkoutForm
        workoutState={workoutState}
        onReset={() => setWorkoutState(createDefaultWorkout())}
      />
    </SuspensePageLayout>
  );
}

type RenderWorkoutFormProps = {
  workoutState: WorkoutState;
  onReset: () => void;
};
const RenderWorkoutForm: FC<RenderWorkoutFormProps> = props => {
  const { workoutState, onReset } = props;
  const [formResetKey, setFormResetKey] = useState(0);

  useEffect(() => {
    setFormResetKey(key => key + 1);
  }, [workoutState]);

  return (
    <Fragment key={formResetKey}>
      <WorkoutFormContent
        workoutState={workoutState}
        onSaved={() => setFormResetKey(key => key + 1)}
        onReset={() => onReset()}
      />
    </Fragment>
  );
};

type WorkoutFormContentProps = {
  workoutState: WorkoutState;
  onSaved: () => void;
  onReset: () => void;
};

const WorkoutFormContent: FC<WorkoutFormContentProps> = props => {
  const { workoutState, onSaved, onReset } = props;

  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  const [isSaving, setIsSaving] = useState(false);

  const form = useWorkoutForm(async state => {
    setIsSaving(true);

    try {
      await saveWorkout({ data: state });
      onSaved();
      toast.success("Workout created", { position: "top-center" });
    } finally {
      setIsSaving(false);
    }
  }, workoutState);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Workout form={form} exercises={exercises} muscleGroups={muscleGroups} />
      <div className="flex mt-8">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Create workout"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isSaving}
          className="font-semibold ml-auto"
          onClick={onReset}
        >
          Reset workout
        </Button>
      </div>
    </form>
  );
};
