import { useMemo, useState, type FC } from "react";
import { useExerciseMap } from "@/lib/exercise-map";

import type { MessagePart } from "@tanstack/ai";
import { fetchServerSentEvents, useChat, type UIMessage } from "@tanstack/ai-react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { DisplayWorkoutTemplate as DisplayWorkoutTemplateStreaming } from "@/components/display-workout-template-streaming/DisplayWorkoutTemplate";
import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Button } from "@/components/ui/button";
import { SelectWorkoutTemplates } from "@/components/SelectWorkoutTemplates";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { allWorkoutTemplatesQueryOptions } from "@/server-functions/workout-templates";
import { DisplaySelectedWorkoutTemplates } from "@/components/DisplaySelectedWorkoutTemplates";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { compressWorkoutTemplateForLLM } from "@/lib/compressWorkoutTemplateForLLM";
import { createAiSessionsServerFn, getAiSessionsQueryOptions } from "@/server-functions/workout-template-ai";
import { PromptInput } from "@/components/CreateWorkoutTemplatesWithAi/PromptInput";
import { PromptHistory } from "@/components/CreateWorkoutTemplatesWithAi/PromptHistory";
import { promptOutputSchema } from "@/interop-types/workout-template-state";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/admin/workout-templates/ai/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(allWorkoutTemplatesQueryOptions());
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Create with AI">
      <RouteComponentContent />
    </SuspensePageLayout>
  );
}

function RouteComponentContent() {
  const navigate = useNavigate();
  const [selectedTemplates, setSelectedTemplates] = useState<WorkoutTemplateState[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const selectedTemplateIds = useMemo(
    () => new Set(selectedTemplates.map(template => template.id!)),
    [selectedTemplates],
  );

  const { data: aiSessions, isLoading: isLoadingSessions } = useQuery(getAiSessionsQueryOptions());
  const { data: workoutTemplates } = useSuspenseQuery(allWorkoutTemplatesQueryOptions());
  const { data: exercises = [] } = useSuspenseQuery(exercisesQueryOptions());
  const exerciseNameById = useExerciseMap(exercises);
  const exerciseLookup = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise])), [exercises]);

  const handleSelectTemplate = (template: WorkoutTemplateState) => {
    setSelectedTemplates(currentTemplates => [...currentTemplates, template]);
  };

  const handleRemoveTemplate = (templateId: number) => {
    setSelectedTemplates(currentTemplates => currentTemplates.filter(template => template.id !== templateId));
  };

  const payload = useChat({
    connection: fetchServerSentEvents("/api/ai/create-workout-templates"),
    outputSchema: promptOutputSchema,
    threadId: "1",
  });

  const { messages, sendMessage, isLoading } = payload;

  const handleGenerate = async (prompt: string) => {
    sendMessage(prompt);
    setIsGenerating(true);
    setError(null);

    return;
    try {
      const result = await createAiSessionsServerFn({
        data: {
          promptInfo: {
            prompt,
            exercises: exercises.map(e => ({ id: e.id, name: e.name, description: e.description })),
            workoutTemplates: selectedTemplates.map(t => compressWorkoutTemplateForLLM(exerciseLookup, t)),
          },
        },
      });
      if (result?.id) {
        navigate({ to: "/app/admin/workout-templates/ai/$id", params: { id: String(result.id) } });
      } else {
        setError("Failed to create AI session");
      }
    } catch {
      setError("Something went wrong creating the session");
    }
  };

  const reset = () => {
    setPrompt("");
    setSelectedTemplates([]);
    setError(null);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Select existing templates as a reference and describe the workout you want to generate.
        </p>

        <div className="flex flex-col gap-4">
          <SelectWorkoutTemplates
            workoutTemplates={workoutTemplates.filter(template => !selectedTemplateIds.has(template.id!))}
            exerciseNameById={exerciseNameById}
            onSelectTemplate={handleSelectTemplate}
          />
          <DisplaySelectedWorkoutTemplates
            selectedTemplates={selectedTemplates}
            onRemoveTemplate={handleRemoveTemplate}
          />
        </div>

        <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerate} isGenerating={isGenerating} />
        {error && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button onClick={reset} variant="secondary">
              Start over
            </Button>
          </div>
        )}
      </div>

      {isLoadingSessions || !aiSessions?.length ? null : <PromptHistory sessions={aiSessions} />}

      <br />

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
