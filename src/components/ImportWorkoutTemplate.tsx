import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { LoadingAbsolute } from "@/components/loading-state/LoadingAbsolute";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { workoutTemplatesQueryOptions } from "@/server-functions/workout-templates";

export function ImportWorkoutTemplate() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useQuery(workoutTemplatesQueryOptions(page));

  const workoutTemplates = data?.workoutTemplates ?? [];
  const hasNextPage = data?.hasNextPage ?? false;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Import template</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import workout template</DialogTitle>
          <DialogDescription>
            Choose a template to start from.
          </DialogDescription>
        </DialogHeader>
        <div className="relative mt-2 flex min-h-48 flex-col gap-4">
          {isPending ? (
            <LoadingAbsolute />
          ) : isError ? (
            <p className="text-sm text-destructive">
              Failed to load templates. Please try again.
            </p>
          ) : workoutTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workout templates found.
            </p>
          ) : (
            <div className="space-y-2">
              {workoutTemplates.map(template => (
                <div
                  key={template.id}
                  className="rounded-md border p-3 text-sm"
                >
                  <p className="font-medium">{template.name}</p>
                  {template.description ? (
                    <p className="text-muted-foreground">
                      {template.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {page > 1 ? (
              <Button
                onClick={() => setPage(currentPage => Math.max(1, currentPage - 1))}
                variant="outline"
                className="self-start"
              >
                Previous Page
              </Button>
            ) : null}
            {hasNextPage ? (
              <Button
                onClick={() => setPage(currentPage => currentPage + 1)}
                variant="outline"
                className="self-start"
              >
                Next Page
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
