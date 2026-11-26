export function return42() {
  return 42;
}

export const moduleState = {
  currentValue: 0,
  increment() {
    return ++this.currentValue;
  },
  decrement() {
    return --this.currentValue;
  },
  return42: () => 42,
};
