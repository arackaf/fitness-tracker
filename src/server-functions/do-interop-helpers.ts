export type StripDisposable<T> = T extends unknown ? Omit<T, typeof Symbol.dispose> : never;

export function doStrip<T>(value: T): StripDisposable<T> {
  return value as StripDisposable<T>;
}
