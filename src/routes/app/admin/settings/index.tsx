import { createFileRoute } from "@tanstack/react-router";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/admin/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="mt-6 max-w-md rounded-xl border border-border bg-card p-5 dark:border-slate-700/80 dark:bg-slate-800/55">
      <h2 className="text-base font-semibold text-foreground dark:text-slate-50">
        Theme
      </h2>
      <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300/80">
        Choose a temporary theme for this session.
      </p>

      <div className="mt-4 inline-flex rounded-lg border border-border bg-background p-1 dark:border-slate-700 dark:bg-slate-900/60">
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition",
            theme === "dark"
              ? "bg-primary text-primary-foreground dark:bg-slate-700 dark:text-slate-100"
              : "text-foreground hover:bg-muted dark:text-slate-300 dark:hover:bg-slate-800",
          )}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition",
            theme === "light"
              ? "bg-primary text-primary-foreground"
              : "text-foreground hover:bg-muted",
          )}
        >
          Light
        </button>
      </div>
    </section>
  );
}
