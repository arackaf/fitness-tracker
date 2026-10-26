import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FC } from "react";

import type { MessagePart } from "@tanstack/ai";
import { fetchServerSentEvents, useChat, type UIMessage } from "@tanstack/ai-react";

import { DisplayPromptResult } from "@/components/CreateWorkoutTemplatesWithAi/PromptResult";
import { Loading } from "@/components/loading-state/Loading";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { PromptPayloadSchema } from "@/interop-types/workout-template-state";
import { DisplayWorkoutTemplate as DisplayWorkoutTemplateStreaming } from "@/components/display-workout-template-streaming/DisplayWorkoutTemplate";
import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { useSuspenseQuery } from "@tanstack/react-query";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

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
  // const [sessionState, setSessionState] = useState<{ status: "error" } | { status: "loaded"; session: any[] } | null>(
  const [sessionState, setSessionState] = useState<any>(null);

  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  if (sessionState == null) {
    return (
      <div className="relative min-h-40">
        <Loading placement="local" fadeIn />
      </div>
    );
  }

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

  const { session, prompts } = sessionState.session;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-4">
        {messages.map(message =>
          message.role === "user" ? (
            <div key={message.id} className="w-1/2 self-end rounded-2xl bg-blue-100 px-4 py-2">
              {message.parts.map((part, index) => (part.type === "text" ? <p key={index}>{part.content}</p> : null))}
            </div>
          ) : (
            <DisplayMessage key={message.id} message={message} exerciseNameById={exerciseNameById} />
          ),
        )}
        {isLoading && <Loader2 className="size-6 animate-spin text-muted-foreground" />}
      </div>
    </div>
  );
}

type DisplayMessageProps = {
  message: UIMessage<any, { commentary: string; workouts: WorkoutTemplateState[] }, undefined>;
  exerciseNameById: Map<number, string>;
};
const DisplayMessage: FC<DisplayMessageProps> = props => {
  const { message, exerciseNameById } = props;

  return (
    <div key={message.id} className="w-full">
      {message.parts.map((part, index) => (
        <div key={index}>
          <DisplayMessagePart part={part} exerciseNameById={exerciseNameById} />
        </div>
      ))}
    </div>
  );
};

type DisplayMessagePartProps = {
  part: MessagePart<{ commentary: string; workouts: WorkoutTemplateState[] }>;
  exerciseNameById: Map<number, string>;
};
const DisplayMessagePart: FC<DisplayMessagePartProps> = props => {
  const { part, exerciseNameById } = props;
  if (part.type === "structured-output") {
    if (part.status === "complete") {
      return (
        <div className="flex flex-col gap-2">
          <span>{part.data.commentary}</span>
          {part.data.workouts.map(workoutTemplate => (
            <DisplayWorkoutTemplate workoutTemplate={workoutTemplate} exerciseNameById={exerciseNameById} />
          ))}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        {part.partial?.commentary && <span>{part.partial?.commentary}</span>}
        {part.partial?.workouts?.map((workoutTemplate, idx) => (
          <DisplayWorkoutTemplateStreaming
            key={idx}
            workoutTemplate={workoutTemplate}
            exerciseNameById={exerciseNameById}
          />
        ))}
      </div>
    );
  }
  if (part.type === "text") {
    return <span>{part.content}</span>;
  }
  return null;
};
