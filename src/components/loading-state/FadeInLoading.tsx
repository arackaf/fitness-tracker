import type { FC } from "react";
import { Loading } from "./Loading";
import { cn } from "@/lib/utils";

export const FadeInLoading: FC<{ className?: string }> = ({ className }) => {
  return (
    <Loading
      className={cn(
        "animate-in fade-in duration-200 delay-50 fill-mode-[backwards]",
        className,
      )}
    />
  );
};
