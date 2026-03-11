import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Lessons</h1>
      <div className="flex flex-col gap-2">
        <Link
          to="/lessons/2/workouts"
          preload={false}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        >
          Lesson 2
        </Link>
        <Link
          to="/lessons/3/workouts"
          preload={false}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        >
          Lesson 3
        </Link>
        <Link
          to="/lessons/4/workouts"
          preload={false}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        >
          Lesson 4
        </Link>
        <Link
          to="/lessons/5/workouts"
          preload={false}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        >
          Lesson 5
        </Link>
        <Link
          to="/lessons/6/workouts"
          preload={false}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        >
          Lesson 6
        </Link>
        <Link
          to="/lessons/7/workouts"
          preload={false}
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        >
          Lesson 7
        </Link>
      </div>
    </div>
  );
}
