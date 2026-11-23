import type { ComponentProps } from "react";
import { createLink, useRouter, type LinkComponent } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type NavAnchorProps = ComponentProps<"a"> & { active?: boolean; className?: string };

const NavAnchor = (props: NavAnchorProps) => <a {...props} />;

const CreatedNavLink = createLink(NavAnchor);

export const navLinkClassName =
  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

export const activeNavLinkProps = {
  className: "cursor-default bg-primary text-primary-foreground",
};

export const inactiveNavLinkProps = {
  className: "hover:bg-accent hover:text-accent-foreground",
};

export const NavLink: LinkComponent<typeof NavAnchor> = props => {
  const { active, className } = props;
  const {
    matchRoutes,
    state: { matches },
  } = useRouter();

  console.log({ matchRoutes, matches });
  //const isActive = pathname.startsWith(props.to);
  return <CreatedNavLink {...props} className={cn(navLinkClassName, className)} />;
};

/*

Type 'LinkComponentReactProps<(props: NavAnchorProps) => Element> & MakeToRequired<TRouter, TFrom, TTo> & ... 7 more ... & { ...; }' is not assignable to type 'IntrinsicAttributes & LinkComponentReactProps<(props: NavAnchorProps) => Element> & MakeToRequired<TRouter, TFrom, TTo> & ... 7 more ... & LinkPropsChildren'.
  Type 'LinkComponentReactProps<(props: NavAnchorProps) => Element> & MakeToRequired<TRouter, TFrom, TTo> & ... 7 more ... & { ...; }' is not assignable to type 'LinkPropsChildren'.

*/
