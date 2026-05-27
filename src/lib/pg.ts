import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";
import { Pool } from "pg";

type RequestPg = {
  pool: Pool;
};

export function getPool(): Pool {
  const request = getRequest() as Request & { __pg?: RequestPg };

  if (!request.__pg) {
    request.__pg = {
      pool: new Pool({
        connectionString: env.HYPERDRIVE.connectionString,
        max: 5,
      }),
    };
  }

  return request.__pg.pool;
}
