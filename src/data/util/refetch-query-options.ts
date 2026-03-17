import { queryOptions, type QueryKey } from "@tanstack/react-query";

export function refetchedQueryOptions<
  T extends (arg: { data: any }) => Promise<any>,
>(queryKey: QueryKey, serverFn: T, arg: Parameters<T>[0]["data"]) {
  const queryKeyToUse = [...queryKey];
  if (arg != null) {
    queryKeyToUse.push(arg);
  }
  return queryOptions({
    queryKey: queryKeyToUse,
    queryFn: async (): Promise<Awaited<ReturnType<T>>> => {
      return serverFn({ data: arg });
    },
    meta: {
      __revalidate: {
        serverFn,
        arg,
      },
    },
  });
}
