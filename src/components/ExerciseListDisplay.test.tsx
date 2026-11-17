// @vitest-environment jsdom
import type { FC, ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { getExercisesServerFn } from "@/server-functions/exercises";
import { exercisesQueryOptions } from "@/server-functions/exercises-query-options";
import { getMuscleGroupsServerFn } from "@/server-functions/muscle-groups";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups-query-options";
import { ExerciseListDisplay } from "./ExerciseListDisplay";

vi.mock("@/server-functions/exercises", async importOriginal => {
  const actual = await importOriginal<typeof import("@/server-functions/exercises")>();
  return {
    ...actual,
    getExercisesServerFn: vi.fn(async () => [
      { id: 1, name: "TEST Bench Press", description: "Flat barbell bench", isCompound: true, muscleGroups: [1, 2] },
      { id: 2, name: "TEST Bicep Curl", description: "Dumbbell curl", isCompound: false, muscleGroups: [3] },
    ]),
  };
});

vi.mock("@/server-functions/muscle-groups", async importOriginal => {
  const actual = await importOriginal<typeof import("@/server-functions/muscle-groups")>();
  return {
    ...actual,
    getMuscleGroupsServerFn: vi.fn(async () => [
      { id: 1, userId: "user-1", name: "Chest" },
      { id: 2, userId: "user-1", name: "Triceps" },
      { id: 3, userId: "user-1", name: "Biceps" },
    ]),
  };
});

const TestHarness: FC = () => {
  const { data: exercises } = useQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useQuery(muscleGroupsQueryOptions());

  if (!exercises || !muscleGroups) {
    return <p>Loading...</p>;
  }

  return <ExerciseListDisplay exercises={exercises} muscleGroups={muscleGroups} />;
};

const renderWithClient = (ui: ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

afterEach(cleanup);

describe("ExerciseListDisplay", () => {
  test("renders exercises with their muscle groups", async () => {
    renderWithClient(<TestHarness />);

    await screen.findByText("TEST Bench Press");
    expect(screen.getByText("Chest • Triceps")).toBeTruthy();
    expect(screen.getByText("TEST Bicep Curl")).toBeTruthy();
    expect(screen.getByText("Biceps")).toBeTruthy();
    expect(getExercisesServerFn).toHaveBeenCalled();
    expect(getMuscleGroupsServerFn).toHaveBeenCalled();
  });
});
