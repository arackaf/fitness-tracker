import { createFileRoute } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-100 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12 md:px-10 md:py-16">
        <header className="mb-16 flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <div className="inline-flex size-11 items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/20 text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-200">
              <Dumbbell className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none tracking-tight text-slate-900 dark:text-white md:text-3xl">
                TanStack Jacked
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                Workout Tracker
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-700 dark:border-amber-300/30 dark:bg-amber-500/10 dark:text-amber-200">
              Train smart. Track everything.
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-6xl">
              Build strength The TanStack Way
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg">
              Log workouts, follow your progress, and stay consistent without extra clutter.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                className="rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Log in
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
              >
                Sign up
              </button>
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-300 bg-white/70 p-6 shadow-2xl shadow-slate-300/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/60 dark:shadow-slate-950/40">
            <p className="mb-4 text-sm font-medium text-slate-700 dark:text-slate-300">What you can track</p>
            <ul className="space-y-3 text-sm text-slate-800 dark:text-slate-200">
              <li className="rounded-lg border border-slate-300 bg-slate-100/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                Workout sessions and volume
              </li>
              <li className="rounded-lg border border-slate-300 bg-slate-100/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                Body Composition Metrics
              </li>
              <li className="rounded-lg border border-slate-300 bg-slate-100/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                Notes for sets, reps, etc
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
