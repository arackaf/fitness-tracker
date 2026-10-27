import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

export type AIGeneratedWorkoutTemplate = WorkoutTemplateState & {
  uuid: string;
  savedId?: number | null;
};

export type ExerciseSummary = {
  id: number;
  name: string;
  description: string | null;
};

export type SuccessPromptResult = {
  success: true;
  commentary: string;
  workouts: AIGeneratedWorkoutTemplate[];
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  cost: any;
};

export type SuccessfulPromptResponse = Pick<SuccessPromptResult, "commentary" | "workouts">;

export type PromptResponsePayload =
  | ({ success: true; pending: false } & SuccessfulPromptResponse)
  | { success: false; pending: false }
  | { success: null; pending: true }
  | null;

export type SessionSummary = {
  id: number;
  name: string;
  createdAt: string;
  promptCount: number;
  totalWorkoutsGenerated: number;
  savedCount: number;
};
