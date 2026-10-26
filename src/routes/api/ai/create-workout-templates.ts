import { promptOutputSchema } from "@/interop-types/workout-template-state";
import { chat, chatParamsFromRequest, toServerSentEventsResponse } from "@tanstack/ai";
import { reconstructChat, withPersistence } from "@tanstack/ai-persistence";
import { vercelGatewayText } from "@tanstack/ai-vercel-gateway";
import { createFileRoute } from "@tanstack/react-router";
import { canAccessThread, chatPersistence } from "@/lib/chat-persistence";
import { requireUserId } from "@/lib/server-auth";
import { getWorkoutTemplateAIGenerationDurableObject } from "@/durable-objects/WorkoutTemplateAIGeneration/do";

const notFound = () => Response.json({ error: true, code: "NOT_FOUND", message: "Not found" }, { status: 404 });

export const Route = createFileRoute("/api/ai/create-workout-templates")({
  server: {
    handlers: {
      // GET: async ({ request, context }) => {
      //   const userId = requireUserId(context);
      //   return reconstructChat(chatPersistence(context.db, userId), request, {
      //     authorize: async threadId => ((await canAccessThread(context.db, userId, threadId)) ? true : notFound()),
      //   });
      // },
      POST: async ({ request, context }) => {
        const cart = await getWorkoutTemplateAIGenerationDurableObject(context);
        return cart.fetch(request);

        // if (!(await canAccessThread(context.db, userId, params.threadId))) {
        //   return notFound();
        // }
      },
    },
  },
});
