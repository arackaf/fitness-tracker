import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/lessons/lesson4-final/workouts/other-path",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <Link to="/lessons/lesson4-final/workouts">Back to list</Link>
      Foo!
    </div>
  );
}
