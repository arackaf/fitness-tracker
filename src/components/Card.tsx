import { cn } from "@/lib/utils";
import { type FC, type HtmlHTMLAttributes, type JSX } from "react";

type CardProps = {
  as?: keyof JSX.IntrinsicElements;
  hoverStyle?: "border";
} & HtmlHTMLAttributes<any>;

export const Card: FC<CardProps> = props => {
  const { children, as = "div", className = "", hoverStyle, ...rest } = props;
  const Comp = as;
  return (
    <Comp
      className={cn(
        "rounded-xl bg-card border border-card-border p-4",
        hoverStyle === "border" && "hover:border-card-hover-border",
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
};
