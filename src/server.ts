import handler from "@tanstack/react-start/server-entry";

export { WorkoutTemplateAIGeneration } from "./durable-objects/WorkoutTemplateAIGeneration";

export default {
  fetch: handler.fetch,
};
