type HeaderProps = {
  title: string;
};

export function Header({ title }: HeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 md:text-4xl">
        {title}
      </h1>
    </header>
  );
}
