import type { FC } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ExecutionType = "repetition" | "distance" | "time";

type ExecutionTypeSelectProps = {
  value: ExecutionType;
  onValueChange: (value: ExecutionType) => void;
};

export const ExecutionTypeSelect: FC<ExecutionTypeSelectProps> = ({ value, onValueChange }) => {
  return (
    <Select
      value={value}
      onValueChange={selectedValue => {
        onValueChange(selectedValue as ExecutionType);
      }}
    >
      <SelectTrigger className="w-28">
        <SelectValue placeholder="Execution type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="repetition">Reps</SelectItem>
        <SelectItem value="distance">Distance</SelectItem>
        <SelectItem value="time">Time</SelectItem>
      </SelectContent>
    </Select>
  );
};
