import { Card } from "@/components/Card";
import { GoogleIcon } from "@/components/icons/Google";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Dumbbell } from "lucide-react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const { loggedIn } = Route.useRouteContext();
  return (
    <main className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12 md:px-10 md:py-16">
        <header className="mb-16 flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <div className="inline-flex size-11 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-500/10 text-amber-200">
              <Dumbbell className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none tracking-tight text-white md:text-3xl">TanStack Jacked</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-foreground/80">Workout Tracker</p>
            </div>
          </div>
        </header>

        <section className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-200">
              Train smart. Track everything.
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">Build strength The TanStack Way</h1>
            <p className="max-w-2xl text-base leading-relaxed md:text-lg">
              Log workouts, follow your progress, and stay consistent without extra clutter.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!loggedIn ? (
                <Button type="button" variant="default" onClick={() => authClient.signIn.social({ provider: "google" })}>
                  <GoogleIcon className="w-[16px]! h-[16px]!" /> Login with Google
                </Button>
              ) : (
                <Button variant="default" asChild>
                  <Link to="/app">Go to the app</Link>
                </Button>
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-700 bg-background/60 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur">
            <p className="mb-4 text-sm font-medium">What you can track</p>
            <ul className="space-y-3 text-sm">
              <Card as="li" className="rounded-lg px-4">
                Workout sessions and volume
              </Card>
              <Card as="li" className="rounded-lg">
                Body Composition Metrics
              </Card>
              <Card as="li" className="rounded-lg px-4">
                Notes for sets, reps, etc
              </Card>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
