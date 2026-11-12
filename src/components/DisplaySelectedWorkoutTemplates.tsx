import type { FC } from "react";
import { X } from "lucide-react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { Badge } from "@/components/ui/badge";

interface DisplaySelectedWorkoutTemplatesProps {
  selectedTemplates: WorkoutTemplateState[];
  onRemoveTemplate: (templateId: number) => void;
}

export const DisplaySelectedWorkoutTemplates: FC<DisplaySelectedWorkoutTemplatesProps> = ({
  selectedTemplates,
  onRemoveTemplate,
}) => {
  return (
    <div className="flex gap-2 text-sm min-h-5.5">
      <span className="font-medium">Selected workouts:</span>
      {selectedTemplates.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedTemplates.map(template => (
            <Badge key={template.id} variant="secondary" className="gap-1 pr-1">
              <span className="max-w-48 truncate">{template.name}</span>
              <button
                type="button"
                aria-label={`Remove ${template.name}`}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                onClick={() => {
                  if (template.id != null) {
                    onRemoveTemplate(template.id);
                  }
                }}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
};
