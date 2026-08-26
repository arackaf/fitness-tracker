import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DisplayPromptResult } from "@/components/CreateWorkoutTemplatesWithAi/PromptResult";
import { Loading } from "@/components/loading-state/Loading";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { loadAiSessionServerFn } from "@/server-functions/workout-template-ai";
import type { SessionPayload } from "@/durable-objects/WorkoutTemplateAIGeneration/types";

export const Route = createFileRoute("/app/admin/workout-templates/ai/$id/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
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
  const [sessionState, setSessionState] = useState<
    { status: "error" } | { status: "loaded"; session: SessionPayload } | null
  >(null);

  useEffect(() => {
    loadAiSessionServerFn({ data: { sessionId: Number(id) } })
      .then(result => {
        setSessionState({
          status: "loaded",
          session: result,
        });
      })
      .catch(err => {
        setSessionState({ status: "error" });
      });
  }, [id]);

  if (sessionState == null) {
    return (
      <div className="relative min-h-40">
        <Loading placement="local" fadeIn />
      </div>
    );
  }

  if (sessionState.status === "error" || sessionState.session.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-destructive">
          Something went wrong loading the session. Please refresh and try again.
        </p>
        <Button asChild variant="secondary">
          <Link to="/app/admin/workout-templates/ai">Back to AI Sessions</Link>
        </Button>
      </div>
    );
  }

  if (sessionState.session.status === "not-found") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-destructive">Session not found.</p>
        <Button asChild variant="secondary">
          <Link to="/app/admin/workout-templates/ai">Back to AI Sessions</Link>
        </Button>
      </div>
    );
  }

  const { session, prompts } = sessionState.session;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <h2 className="text-lg font-semibold">
        {session.name ? (
          session.name
        ) : (
          <>
            Session #{session.id} &middot; {session.createdAt}
          </>
        )}
      </h2>

      {prompts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No prompts in this session yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {prompts.map((promptPayload, index) => (
            <div key={`prompt-${index}`} className="flex flex-col gap-4">
              {promptPayload.promptInput.workoutTemplates.length > 0 && (
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-medium text-gray-400">Referenced Templates</h4>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {promptPayload.promptInput.workoutTemplates.map((wt, i) => (
                      <span key={i} className="rounded bg-gray-700 px-2 py-1 text-sm text-gray-200">
                        {wt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-medium text-gray-400">Prompt</h4>
                <p className="text-gray-200">{promptPayload.promptInput.prompt}</p>
              </div>
              <DisplayPromptResult promptResult={promptPayload.result} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
