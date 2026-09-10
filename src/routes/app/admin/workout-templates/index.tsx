import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { useExerciseMap } from "@/lib/exercise-map";

import { CreateWorkoutTemplateWithAi } from "@/components/CreateWorkoutTemplatesWithAi/MainModal";
import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutTemplatesQueryOptions } from "@/server-functions/workout-templates";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createServerFn } from "@tanstack/react-start";

const claudeSonnet45Model = anthropic("claude-sonnet-4-5");

export const Route = createFileRoute("/app/admin/workout-templates/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(workoutTemplatesQueryOptions(1));
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

export const runVercelAiSdkWithAnthropic = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  try {
    const { text } = await generateText({
      model: claudeSonnet45Model,
      prompt: `Give me a basic chest workout`,
    });

    console.log("Anthropic result", { text });
  } catch (error) {
    console.error("Error using Vercel AI SDK", { error });
  }
});

export const runVercelAiSdk = createServerFn({
  method: "GET",
}).handler(async ({ data }) => {
  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      prompt: `Give me a basic chest workout`,
    });

    console.log({ text });
  } catch (error) {
    console.error("Error using Vercel AI SDK", { error });
  }
});

function RouteComponent() {
  return (
    <SuspensePageLayout
      title="Workout Templates"
      headerChildren={
        <div className="flex gap-2">
          <Button onClick={() => runVercelAiSdkWithAnthropic()}>Anthropic</Button>
          <Button onClick={() => runVercelAiSdk()}>Gateway</Button>
          <CreateWorkoutTemplateWithAi />
          <Button asChild variant="secondary">
            <Link to="/app/admin/workout-templates/create">Create</Link>
          </Button>
        </div>
      }
    >
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const [, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const { data: workoutTemplatesPayload } = useSuspenseQuery(workoutTemplatesQueryOptions(page));
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const workoutTemplates = workoutTemplatesPayload.workoutTemplates;
  const hasNextPage = workoutTemplatesPayload.hasNextPage;
  const exerciseNameById = useExerciseMap(exercises);

  return (
    <>
      {workoutTemplates.length === 0 ? (
        <p className="text-muted-foreground">No workout templates yet. Create your first one to get started.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {workoutTemplates.map((workoutTemplate, templateIndex) => (
            <DisplayWorkoutTemplate
              key={`${workoutTemplate.id}-${workoutTemplate.name}-${templateIndex}`}
              workoutTemplate={workoutTemplate}
              exerciseNameById={exerciseNameById}
            />
          ))}
          <div className="flex gap-2">
            {page > 1 ? (
              <Button
                onClick={() =>
                  startTransition(() => {
                    setPage(currentPage => Math.max(1, currentPage - 1));
                  })
                }
                variant="outline"
                className="self-start"
              >
                Previous Page
              </Button>
            ) : null}
            {hasNextPage ? (
              <Button
                onClick={() =>
                  startTransition(() => {
                    setPage(currentPage => currentPage + 1);
                  })
                }
                variant="outline"
                className="self-start"
              >
                Next Page
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
