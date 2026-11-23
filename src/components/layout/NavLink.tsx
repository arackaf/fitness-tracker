import { useEffect, useState, type ComponentProps } from "react";
import { createLink, useRouter, type LinkComponent } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type NavAnchorProps = ComponentProps<"a"> & { active?: boolean; className?: string; to: string };

export const navLinkClassName =
  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

export const activeNavLinkProps = {
  className: "cursor-default bg-primary text-primary-foreground",
};

export const inactiveNavLinkProps = {
  className: "hover:bg-accent hover:text-accent-foreground",
};

const NavAnchor = ({ className, active, to, ...props }: NavAnchorProps) => {
  const [isActive, setIsActive] = useState(active);
  const {
    state: { matches },
  } = useRouter();

  useEffect(() => {
    debugger;
    if (typeof active === "boolean") {
      setIsActive(active);
      return;
    }

    setIsActive(matches.some(match => match.pathname === to));
  }, [active, matches, to]);

  return (
    <a
      {...props}
      className={cn(
        navLinkClassName,
        isActive ? activeNavLinkProps.className : inactiveNavLinkProps.className,
        className,
      )}
    />
  );
};

const CreatedNavLink = createLink(NavAnchor);

export const NavLink: LinkComponent<typeof NavAnchor> = props => {
  return <CreatedNavLink {...props} />;
};

/*

Type 'LinkComponentReactProps<(props: NavAnchorProps) => Element> & MakeToRequired<TRouter, TFrom, TTo> & ... 7 more ... & { ...; }' is not assignable to type 'IntrinsicAttributes & LinkComponentReactProps<(props: NavAnchorProps) => Element> & MakeToRequired<TRouter, TFrom, TTo> & ... 7 more ... & LinkPropsChildren'.
  Type 'LinkComponentReactProps<(props: NavAnchorProps) => Element> & MakeToRequired<TRouter, TFrom, TTo> & ... 7 more ... & { ...; }' is not assignable to type 'LinkPropsChildren'.

*/
