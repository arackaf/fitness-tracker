import type { SessionUser } from "./lib/auth";

export type ContextUser = Pick<SessionUser, "name" | "image"> & { id: string };
