import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

export const getLoginStateServerFn = createServerFn({ method: "POST" }).handler(async ({ context }) => {
  return {
    loggedIn: context.loggedIn,
  };
});

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
