import { DurableObject } from "cloudflare:workers";

export class WorkoutTemplateAIGeneration extends DurableObject {
  fetch(request: Request): Response {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", {
        status: 426,
      });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  sendMessage(object: Object) {
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(JSON.stringify(object));
      } catch {
        // The socket may have disconnected before Cloudflare observed it.
        socket.close(1011, "Unable to send message");
      }
    }
  }
}
