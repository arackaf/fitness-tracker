export type StripDisposable<T> = T extends Promise<infer U> ? StripDisposable<U> : Omit<T, typeof Symbol.dispose>;

export async function doStrip<T>(value: T): Promise<StripDisposable<T>> {
  return (await value) as StripDisposable<T>;
}
