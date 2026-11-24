import { useState, type FC } from "react";

import type { MuscleGroup } from "@/data/types";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type MuscleGroupSelectorProps = {
  muscleGroups: MuscleGroup[];
  onSelected: (muscleGroup: MuscleGroup) => void;
};

export const MuscleGroupSelector: FC<MuscleGroupSelectorProps> = ({ muscleGroups, onSelected }) => {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const disabled = muscleGroups.length === 0;

  return (
    <Combobox<MuscleGroup>
      items={muscleGroups}
      value={null}
      onValueChange={(selectedMuscleGroup, eventDetails) => {
        // Cancel the selection so Base UI never stores the value or fills the input with its label.
        eventDetails.cancel();

        setInputValue("");
        setOpen(false);

        if (selectedMuscleGroup) {
          onSelected(selectedMuscleGroup);
        }
      }}
      open={open}
      onOpenChange={setOpen}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      itemToStringLabel={muscleGroup => muscleGroup.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
      disabled={disabled}
    >
      <ComboboxInput
        className="w-full"
        placeholder={disabled ? "All muscle groups selected" : "Search muscle groups"}
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>No muscle groups found.</ComboboxEmpty>
        <ComboboxList>
          {(muscleGroup: MuscleGroup) => (
            <ComboboxItem key={muscleGroup.id} value={muscleGroup}>
              {muscleGroup.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
