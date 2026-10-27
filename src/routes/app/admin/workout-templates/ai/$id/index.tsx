import { createFileRoute } from "@tanstack/react-router";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { exercisesQueryOptions } from "@/server-functions/exercises";

import { useSuspenseQuery } from "@tanstack/react-query";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import { promptOutputSchema } from "@/interop-types/workout-template-state";
import { useExerciseMap } from "@/lib/exercise-map";
import { RenderResponses } from "@/components/ai-workout-template/handle-responses";

export const Route = createFileRoute("/app/admin/workout-templates/ai/$id/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="AI Session">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { id } = Route.useParams();

  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  const exerciseNameById = useExerciseMap(exercises);

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents("/api/ai/create-workout-templates"),
    outputSchema: promptOutputSchema,
    persistence: true,
    threadId: id,
  });

  console.log({ messages });
  // if (sessionState.status === "error" || sessionState.session.status === "error") {
  //   return (
  //     <div className="flex flex-col items-start gap-3">
  //       <p className="text-sm text-destructive">
  //         Something went wrong loading the session. Please refresh and try again.
  //       </p>
  //       <Button asChild variant="secondary">
  //         <Link to="/app/admin/workout-templates/ai">Back to AI Sessions</Link>
  //       </Button>
  //     </div>
  //   );
  // }

  // if (sessionState.session.status === "not-found") {
  //   return (
  //     <div className="flex flex-col items-start gap-3">
  //       <p className="text-sm text-destructive">Session not found.</p>
  //       <Button asChild variant="secondary">
  //         <Link to="/app/admin/workout-templates/ai">Back to AI Sessions</Link>
  //       </Button>
  //     </div>
  //   );
  // }

  return <RenderResponses messages={messages} isLoading={isLoading} exerciseNameById={exerciseNameById} />;
}
