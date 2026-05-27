import { getRequest } from "@tanstack/react-start/server";
import { drizzle } from "drizzle-orm/node-postgres";

import { getPool } from "@/lib/pg";

export function getDb() {
  const request = getRequest() as Request & {
    __drizzle?: ReturnType<typeof createDb>;
  };

  if (!request.__drizzle) {
    request.__drizzle = createDb();
  }

  return request.__drizzle;
}

function createDb() {
  return drizzle({ client: getPool() });
}
