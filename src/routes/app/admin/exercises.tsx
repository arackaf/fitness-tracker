import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { asc, sql } from "drizzle-orm";

import { ExerciseFilters } from "@/components/ExerciseFilters";
import { Header } from "@/components/Header";
import { ExerciseListDisplay } from "@/components/ExerciseListDisplay";

import { db } from "../../../drizzle/db";
import { exercises } from "../../../drizzle/schema";

const getExercises = createServerFn({ method: "GET" }).handler(async () => {
  return db.select().from(exercises).orderBy(asc(exercises.name));
});

const getMuscleGroups = createServerFn({ method: "GET" }).handler(async () => {
  const result = await db.execute<{ value: string }>(sql`
    select unnest(enum_range(null::muscle_group))::text as value
  `);

  return result.rows.map(row => row.value);
});

const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "list"],
    queryFn: () => getExercises(),
  });

const muscleGroupsQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "muscle-groups"],
    queryFn: () => getMuscleGroups(),
  });

export const Route = createFileRoute("/app/admin/exercises")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
      context.queryClient.ensureQueryData(muscleGroupsQueryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(
    [],
  );

  const filteredExercises = useMemo(() => {
    if (!selectedMuscleGroups.length) {
      return exercises;
    }

    return exercises.filter(exercise =>
      exercise.muscleGroups?.some(group =>
        selectedMuscleGroups.includes(group),
      ),
    );
  }, [exercises, selectedMuscleGroups]);

  const toggleMuscleGroup = (muscleGroup: string, checked: boolean) => {
    setSelectedMuscleGroups(current =>
      checked
        ? current.includes(muscleGroup)
          ? current
          : [...current, muscleGroup]
        : current.filter(group => group !== muscleGroup),
    );
  };

  return (
    <div>
      <Header title="Exercises" />

      <ExerciseFilters
        muscleGroups={muscleGroups}
        selectedMuscleGroups={selectedMuscleGroups}
        onToggleMuscleGroup={toggleMuscleGroup}
      />

      <ExerciseListDisplay exercises={filteredExercises} />
    </div>
  );
}
