import { getWorkoutTemplateAIGenerationDurableObject } from "@/durable-objects/WorkoutTemplateAIGeneration/do";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/workout-templates/ai/$id/subscribe")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        const cart = await getWorkoutTemplateAIGenerationDurableObject(context);
        return cart.fetch(request);
      },
    },
  },
});
