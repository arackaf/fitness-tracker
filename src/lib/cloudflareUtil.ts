import { getRequest } from "@tanstack/react-start/server";

export function getEnv(): Record<string, any> {
  // @ts-ignore
  return getRequest().env!;
}
