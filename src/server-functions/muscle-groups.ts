import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getMuscleGroups } from "@/data/muscle-groups/get-muscle-groups";

export const getMuscleGroupsServerFn = createServerFn({
  method: "GET",
}).handler(async () => {
  return getMuscleGroups();
});

export const muscleGroupsQueryOptions = () =>
  queryOptions({
    queryKey: ["muscle-groups"],
    queryFn: () => getMuscleGroupsServerFn(),
  });
