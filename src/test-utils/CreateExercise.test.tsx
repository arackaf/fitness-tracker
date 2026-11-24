import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Toaster } from "sonner";

import type { MuscleGroup } from "@/data/types";
import { CreateExercise } from "./CreateExercise";
import { saveExercise } from "./save-exercise";

vi.mock("./save-exercise", () => ({
  saveExercise: vi.fn(),
}));

const saveExerciseMock = vi.mocked(saveExercise);

const muscleGroups = [
  { id: 1, name: "Chest" },
  { id: 2, name: "Back" },
] as MuscleGroup[];

const renderComponent = () =>
  render(
    <>
      <CreateExercise muscleGroups={muscleGroups} />
      <Toaster />
    </>,
  );

describe("CreateExercise", () => {
  beforeEach(() => {
    saveExerciseMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a success toast after saving", async () => {
    saveExerciseMock.mockResolvedValue(true);
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Exercise name"), { target: { value: "Bench Press" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Exercise created")).toBeTruthy();
  });

  it("calls saveExercise", async () => {
    saveExerciseMock.mockResolvedValue(true);
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Exercise name"), { target: { value: "Bench Press" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(saveExerciseMock).toHaveBeenCalledWith({ name: "Bench Press", muscleGroupId: null });
    });
  });

  it("shows an error toast when saving fails", async () => {
    saveExerciseMock.mockResolvedValue(false);
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Exercise name"), { target: { value: "Bench Press" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("There was an error")).toBeTruthy();
  });

  it("shows a validation error and does not save when name is empty", async () => {
    renderComponent();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Exercise name is required")).toBeTruthy();
    expect(saveExerciseMock).not.toHaveBeenCalled();
  });
});
