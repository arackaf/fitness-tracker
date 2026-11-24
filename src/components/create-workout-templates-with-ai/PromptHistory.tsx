import type { FC } from "react";
import { Link } from "@tanstack/react-router";
import type { SessionSummary } from "@/durable-objects/WorkoutTemplateAIGeneration/types";

type PromptHistoryProps = {
  sessions: SessionSummary[];
};

export const PromptHistory: FC<PromptHistoryProps> = ({ sessions }) => {
  if (!sessions.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">Previous Sessions</h3>
      <ul className="flex flex-col gap-1">
        {sessions.map(session => (
          <li key={session.id}>
            <Link
              to="/app/admin/workout-templates/ai/$id"
              params={{ id: String(session.id) }}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <span className="text-muted-foreground">{session.name || `Session ${session.id}`}</span>
              <span className="flex gap-3 text-xs text-muted-foreground">
                <span>
                  {session.promptCount} {session.promptCount === 1 ? "prompt" : "prompts"}
                </span>
                <span>{session.totalWorkoutsGenerated} generated</span>
                <span>{session.savedCount} saved</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
