export function openWorkoutTemplateWebSocket(sessionId: string) {
  return new Promise<WebSocket>((res, rej) => {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";

    const socket = new WebSocket(`${protocol}//${location.host}/app/admin/workout-templates/ai/${sessionId}/subscribe`);

    socket.addEventListener("open", () => {
      console.log("WebSocket connected");
      res(socket);
    });

    socket.addEventListener("message", evt => {
      console.log("Message received:", evt.data);
    });

    socket.addEventListener("error", event => {
      console.error("WebSocket error:", event);
      rej(event);
    });

    socket.addEventListener("close", event => {
      console.error("WebSocket closed:", event);
    });
  });
}
