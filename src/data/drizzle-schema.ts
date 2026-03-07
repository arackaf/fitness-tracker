import * as schema from "@/drizzle/schema";
import * as relations from "@/drizzle/relations";

export const dbSchema = {
  ...schema,
  ...relations,
};

export type DbSchema = typeof dbSchema;
