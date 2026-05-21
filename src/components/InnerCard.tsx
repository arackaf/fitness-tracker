import { cn } from "@/lib/utils";
import { type FC, type HtmlHTMLAttributes, type JSX } from "react";

type InnerCardProps = {
  as?: keyof JSX.IntrinsicElements;
} & HtmlHTMLAttributes<any>;

export const InnerCard: FC<InnerCardProps> = props => {
  const { children, as = "div", className = "", ...rest } = props;
  const Comp = as;
  return (
    <Comp className={cn("rounded-lg sm:border sm:border-border/80 sm:bg-background/70 sm:p-3", className)} {...rest}>
      {children}
    </Comp>
  );
};
