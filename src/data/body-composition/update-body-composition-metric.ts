import { eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMetricState } from "@/data/body-composition/body-composition-state";
import { getDb } from "@/data/db";
import { bodyCompositionMetric } from "@/drizzle/schema";

export const updateBodyCompositionMetric = async (
  input: BodyCompositionMetricState,
) => {
  if (input.id == null) {
    throw new Error("Body composition metric ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  const [updatedMetric] = await db
    .update(bodyCompositionMetric)
    .set({
      name: input.name.trim(),
      measurementType: input.measurementType,
    })
    .where(eq(bodyCompositionMetric.id, input.id))
    .returning({ id: bodyCompositionMetric.id });

  if (!updatedMetric) {
    throw new Error(`Body composition metric ${input.id} was not found.`);
  }

  return updatedMetric.id;
};
