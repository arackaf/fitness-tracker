import { useState, type FC } from "react";

import type { MuscleGroup } from "@/data/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MuscleGroupSelectorProps = {
  muscleGroups: MuscleGroup[];
  onSelected: (muscleGroup: MuscleGroup) => void;
};

export const MuscleGroupSelector: FC<MuscleGroupSelectorProps> = ({ muscleGroups, onSelected }) => {
  const [value, setValue] = useState<string | undefined>(undefined);

  return (
    <Select
      value={value}
      onValueChange={nextValue => {
        const selectedMuscleGroup = muscleGroups.find(muscleGroup => muscleGroup.id.toString() === nextValue);

        if (!selectedMuscleGroup) {
          return;
        }

        onSelected(selectedMuscleGroup);
        setValue(undefined);
      }}
      disabled={muscleGroups.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={muscleGroups.length === 0 ? "All muscle groups selected" : "Select muscle group"} />
      </SelectTrigger>
      <SelectContent>
        {muscleGroups.map(muscleGroup => (
          <SelectItem key={muscleGroup.id} value={muscleGroup.id.toString()}>
            {muscleGroup.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
