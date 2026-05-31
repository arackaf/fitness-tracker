import type { SessionUser } from "./lib/auth.functions";

export type ContextUser = Pick<SessionUser, "name" | "image"> & { id: string };
