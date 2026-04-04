import { Suspense, useState, type FC, type PropsWithChildren } from "react";
import { Header, type HeaderProps } from "./Header";
import { Loading } from "./loading-state/Loading";

type SuspensePageLayoutProps = HeaderProps & {
  headerChildren?: React.ReactNode;
};

export const SuspensePageLayout: FC<PropsWithChildren<SuspensePageLayoutProps>> = props => {
  const { title, children, headerChildren } = props;

  return (
    <section>
      <Header title={title} children={headerChildren} />
      <Suspense fallback={<Loading placement="page" />}>{children}</Suspense>
    </section>
  );
};
