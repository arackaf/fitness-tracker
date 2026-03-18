import type { FC } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export const LoadingAbsolute: FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        className,
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-white border-t-transparent animation-duration-[1.8s]" />
    </div>
  );
};

export const AnimatedLoadingAbsolute = motion(LoadingAbsolute);
