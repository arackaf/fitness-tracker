import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import type { CompressedWorkoutTemplate } from "@/lib/compressWorkoutTemplateForLLM";
import type { GatewayModelId } from "ai";
import { session, sessionPrompt, sessionPromptResult } from "./schema";

export type ExerciseSummary = {
  id: number;
  name: string;
  description: string | null;
};

export type PromptInput = {
  prompt: string;
  exercises: ExerciseSummary[];
  workoutTemplates: CompressedWorkoutTemplate[];
  model?: GatewayModelId;
};

export type SuccessPromptResult = {
  success: true;
  commentary: string;
  workouts: WorkoutTemplateState[];
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  cost: any;
};

export type PromptResult =
  | {
      success: false;
    }
  | SuccessPromptResult
  | null;

export type SuccessfulPromptResponse = Pick<SuccessPromptResult, "commentary" | "workouts">;

export type PromptResponsePayload =
  | ({ success: true; pending: false } & SuccessfulPromptResponse)
  | { success: false; pending: false }
  | { success: null; pending: true }
  | null;

export type PromptPayload = {
  prompt: {
    prompt: string;
    workoutTemplates: string[];
  };
  result: PromptResponsePayload;
};

export type SessionPayload =
  | { success: false }
  | {
      success: true;
      session: typeof session.$inferSelect;
      prompts: PromptPayload[];
    };

export type QueriedSession = typeof session.$inferSelect;

export type QueriedPromptResult = {
  prompt: typeof sessionPrompt.$inferSelect;
  result: typeof sessionPromptResult.$inferSelect | null | undefined;
};

export type QueriedSessionResult = {
  session: QueriedSession;
  prompts: QueriedPromptResult[];
};
