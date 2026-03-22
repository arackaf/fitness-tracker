import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMetricState } from "@/data/body-composition/body-composition-state";
import { getDb } from "@/data/db";
import { bodyCompositionMetric } from "@/drizzle/schema";

export const insertBodyCompositionMetric = async (
  input: BodyCompositionMetricState,
) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  const [insertedMetric] = await db
    .insert(bodyCompositionMetric)
    .values({
      name: input.name.trim(),
      measurementType: input.measurementType,
    })
    .returning({ id: bodyCompositionMetric.id });

  return insertedMetric.id;
};
