import { eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMetricState } from "@/data/body-composition/body-composition-state";
import { db } from "@/data/db";
import { bodyCompositionMetric } from "@/drizzle/schema";

export const updateBodyCompositionMetric = async (input: BodyCompositionMetricState) => {
  if (input.id == null) {
    throw new Error("Body composition metric ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  await db
    .update(bodyCompositionMetric)
    .set({
      name: input.name.trim(),
      measurementType: input.measurementType,
    })
    .where(eq(bodyCompositionMetric.id, input.id));
};
