import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState, type FC } from "react";

import { Loading } from "@/components/loading-state/Loading";
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
import { cn } from "@/lib/utils";

export const ImportWorkoutTemplate: FC = () => {
  const [page, setPage] = useState(1);
  const { data, isFetching, isError } = useQuery({
    ...workoutTemplatesQueryOptions(page),
    placeholderData: keepPreviousData,
  });

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
        <div className="relative mt-2 flex min-h-48 flex-col gap-4 min-w-0">
          {isFetching ? <Loading placement="local" fadeIn /> : null}

          {isError ? (
            <p className="text-sm text-destructive">
              Failed to load templates. Please try again.
            </p>
          ) : null}

          {workoutTemplates?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workout templates found.
            </p>
          ) : null}

          {workoutTemplates?.length ? (
            <div className="flex flex-col gap-2">
              {workoutTemplates.map(template => (
                <Button
                  key={template.id}
                  className={cn(
                    "flex flex-col gap-1 cursor-pointer",
                    "h-[unset] min-w-0 items-start rounded-md border p-3 text-sm",
                  )}
                  variant="outline"
                >
                  <span className="font-medium text-left">{template.name}</span>
                  {template.description ? (
                    <span className="text-muted-foreground text-left w-full truncate">
                      {template.description}
                    </span>
                  ) : null}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button
              onClick={() =>
                setPage(currentPage => Math.max(1, currentPage - 1))
              }
              variant="outline"
              disabled={page === 1}
              className={cn(
                "self-start",
                page === 1 ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              Previous Page
            </Button>

            <Button
              onClick={() => setPage(currentPage => currentPage + 1)}
              variant="outline"
              disabled={!hasNextPage}
              className={cn(
                "self-start",
                !hasNextPage ? "cursor-not-allowed" : "cursor-pointer",
              )}
            >
              Next Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
