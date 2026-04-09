import { cn } from "@/lib/utils";
import { type FC, type HtmlHTMLAttributes, type JSX } from "react";

type InnerCardProps = {
  as?: keyof JSX.IntrinsicElements;
} & HtmlHTMLAttributes<any>;

export const InnerCard: FC<InnerCardProps> = props => {
  const { children, as = "div", className = "", ...rest } = props;
  const Comp = as;
  return (
    <Comp className={cn("rounded-lg border border-border/80 bg-background/70 p-3", className)} {...rest}>
      {children}
    </Comp>
  );
};
