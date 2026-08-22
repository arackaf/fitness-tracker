import handler from "@tanstack/react-start/server-entry";

export { WorkoutTemplateAIGeneration } from "./durable-objects/WorkoutTemplateAIGeneration/do";

export default {
  fetch: handler.fetch,
};
