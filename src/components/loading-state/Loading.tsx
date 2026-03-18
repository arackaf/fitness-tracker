import type { FC } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type LoadingProps = {
  className?: string;
  fadeIn?: boolean;
};
export const Loading: FC<LoadingProps> = props => {
  const { className, fadeIn = false } = props;

  return (
    <div
      className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        fadeIn &&
          "animate-in fade-in duration-200 delay-50 fill-mode-[backwards]",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-transparent animation-duration-[1.8s]" />
    </div>
  );
};

export const AnimatedLoading = motion(Loading);
