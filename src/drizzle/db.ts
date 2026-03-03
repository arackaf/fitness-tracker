import { client } from "@/pg-setup/pg-lite";
import { drizzle } from "drizzle-orm/pglite";

import "../pg-setup/run-setup";

export const db = drizzle({ client });
