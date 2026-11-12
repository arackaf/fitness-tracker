import type { FC } from "react";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import type { UIMessage } from "@tanstack/ai-react";

import { DisplayWorkoutTemplate as DisplayWorkoutTemplateStreaming } from "@/components/display-workout-template-streaming/DisplayWorkoutTemplate";
import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { Loader2 } from "lucide-react";
import type { MessagePart } from "@tanstack/ai";

export const RenderResponses: FC<{
  messages: readonly UIMessage<any, { commentary: string; workouts: WorkoutTemplateState[] }, undefined>[];
  isLoading: boolean;
  exerciseNameById: Map<number, string>;
}> = props => {
  const { messages, isLoading, exerciseNameById } = props;
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
};

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
          {part.data.workouts.map((workoutTemplate, idx) => (
            <DisplayWorkoutTemplate key={idx} workoutTemplate={workoutTemplate} exerciseNameById={exerciseNameById} />
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
