import handler from "@tanstack/react-start/server-entry";

export { WorkoutTemplateAIGenerationDO } from "./durable-objects/WorkoutTemplateAIGeneration/do";

export default {
  fetch: handler.fetch,
};
