export function openWorkoutTemplateWebSocket(sessionId: string, lastPromptId?: number) {
  return new Promise<WebSocket>((res, rej) => {
    const protocol = location.protocol === "https:" ? "wss:" : "ws:";

    const socket = new WebSocket(
      `${protocol}//${location.host}/app/admin/workout-templates/ai/${sessionId}/subscribe${lastPromptId ? `?lastPromptId=${lastPromptId}` : ""}`,
    );

    socket.addEventListener("open", () => {
      res(socket);
    });

    socket.addEventListener("error", event => {
      rej(event);
    });
  });
}
