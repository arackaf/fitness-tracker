import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getMuscleGroups } from "@/data/muscle-groups/get-muscle-groups";
import { requireUserId } from "@/lib/server-auth";

export const getMuscleGroupsServerFn = createServerFn({
  method: "GET",
}).handler(async ({ context }) => {
  const userId = await requireUserId(context);
  return getMuscleGroups(userId);
});

export const muscleGroupsQueryOptions = () =>
  queryOptions({
    queryKey: ["muscle-groups"],
    queryFn: () => getMuscleGroupsServerFn(),
  });
