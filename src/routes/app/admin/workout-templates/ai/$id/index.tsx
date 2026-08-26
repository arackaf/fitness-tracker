import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DisplayPromptResult } from "@/components/CreateWorkoutTemplatesWithAi/PromptResult";
import { Loading } from "@/components/loading-state/Loading";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  | { status: "loading" }
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
  const [sessionState, setSessionState] = useState<SessionState>({ status: "loading" });

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

  if (sessionState.status === "loading") {
    return (
      <div className="relative min-h-40">
        <Loading placement="local" fadeIn />
      </div>
    );
  }

  if (sessionState.status === "not-found") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-destructive">Session not found.</p>
        <Button asChild variant="secondary">
          <Link to="/app/admin/workout-templates/ai">Back to AI Sessions</Link>
        </Button>
      </div>
    );
  }

  if (sessionState.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-destructive">Something went wrong loading the session. Please refresh and try again.</p>
        <Button asChild variant="secondary">
          <Link to="/app/admin/workout-templates/ai">Back to AI Sessions</Link>
        </Button>
      </div>
    );
  }

  const { session, prompts } = sessionState;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{session.name}</h2>
          {session.savedId != null && <Badge variant="secondary">Saved</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">Session #{session.id} &middot; {session.createdAt}</p>
      </div>

      {prompts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No prompts in this session yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {prompts.map((promptResult, index) => (
            <DisplayPromptResult key={promptResult.prompt?.id ?? index} promptResult={promptResult} />
          ))}
        </div>
      )}
    </div>
  );
}
