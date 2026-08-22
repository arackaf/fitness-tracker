import { createAiSessionsServerFn, getAiSessionsQueryOptions } from "@/server-functions/workout-template-ai";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

export const Route = createFileRoute("/app/admin/workout-templates/ai/")({
  component: RouteComponent,
});

function RouteComponent() {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const { data } = useQuery(getAiSessionsQueryOptions());
  console.log({ data });
  return (
    <div className="flex flex-col gap-4">
      <span>Hi</span>
      <textarea className="w-full h-40 p-2 border border-gray-300 rounded-md" ref={promptRef} />
      <button
        onClick={() => {
          createAiSessionsServerFn({
            data: { promptInfo: { prompt: promptRef.current?.value || "", exercises: [], workoutTemplates: [] } },
          });
        }}
        className="bg-blue-500 text-white p-2 rounded-md border"
      >
        Generate
      </button>
    </div>
  );
}
