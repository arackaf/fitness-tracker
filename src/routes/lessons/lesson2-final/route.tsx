import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/lesson1-final")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-8 flex flex-col gap-4">
      <div className="flex gap-4">
        <Link to="/lessons/lesson1-final/page1">Page 1</Link>
        <Link to="/lessons/lesson1-final/page2">Page 2</Link>
      </div>
      <div>Hello "/lessons/lesson1 Layout</div>
      <Outlet />
    </div>
  );
}
