import { queryOptions } from "@tanstack/react-query";

import { getAiSessionsServerFn } from "./workout-template-ai";

export const getAiSessionsQueryOptions = () =>
  queryOptions({
    queryKey: ["ai-sessions"],
    queryFn: () => getAiSessionsServerFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
