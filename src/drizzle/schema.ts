import {
  pgEnum,
  pgTable,
  integer,
  text,
  timestamp,
  varchar,
  boolean,
  numeric,
  index,
  foreignKey,
  primaryKey,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const executionType = pgEnum("execution_type", ["repetition", "distance", "time"]);
export const durationUnit = pgEnum("duration_unit", ["seconds", "minutes", "hours"]);
export const distanceUnit = pgEnum("distance_unit", ["feet", "yards", "miles", "km"]);
export const exerciseWeightUnit = pgEnum("exercise_weight_unit", ["lbs", "kg"]);
export const bodyCompositionMeasurementType = pgEnum("body_composition_measurement_type", ["length", "weight", "percentage"]);
export const bodyCompositionLengthUnit = pgEnum("body_composition_length_unit", ["inches", "cm"]);
export const bodyCompositionWeightUnit = pgEnum("body_composition_weight_unit", ["lbs", "kg"]);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  table => [index("account_userId_idx").using("btree", table.userId.asc().nullsLast())],
);

export const bodyCompositionMeasurement = pgTable("body_composition_measurement", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text().notNull(),
  bodyCompositionMetricId: integer("body_composition_metric_id")
    .notNull()
    .references(() => bodyCompositionMetric.id),
  measurementDate: timestamp("measurement_date").notNull(),
  value: numeric({ precision: 8, scale: 2, mode: "number" }).notNull(),
  lengthUnit: bodyCompositionLengthUnit("length_unit"),
  weightUnit: bodyCompositionWeightUnit("weight_unit"),
});

export const bodyCompositionMetric = pgTable("body_composition_metric", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text().notNull(),
  name: varchar({ length: 50 }).notNull(),
  measurementType: bodyCompositionMeasurementType("measurement_type").notNull(),
});

export const exercises = pgTable(
  "exercises",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text().notNull(),
    name: varchar({ length: 150 }).notNull(),
    description: text(),
    muscleGroups: integer("muscle_groups").array().notNull(),
    isCompound: boolean("is_compound"),
    isBodyweight: boolean("is_bodyweight"),
    executionType: executionType("execution_type").notNull(),
  },
  table => [index("idx_exercises_muscle_groups_gin").using("gin", table.muscleGroups.asc().nullsLast())],
);

export const muscleGroup = pgTable(
  "muscle_group",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text().notNull(),
    name: varchar({ length: 50 }).notNull(),
  },
  table => [unique("muscle_group_user_id_name_key").on(table.userId, table.name)],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  table => [
    index("session_userId_idx").using("btree", table.userId.asc().nullsLast()),
    unique("session_token_key").on(table.token),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  table => [unique("user_email_key").on(table.email)],
);

export const userInfo = pgTable("user_info", {
  userId: text().primaryKey(),
  displayName: text("display_name"),
  imageUrl: text("image_url"),
  initialDataSetup: boolean("initial_data_setup"),
});

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  table => [index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast())],
);

export const workout = pgTable(
  "workout",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text().notNull(),
    name: varchar({ length: 50 }).notNull(),
    description: text().default("").notNull(),
    workoutDate: timestamp("workout_date").notNull(),
    workoutTemplateId: integer("workout_template_id"),
  },
  table => [index("idx_workout_workout_date").using("btree", table.workoutDate.asc().nullsLast())],
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
    workoutTemplateSegmentId: integer("workout_template_segment_id"),
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
    executionType: executionType("execution_type"),
    exerciseWeightUnit: exerciseWeightUnit("exercise_weight_unit"),
    durationUnit: durationUnit("duration_unit"),
    distanceUnit: distanceUnit("distance_unit"),
    workoutTemplateSegmentExerciseId: integer("workout_template_segment_exercise_id"),
  },
  table => [
    index("idx_workout_segment_exercise_segment_id_exercise_order").using(
      "btree",
      table.workoutSegmentId.asc().nullsLast(),
      table.exerciseOrder.asc().nullsLast(),
    ),
    check("workout_segment_exercise_exercise_order_check", sql`(exercise_order > 0)`),
  ],
);

export const workoutSegmentExerciseMeasurement = pgTable(
  "workout_segment_exercise_measurement",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutSegmentExerciseId: integer("workout_segment_exercise_id")
      .notNull()
      .references(() => workoutSegmentExercise.id, { onDelete: "cascade" }),
    setOrder: integer("set_order").notNull(),
    reps: integer(),
    weightUsed: numeric("weight_used", { precision: 8, scale: 2, mode: "number" }),
    duration: numeric({ precision: 8, scale: 2, mode: "number" }),
    distance: numeric({ precision: 8, scale: 2, mode: "number" }),
    workoutTemplateSegmentExerciseMeasurementId: integer("workout_template_segment_exercise_measurement_id"),
    templateReps: varchar("template_reps", { length: 50 }),
    templateWeightUsed: varchar("template_weight_used", { length: 50 }),
    templateDuration: varchar("template_duration", { length: 50 }),
    templateDistance: varchar("template_distance", { length: 50 }),
  },
  table => [
    index("idx_workout_segment_exercise_measurement_exercise_id_set_order").using(
      "btree",
      table.workoutSegmentExerciseId.asc().nullsLast(),
      table.setOrder.asc().nullsLast(),
    ),
    check("workout_segment_exercise_measurement_set_order_check", sql`(set_order > 0)`),
  ],
);

export const workoutTemplate = pgTable("workout_template", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text().notNull(),
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
    check("workout_template_segment_segment_order_check", sql`(segment_order > 0)`),
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
    executionType: executionType("execution_type"),
    exerciseWeightUnit: exerciseWeightUnit("exercise_weight_unit"),
    durationUnit: durationUnit("duration_unit"),
    distanceUnit: distanceUnit("distance_unit"),
  },
  table => [
    index("idx_workout_template_segment_exercise_segment_id_exercise_order").using(
      "btree",
      table.workoutTemplateSegmentId.asc().nullsLast(),
      table.exerciseOrder.asc().nullsLast(),
    ),
    check("workout_template_segment_exercise_exercise_order_check", sql`(exercise_order > 0)`),
  ],
);

export const workoutTemplateSegmentExerciseMeasurement = pgTable(
  "workout_template_segment_exercise_measurement",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutTemplateSegmentExerciseId: integer("workout_template_segment_exercise_id")
      .notNull()
      .references(() => workoutTemplateSegmentExercise.id, { onDelete: "cascade" }),
    setOrder: integer("set_order").notNull(),
    reps: varchar({ length: 50 }),
    repsToFailure: boolean("reps_to_failure"),
    weightUsed: varchar("weight_used", { length: 50 }),
    duration: varchar({ length: 50 }),
    distance: varchar({ length: 50 }),
  },
  table => [check("workout_template_segment_exercise_measurement_set_order_check", sql`(set_order > 0)`)],
);
