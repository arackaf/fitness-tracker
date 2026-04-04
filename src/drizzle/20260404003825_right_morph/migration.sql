-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "execution_type" AS ENUM('repetition', 'distance', 'time');--> statement-breakpoint
CREATE TYPE "duration_unit" AS ENUM('seconds', 'minutes', 'hours');--> statement-breakpoint
CREATE TYPE "distance_unit" AS ENUM('feet', 'yards', 'miles', 'km');--> statement-breakpoint
CREATE TYPE "exercise_weight_unit" AS ENUM('lbs', 'kg');--> statement-breakpoint
CREATE TYPE "body_composition_measurement_type" AS ENUM('length', 'weight', 'percentage');--> statement-breakpoint
CREATE TYPE "body_composition_length_unit" AS ENUM('inches', 'cm');--> statement-breakpoint
CREATE TYPE "body_composition_weight_unit" AS ENUM('lbs', 'kg');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "body_composition_measurement" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "body_composition_measurement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"body_composition_metric_id" integer NOT NULL,
	"measurement_date" timestamp NOT NULL,
	"value" numeric(8,2) NOT NULL,
	"length_unit" "body_composition_length_unit",
	"weight_unit" "body_composition_weight_unit"
);
--> statement-breakpoint
CREATE TABLE "body_composition_metric" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "body_composition_metric_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"measurement_type" "body_composition_measurement_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"muscle_groups" integer[] NOT NULL,
	"is_compound" boolean,
	"is_bodyweight" boolean,
	"execution_type" "execution_type" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "muscle_group" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "muscle_group_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" varchar(50) NOT NULL CONSTRAINT "muscle_group_name_key" UNIQUE
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL CONSTRAINT "session_token_key" UNIQUE,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL CONSTRAINT "user_email_key" UNIQUE,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"workout_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_segment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_segment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_id" integer NOT NULL,
	"segment_order" integer NOT NULL,
	"sets" integer NOT NULL,
	CONSTRAINT "workout_segment_segment_order_check" CHECK ((segment_order > 0)),
	CONSTRAINT "workout_segment_sets_check" CHECK ((sets > 0))
);
--> statement-breakpoint
CREATE TABLE "workout_segment_exercise" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_segment_exercise_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_segment_id" integer NOT NULL,
	"exercise_order" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"execution_type" "execution_type",
	"exercise_weight_unit" "exercise_weight_unit",
	"duration_unit" "duration_unit",
	"distance_unit" "distance_unit",
	CONSTRAINT "workout_segment_exercise_exercise_order_check" CHECK ((exercise_order > 0))
);
--> statement-breakpoint
CREATE TABLE "workout_segment_exercise_measurement" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_segment_exercise_measurement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_segment_exercise_id" integer NOT NULL,
	"set_order" integer NOT NULL,
	"reps" integer,
	"weight_used" numeric(8,2),
	"duration" numeric(8,2),
	"distance" numeric(8,2),
	CONSTRAINT "workout_segment_exercise_measurement_set_order_check" CHECK ((set_order > 0))
);
--> statement-breakpoint
CREATE TABLE "workout_template" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_template_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" text NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_template_segment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_template_segment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_template_id" integer NOT NULL,
	"segment_order" integer NOT NULL,
	"sets" integer NOT NULL,
	CONSTRAINT "workout_template_segment_segment_order_check" CHECK ((segment_order > 0)),
	CONSTRAINT "workout_template_segment_sets_check" CHECK ((sets > 0))
);
--> statement-breakpoint
CREATE TABLE "workout_template_segment_exercise" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_template_segment_exercise_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_template_segment_id" integer NOT NULL,
	"exercise_order" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"execution_type" "execution_type",
	"exercise_weight_unit" "exercise_weight_unit",
	"duration_unit" "duration_unit",
	"distance_unit" "distance_unit",
	CONSTRAINT "workout_template_segment_exercise_exercise_order_check" CHECK ((exercise_order > 0))
);
--> statement-breakpoint
CREATE TABLE "workout_template_segment_exercise_measurement" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "workout_template_segment_exercise_measurement_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"workout_template_segment_exercise_id" integer NOT NULL,
	"set_order" integer NOT NULL,
	"reps" integer,
	"reps_to_failure" boolean,
	"weight_used" numeric(8,2),
	"duration" numeric(8,2),
	"distance" numeric(8,2),
	CONSTRAINT "workout_template_segment_exercise_measurement_set_order_check" CHECK ((set_order > 0))
);
--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("userId");--> statement-breakpoint
CREATE INDEX "idx_exercises_muscle_groups_gin" ON "exercises" USING gin ("muscle_groups");--> statement-breakpoint
CREATE INDEX "idx_workout_segment_exercise_measurement_exercise_id_set_order" ON "workout_segment_exercise_measurement" ("workout_segment_exercise_id","set_order");--> statement-breakpoint
CREATE INDEX "idx_workout_segment_exercise_segment_id_exercise_order" ON "workout_segment_exercise" ("workout_segment_id","exercise_order");--> statement-breakpoint
CREATE INDEX "idx_workout_segment_workout_id_segment_order" ON "workout_segment" ("workout_id","segment_order");--> statement-breakpoint
CREATE INDEX "idx_workout_template_segment_exercise_segment_id_exercise_order" ON "workout_template_segment_exercise" ("workout_template_segment_id","exercise_order");--> statement-breakpoint
CREATE INDEX "idx_workout_template_segment_template_id_segment_order" ON "workout_template_segment" ("workout_template_id","segment_order");--> statement-breakpoint
CREATE INDEX "idx_workout_workout_date" ON "workout" ("workout_date");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_template_segment" ADD CONSTRAINT "workout_template_segment_workout_template_id_fkey" FOREIGN KEY ("workout_template_id") REFERENCES "workout_template"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_template_segment_exercise" ADD CONSTRAINT "workout_template_segment_exerc_workout_template_segment_id_fkey" FOREIGN KEY ("workout_template_segment_id") REFERENCES "workout_template_segment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_template_segment_exercise" ADD CONSTRAINT "workout_template_segment_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id");--> statement-breakpoint
ALTER TABLE "workout_template_segment_exercise_measurement" ADD CONSTRAINT "workout_template_segment_exer_workout_template_segment_exe_fkey" FOREIGN KEY ("workout_template_segment_exercise_id") REFERENCES "workout_template_segment_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_segment" ADD CONSTRAINT "workout_segment_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workout"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_segment_exercise" ADD CONSTRAINT "workout_segment_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id");--> statement-breakpoint
ALTER TABLE "workout_segment_exercise" ADD CONSTRAINT "workout_segment_exercise_workout_segment_id_fkey" FOREIGN KEY ("workout_segment_id") REFERENCES "workout_segment"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "workout_segment_exercise_measurement" ADD CONSTRAINT "workout_segment_exercise_measu_workout_segment_exercise_id_fkey" FOREIGN KEY ("workout_segment_exercise_id") REFERENCES "workout_segment_exercise"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "body_composition_measurement" ADD CONSTRAINT "body_composition_measurement_body_composition_metric_id_fkey" FOREIGN KEY ("body_composition_metric_id") REFERENCES "body_composition_metric"("id");
*/