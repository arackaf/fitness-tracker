import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/layout/SuspensePageLayout";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import { CreateExercise } from "@/test-utils/CreateExercise";

export const Route = createFileRoute("/app/test-lesson")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Create Exercise">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  return <CreateExercise muscleGroups={muscleGroups} />;
}
