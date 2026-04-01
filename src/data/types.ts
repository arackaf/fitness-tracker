import type { PgAsyncDatabase } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgliteQueryResultHKT } from "drizzle-orm/pglite";
import type { DbSchema } from "./drizzle-schema";
import {
  bodyCompositionLengthUnit,
  bodyCompositionMeasurementType,
  bodyCompositionWeightUnit,
  distanceUnit,
  durationUnit,
  exerciseWeightUnit,
  type muscleGroup,
} from "@/drizzle/schema";

export type DbType = PgAsyncDatabase<
  NodePgQueryResultHKT | PgliteQueryResultHKT,
  DbSchema
>;

export type MuscleGroup = typeof muscleGroup.$inferSelect;

export type DurationUnit = (typeof durationUnit.enumValues)[number];
export type DistanceUnit = (typeof distanceUnit.enumValues)[number];
export type ExerciseWeightUnit = (typeof exerciseWeightUnit.enumValues)[number];
export type BodyCompositionLengthUnit =
  (typeof bodyCompositionLengthUnit.enumValues)[number];
export type BodyCompositionWeightUnit =
  (typeof bodyCompositionWeightUnit.enumValues)[number];
export type BodyCompositionMeasurementType =
  (typeof bodyCompositionMeasurementType.enumValues)[number];
