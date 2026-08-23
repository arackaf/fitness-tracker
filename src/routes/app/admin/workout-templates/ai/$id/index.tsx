import { openWorkoutTemplateWebSocket } from "@/lib/web-sockets";
import type { PromptReturnType } from "@/server-functions/workout-template-ai";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/app/admin/workout-templates/ai/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    openWorkoutTemplateWebSocket(id).then(socket => {
      setWebSocket(socket);
      socket.addEventListener("message", evt => {
        console.log("Message received in component:", evt.data);
      });
    });
    return () => {
      webSocket?.close();
    };
  }, [id]);

  return <div>Hello "/app/admin/workout-templates/ai/$id/"!</div>;
}
