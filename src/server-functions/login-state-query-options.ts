import { queryOptions } from "@tanstack/react-query";

import { getLoginStateServerFn } from "./login-state";

export const getLoginStateQueryOptions = () => {
  return queryOptions({
    queryKey: ["login-state"],
    queryFn: () => {
      return getLoginStateServerFn();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
