import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function getContext() {
  const queryClient = new QueryClient();
  return {
    queryClient,
  };
}

export default function TanStackQueryProvider({
  children,
  context,
}: {
  children: ReactNode;
  context: ReturnType<typeof getContext>;
}) {
  const { queryClient } = context;

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
