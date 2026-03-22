import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute("/lessons/1/workouts/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, string>) => {
    return {
      search: search.search || undefined,
    };
  },
});

function RouteComponent() {
  const searchRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const workouts = [
    { id: 1, name: "Workout 1" },
    { id: 2, name: "Workout 2" },
    { id: 3, name: "Workout 3" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>

      <div className="flex gap-2">
        <Input ref={searchRef} type="text" />
        <Button
          variant="outline"
          onClick={() => {
            navigate({
              to: "/lessons/1/workouts",
              search: {
                search: searchRef.current?.value,
              },
            });
          }}
        >
          Search
        </Button>
      </div>
      {workouts.map(workout => (
        <div key={workout.id}>
          <span className="flex gap-2">
            <span>{workout.name}</span>

            <Link
              className="ml-auto"
              to={`/lessons/2/workouts/$id`}
              params={{ id: String(workout.id) }}
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
    </div>
  );
}
