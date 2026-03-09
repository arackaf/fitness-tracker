import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/lesson1-final/page2")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/lessons/lesson1-final/page2"!</div>;
}
