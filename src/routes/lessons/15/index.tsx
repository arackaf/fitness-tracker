import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/15/")({
  component: RouteComponent,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <h1>Odds and ends</h1>
    </div>
  );
}
