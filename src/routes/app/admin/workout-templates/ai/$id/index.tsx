import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { loadAiSessionServerFn } from "@/server-functions/workout-template-ai";

export const Route = createFileRoute("/app/admin/workout-templates/ai/$id/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
});

type SessionState =
  | { status: "not-found" }
  | { status: "error" }
  | {
      status: "loaded";
      session: NonNullable<Awaited<ReturnType<typeof loadAiSessionServerFn>>>["session"];
      prompts: NonNullable<Awaited<ReturnType<typeof loadAiSessionServerFn>>>["prompts"];
    };

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
  const [sessionState, setSessionState] = useState<SessionState | null>(null);

  useEffect(() => {
    loadAiSessionServerFn({ data: { sessionId: Number(id) } })
      .then(result => {
        if (result == null || result.session == null) {
          setSessionState({ status: "not-found" });
        } else {
          setSessionState({ status: "loaded", ...result });
        }
      })
      .catch(() => {
        setSessionState({ status: "error" });
      });
  }, [id]);

  if (sessionState == null) {
    return <div className="text-sm text-muted-foreground">Loading session...</div>;
  }

  if (sessionState.status === "not-found") {
    return <div className="text-sm text-destructive">Session not found.</div>;
  }

  if (sessionState.status === "error") {
    return (
      <div className="text-sm text-destructive">
        Something went wrong loading the session. Please refresh and try again.
      </div>
    );
  }

  if (sessionState.session == null) {
    return <div className="text-sm text-destructive">Session not found.</div>;
  }

  return (
    <div>
      Session {sessionState.session.id}: {sessionState.session.name}
    </div>
  );
}
