import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import type { CompressedWorkoutTemplate } from "@/lib/compressWorkoutTemplateForLLM";
import type { GatewayModelId, LanguageModelUsage } from "ai";
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
  | SuccessPromptResult;

export type QueriedPromptResult = {
  prompt: typeof sessionPrompt.$inferSelect | null | undefined;
  result: typeof sessionPromptResult.$inferSelect | null | undefined;
};

export type QueriedSessionResult = {
  session: typeof session.$inferSelect | null;
  prompts: QueriedPromptResult[];
};
