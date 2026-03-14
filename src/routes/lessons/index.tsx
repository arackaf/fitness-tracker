import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/")({
  component: RouteComponent,
});

type LessonKey = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
const lessonSummaryHeading: { [key in LessonKey]: string } = {
  2: "Loaders",
  3: "Loading data",
  4: "Route caching",
  5: "Data in layouts",
  6: "Streaming 1",
  7: "Streaming 2",
  8: "Introducing TanStack Query",
  9: "Integrating TanStack Query",
};

function RouteComponent() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Lessons</h1>
      <div className="flex flex-col gap-2">
        {Object.entries(lessonSummaryHeading).map(([idx, desc]) => (
          <Link
            to={`/lessons/${idx as LessonKey}/workouts`}
            preload={false}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
          >
            Lesson {idx} - {desc}
          </Link>
        ))}
      </div>
    </div>
  );
}
