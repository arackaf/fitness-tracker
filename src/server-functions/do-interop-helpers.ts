export function doStrip<T>(value: T): Omit<T, typeof Symbol.dispose> {
  return value;
}
