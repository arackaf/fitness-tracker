export type SaveExerciseInput = {
  name: string;
  muscleGroupId: number;
};

export const saveExercise = async (_exercise: SaveExerciseInput): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 250));
  return true;
};
