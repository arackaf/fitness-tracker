import { queryOptions } from "@tanstack/react-query";

import { getMuscleGroupsServerFn } from "./muscle-groups";

export const muscleGroupsQueryOptions = () =>
  queryOptions({
    queryKey: ["muscle-groups"],
    queryFn: () => getMuscleGroupsServerFn(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
