import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/lessons/lesson1-demo/page1")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/lessons/lesson1-demo/page1"!</div>;
}
