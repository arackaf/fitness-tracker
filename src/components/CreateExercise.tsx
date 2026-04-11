import { useMemo, useState, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";

import { MuscleGroupSelector } from "@/components/MuscleGroupSelector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MuscleGroup } from "@/data/types";
import { createExerciseServerFn, exercisesQueryOptions, type CreateExerciseServerInput } from "@/server-functions/exercises";

type CreateExerciseProps = {
  muscleGroups: MuscleGroup[];
  onCancel: () => void;
  onCreated: () => void;
};

export const CreateExercise: FC<CreateExerciseProps> = ({ muscleGroups, onCancel, onCreated }) => {
  const queryClient = useQueryClient();

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [executionType, setExecutionType] = useState<CreateExerciseServerInput["executionType"]>("repetition");
  const [isCompound, setIsCompound] = useState(false);
  const [isBodyweight, setIsBodyweight] = useState(false);
  const [selectedMuscleGroupIds, setSelectedMuscleGroupIds] = useState<number[]>([]);

  const availableMuscleGroups = useMemo(
    () => muscleGroups.filter(group => !selectedMuscleGroupIds.includes(group.id)),
    [muscleGroups, selectedMuscleGroupIds],
  );

  const selectedMuscleGroups = useMemo(
    () => muscleGroups.filter(group => selectedMuscleGroupIds.includes(group.id)),
    [muscleGroups, selectedMuscleGroupIds],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Exercise name is required", { position: "top-center" });
      return;
    }

    if (selectedMuscleGroupIds.length === 0) {
      toast.error("Select at least one muscle group", { position: "top-center" });
      return;
    }

    setIsSaving(true);

    try {
      const response = await createExerciseServerFn({
        data: {
          name: trimmedName,
          description: description.trim() || null,
          muscleGroups: selectedMuscleGroupIds,
          isCompound,
          isBodyweight,
          executionType,
        },
      });

      const payload = (await response.json()) as {
        error?: boolean;
        message?: string;
      };

      if (response.status === 403) {
        toast.error(payload.message ?? "Forbidden", { position: "top-center" });
        return;
      }

      if (payload.error) {
        toast.error(payload.message ?? "Unable to create exercise", { position: "top-center" });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: exercisesQueryOptions().queryKey });
      toast.success("Exercise created", { position: "top-center" });
      onCreated();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create exercise</DialogTitle>
        <DialogDescription>Add a custom exercise to your catalog.</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input value={name} onChange={event => setName(event.target.value)} placeholder="Exercise name" maxLength={150} />

        <Textarea
          value={description}
          onChange={event => setDescription(event.target.value)}
          placeholder="Description (optional)"
          maxLength={1000}
        />

        <Select value={executionType} onValueChange={value => setExecutionType(value as CreateExerciseServerInput["executionType"])}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Execution type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="repetition">Repetition</SelectItem>
            <SelectItem value="distance">Distance</SelectItem>
            <SelectItem value="time">Time</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isCompound} onCheckedChange={checked => setIsCompound(!!checked)} />
            Compound exercise
          </label>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isBodyweight} onCheckedChange={checked => setIsBodyweight(!!checked)} />
            Bodyweight exercise
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <MuscleGroupSelector
            muscleGroups={availableMuscleGroups}
            onSelected={muscleGroup => {
              setSelectedMuscleGroupIds(current => (current.includes(muscleGroup.id) ? current : [...current, muscleGroup.id]));
            }}
          />

          <div className="flex flex-wrap gap-2">
            {selectedMuscleGroups.map(group => (
              <div key={group.id} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm">
                <span>{group.name}</span>
                <button
                  type="button"
                  className="rounded-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedMuscleGroupIds(current => current.filter(id => id !== group.id))}
                  aria-label={`Remove ${group.name}`}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Exercise"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
};
