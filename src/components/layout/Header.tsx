import type { FC, PropsWithChildren } from "react";

export type HeaderProps = {
  title: string;
};

export const Header: FC<PropsWithChildren<HeaderProps>> = ({ title, children }) => {
  return (
    <header className="mb-4 sm:mb-8 flex items-start justify-between">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      {children}
    </header>
  );
};
