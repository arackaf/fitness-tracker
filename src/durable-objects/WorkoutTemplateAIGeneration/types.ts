import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import type { CompressedWorkoutTemplate } from "@/lib/compressWorkoutTemplateForLLM";
import type { GatewayModelId, LanguageModelUsage } from "ai";

export type ExerciseSummary = {
  id: number;
  name: string;
  description: string | null;
};

export type PromptInput = {
  prompt: string;
  exercises: ExerciseSummary[];
  workoutNames: string[];
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

export type PromptReturnType =
  | {
      success: false;
    }
  | SuccessPromptResult;
