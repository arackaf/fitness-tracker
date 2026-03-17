import { createServerFn } from "@tanstack/react-start";

import { addLog, type AddLogInput } from "@/data/logging/add-log";

export const addNetworkTimingLog = createServerFn({ method: "POST" })
  .inputValidator((input: AddLogInput) => input)
  .handler(async ({ data }) => {
    return addLog(data);
  });

