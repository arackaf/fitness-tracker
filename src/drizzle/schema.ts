import {
  pgTable,
  integer,
  varchar,
  timestamp,
  text,
  date,
  boolean,
  index,
  foreignKey,
  primaryKey,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const exercises = pgTable(
  "exercises",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 150 }).notNull(),
    description: text(),
    muscleGroups: integer("muscle_groups").array().notNull(),
    isCompound: boolean("is_compound"),
  },
  table => [
    index("idx_exercises_muscle_groups_gin").using(
      "gin",
      table.muscleGroups.asc().nullsLast(),
    ),
  ],
);

export const muscleGroup = pgTable(
  "muscle_group",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }).notNull(),
  },
  table => [unique("muscle_group_name_key").on(table.name)],
);

export const users = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    username: varchar({ length: 250 }).notNull(),
    password: varchar({ length: 250 }).notNull(),
    displayName: varchar("display_name", { length: 250 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`now()`)
      .notNull(),
  },
  table => [unique("users_username_key").on(table.username)],
);

export const workout = pgTable(
  "workout",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 50 }).notNull(),
    description: text().default("").notNull(),
    workoutDate: date("workout_date").notNull(),
  },
  table => [
    index("idx_workout_workout_date").using(
      "btree",
      table.workoutDate.asc().nullsLast(),
    ),
  ],
);

export const workoutLog = pgTable(
  "workout_log",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    clientStart: timestamp("client_start", { withTimezone: true }),
    clientEnd: timestamp("client_end", { withTimezone: true }),
    serverStart: timestamp("server_start", { withTimezone: true }),
    serverEnd: timestamp("server_end", { withTimezone: true }),
    operation: varchar({ length: 150 }).notNull(),
    traceId: varchar("trace_id", { length: 150 }),
  },
  table => [
    index("idx_workout_log_client_start").using(
      "btree",
      table.clientStart.asc().nullsLast(),
    ),
    index("idx_workout_log_operation").using(
      "btree",
      table.operation.asc().nullsLast(),
    ),
    index("idx_workout_log_server_start").using(
      "btree",
      table.serverStart.asc().nullsLast(),
    ),
    index("idx_workout_log_trace_id").using(
      "btree",
      table.traceId.asc().nullsLast(),
    ),
    check(
      "workout_log_check",
      sql`((client_end IS NULL) OR (client_start IS NULL) OR (client_end >= client_start))`,
    ),
    check(
      "workout_log_check1",
      sql`((server_end IS NULL) OR (server_start IS NULL) OR (server_end >= server_start))`,
    ),
  ],
);

export const workoutSegment = pgTable(
  "workout_segment",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workout.id, { onDelete: "cascade" }),
    segmentOrder: integer("segment_order").notNull(),
    sets: integer().notNull(),
  },
  table => [
    index("idx_workout_segment_workout_id_segment_order").using(
      "btree",
      table.workoutId.asc().nullsLast(),
      table.segmentOrder.asc().nullsLast(),
    ),
    check("workout_segment_segment_order_check", sql`(segment_order > 0)`),
    check("workout_segment_sets_check", sql`(sets > 0)`),
  ],
);

export const workoutSegmentExercise = pgTable(
  "workout_segment_exercise",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutSegmentId: integer("workout_segment_id")
      .notNull()
      .references(() => workoutSegment.id, { onDelete: "cascade" }),
    exerciseOrder: integer("exercise_order").notNull(),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id),
    reps: integer().array().notNull(),
    repsToFailure: boolean("reps_to_failure").notNull(),
  },
  table => [
    index("idx_workout_segment_exercise_segment_id_exercise_order").using(
      "btree",
      table.workoutSegmentId.asc().nullsLast(),
      table.exerciseOrder.asc().nullsLast(),
    ),
    check(
      "workout_segment_exercise_exercise_order_check",
      sql`(exercise_order > 0)`,
    ),
  ],
);

export const workoutTemplate = pgTable("workout_template", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 50 }).notNull(),
  description: text().default("").notNull(),
});

export const workoutTemplateSegment = pgTable(
  "workout_template_segment",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutTemplateId: integer("workout_template_id")
      .notNull()
      .references(() => workoutTemplate.id, { onDelete: "cascade" }),
    segmentOrder: integer("segment_order").notNull(),
    sets: integer().notNull(),
  },
  table => [
    index("idx_workout_template_segment_template_id_segment_order").using(
      "btree",
      table.workoutTemplateId.asc().nullsLast(),
      table.segmentOrder.asc().nullsLast(),
    ),
    check(
      "workout_template_segment_segment_order_check",
      sql`(segment_order > 0)`,
    ),
    check("workout_template_segment_sets_check", sql`(sets > 0)`),
  ],
);

export const workoutTemplateSegmentExercise = pgTable(
  "workout_template_segment_exercise",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutTemplateSegmentId: integer("workout_template_segment_id")
      .notNull()
      .references(() => workoutTemplateSegment.id, { onDelete: "cascade" }),
    exerciseOrder: integer("exercise_order").notNull(),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercises.id),
    reps: integer().array(),
    repsToFailure: boolean("reps_to_failure").notNull(),
  },
  table => [
    index(
      "idx_workout_template_segment_exercise_segment_id_exercise_order",
    ).using(
      "btree",
      table.workoutTemplateSegmentId.asc().nullsLast(),
      table.exerciseOrder.asc().nullsLast(),
    ),
    check(
      "workout_template_segment_exercise_check",
      sql`((reps_to_failure = true) OR (reps IS NOT NULL))`,
    ),
    check(
      "workout_template_segment_exercise_exercise_order_check",
      sql`(exercise_order > 0)`,
    ),
  ],
);
