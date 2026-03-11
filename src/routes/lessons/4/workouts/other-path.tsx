import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/4/workouts/other-path")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <Link to="/lessons/4/workouts">Back to list</Link>
      Foo!
    </div>
  );
}
