import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/lessons/12/workouts/")({
  component: RouteComponent,
});

const serverFn = createServerFn({ method: "GET" }).handler(async () => {
  console.log(
    "\n",
    "================================",
    "I'm in a server function!!!",
    "================================",
    "\n",
  );
  return {
    message: "Hello, world!",
  };
});

function RouteComponent() {
  const call = useServerFn(serverFn);

  return (
    <div className="flex flex-col gap-4">
      <span>Click this button!</span>
      <Button onClick={() => call()} variant="secondary">
        Click me
      </Button>
    </div>
  );
}
