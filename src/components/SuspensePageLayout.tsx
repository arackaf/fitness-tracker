import { Suspense, useState, type FC, type PropsWithChildren } from "react";
import { Header, type HeaderProps } from "./Header";
import { Loading } from "./loading-state/Loading";

type SuspensePageLayoutProps = HeaderProps & {
  headerChildren?: React.ReactNode;
};

export const SuspensePageLayout: FC<
  PropsWithChildren<SuspensePageLayoutProps>
> = props => {
  const { title, children, headerChildren } = props;
  const [isLoading, setIsLoading] = useState(false);

  return (
    <section>
      <Header title={title} children={headerChildren} />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </section>
  );
};
