import { createServerFn } from "@tanstack/react-start";

import { addLog, setClientEnd, type AddLogInput } from "@/data/logging/add-log";

export const addNetworkTimingLog = createServerFn({ method: "POST" })
  .inputValidator((input: AddLogInput) => input)
  .handler(async ({ data }) => {
    return addLog(data);
  });

type SetNetworkTimingLogClientEndInput = {
  traceId: string;
  clientEnd: Date;
};
export const setNetworkTimingLogClientEnd = createServerFn({ method: "POST" })
  .inputValidator((input: SetNetworkTimingLogClientEndInput) => input)
  .handler(async ({ data }) => {
    return setClientEnd(data.traceId, data.clientEnd);
  });
