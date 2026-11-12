import { createFileRoute } from "@tanstack/react-router";
import { getWorkoutTemplateAIGenerationDurableObject } from "@/durable-objects/WorkoutTemplateAIGeneration/do";

export const Route = createFileRoute("/api/ai/create-workout-templates")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const cart = await getWorkoutTemplateAIGenerationDurableObject(context);
        return cart.fetch(request);
      },
      POST: async ({ request, context }) => {
        const cart = await getWorkoutTemplateAIGenerationDurableObject(context);
        return cart.fetch(request);
      },
    },
  },
});
