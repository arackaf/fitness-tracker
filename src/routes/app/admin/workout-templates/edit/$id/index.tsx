import { useEffect } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";

import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutTemplateByIdQueryOptions } from "@/server-functions/workout-templates";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";

import { Header } from "@/components/Header";
import { WorkoutTemplateDetailForm } from "@/components/edit-workout-template/WorkoutTemplateDetailForm";

export const Route = createFileRoute("/app/admin/workout-templates/edit/$id/")({
  loader: ({ context, params }) => {
    const workoutTemplateId = Number(params.id);

    if (Number.isNaN(workoutTemplateId)) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(workoutTemplateByIdQueryOptions(workoutTemplateId));
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
  notFoundComponent: () => (
    <section>
      <Header title="Workout Template Not Found" />
      <p className="text-muted-foreground">Could not find this workout template</p>
    </section>
  ),
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Edit Workout Template">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { id } = Route.useParams();
  const workoutTemplateId = Number(id);

  const { data: workoutTemplate } = useSuspenseQuery(workoutTemplateByIdQueryOptions(workoutTemplateId));
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  useEffect(() => {
    if (workoutTemplate == null || workoutTemplate.id == null) {
      throw notFound();
    }
  }, [workoutTemplate]);

  if (workoutTemplate == null || workoutTemplate.id == null) {
    return null;
  }

  return (
    <WorkoutTemplateDetailForm workoutTemplate={workoutTemplate} exercises={exercises} muscleGroups={muscleGroups} />
  );
}
