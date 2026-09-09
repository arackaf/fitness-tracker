import { useState, type FC } from "react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const MIN_PROMPT_LENGTH = 20;

type PromptInputProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
};

export const PromptInput: FC<PromptInputProps> = props => {
  const { prompt, setPrompt, onGenerate, isGenerating } = props;

  const trimmedPromptLength = prompt.trim().length;
  const remainingPromptChars = MIN_PROMPT_LENGTH - trimmedPromptLength;
  const isPromptValid = remainingPromptChars <= 0;

  return (
    <div className="flex flex-col gap-2 text-sm">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Prompt</span>
        <Textarea
          value={prompt}
          disabled={isGenerating}
          onChange={event => setPrompt(event.target.value)}
          placeholder="What are you looking for?"
          className="min-h-40"
        />
      </label>
      <div className="flex flex-col gap-2 self-start">
        <span className="text-xs text-muted-foreground">
          {!isPromptValid ? `${remainingPromptChars} more character${remainingPromptChars === 1 ? "" : "s"}` : " "}
        </span>
        <Button
          className="cursor-pointer w-44"
          disabled={!isPromptValid || isGenerating}
          type="button"
          onClick={() => onGenerate(prompt)}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>
    </div>
  );
};
