import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { MuscleGroup } from "@/data/types";
import { searchExercisesServerFn } from "@/server-functions/exercises";
import { ExerciseSearch } from "./ExerciseSearch";

vi.mock("@/server-functions/exercises", () => ({
  searchExercisesServerFn: vi.fn(),
}));

const searchExercisesMock = vi.mocked(searchExercisesServerFn);

const muscleGroups = [
  { id: 1, name: "Chest" },
  { id: 2, name: "Back" },
] as MuscleGroup[];

const renderComponent = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <ExerciseSearch selectedExercise={null} muscleGroups={muscleGroups} onSelect={vi.fn()} />
    </QueryClientProvider>,
  );
};

describe("ExerciseSearch", () => {
  beforeEach(() => {
    searchExercisesMock.mockReset();
    searchExercisesMock.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("searches as the user types", async () => {
    vi.useFakeTimers();
    renderComponent();

    await act(async () => {
      fireEvent.click(screen.getByRole("combobox"));
      vi.advanceTimersByTime(100);
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId("exercise-search-input"), { target: { value: "B" } });
      vi.advanceTimersByTime(100);
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("exercise-search-input"), { target: { value: "Be" } });
      vi.advanceTimersByTime(100);
    });

    await act(async () => {
      fireEvent.change(screen.getByTestId("exercise-search-input"), { target: { value: "Ben" } });
      vi.advanceTimersByTime(299);
    });

    expect(searchExercisesMock).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(searchExercisesMock).toHaveBeenCalled();
  });
});
