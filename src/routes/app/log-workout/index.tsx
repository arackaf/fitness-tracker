import { Fragment, useEffect, useRef, useState, type FC } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Workout } from "@/components/edit-workout/Workout";
import { ImportWorkoutTemplate } from "@/components/ImportWorkoutTemplate";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";

import { toast } from "sonner";
import { useWorkoutForm } from "@/lib/workout-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { saveWorkout, workoutHistoryQueryOptions } from "@/server-functions/workouts";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createDefaultWorkout,
  defaultworkoutDate,
  type WorkoutSegmentExerciseMeasurementState,
  type WorkoutSegmentExerciseState,
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
    workoutTemplateId: template.id,
    workoutDate: defaultworkoutDate(),
    segments: template.segments.map(segment => {
      return {
        ...segment,
        workoutTemplateSegmentId: segment.id,
        exercises: segment.exercises.map(exercise => {
          const segmentMeasurements = exercise.measurements.map(
            (measurement, measurementIndex) =>
              ({
                ...measurement,
                workoutTemplateSegmentExerciseMeasurementId: measurement.id,
                duration: null,
                distance: null,
                weightUsed: null,
                reps: null,
                workoutSegmentExerciseId: 0,
                setOrder: measurementIndex + 1,

                templateDistance: measurement.distance ?? undefined,
                templateDuration: measurement.duration ?? undefined,
                templateReps: measurement.reps ?? undefined,
                templateWeightUsed: measurement.weightUsed ?? undefined,
              }) satisfies WorkoutSegmentExerciseMeasurementState,
          );

          return {
            ...exercise,
            workoutSegmentId: 0,
            workoutTemplateSegmentExerciseId: exercise.id,
            repsToFailure: segmentMeasurements.some(measurement => measurement.repsToFailure === true),
            measurements: segmentMeasurements,
          } satisfies WorkoutSegmentExerciseState;
        }),
      };
    }),
  };
};

function RouteComponent() {
  const [workoutState, setWorkoutState] = useState<WorkoutState>(createDefaultWorkout());
  return (
    <SuspensePageLayout
      title="Log Workout"
      headerChildren={<ImportWorkoutTemplate onSelected={template => setWorkoutState(templateToWorkout(template))} />}
    >
      <RenderWorkoutForm workoutState={workoutState} onReset={() => setWorkoutState(createDefaultWorkout())} />
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
    let xxx = workoutState;
    console.log({ xxx });
  }, [workoutState]);

  return (
    <Fragment key={formResetKey}>
      <WorkoutFormContent workoutState={workoutState} onReset={() => onReset()} />
    </Fragment>
  );
};

type WorkoutFormContentProps = {
  workoutState: WorkoutState;
  onReset: () => void;
};

const WorkoutFormContent: FC<WorkoutFormContentProps> = props => {
  const { workoutState, onReset } = props;

  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  const [isSaving, setIsSaving] = useState(false);
  const addAnotherRef = useRef(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useWorkoutForm(async state => {
    setIsSaving(true);

    await saveWorkout({ data: state });

    if (addAnotherRef.current) {
      onReset();
      setIsSaving(false);
    } else {
      queryClient.invalidateQueries({
        queryKey: workoutHistoryQueryOptions({ page: 1 }).queryKey,
      });
      navigate({ to: "/app/workouts", search: { page: 1 } });
    }

    toast.success("Workout created", { position: "top-center" });
  }, workoutState);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.validateAllFields("submit");
    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Workout form={form} exercises={exercises} muscleGroups={muscleGroups} />
      <div className="flex mt-8">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Create workout"}
        </Button>
        <label className="flex items-center gap-2 ml-4">
          <Checkbox onCheckedChange={checked => (addAnotherRef.current = !!checked)} disabled={isSaving} />
          <span className="text-sm">Add another</span>
        </label>
        <Button type="button" variant="secondary" disabled={isSaving} className="font-semibold ml-auto" onClick={onReset}>
          Reset workout
        </Button>
      </div>
    </form>
  );
};
