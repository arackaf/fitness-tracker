export function add(a: number, b: number) {
  if (isNaN(a) || isNaN(b)) {
    return NaN;
  }
  return a + b;
}

export function divide(a: number, b: number) {
  if (isNaN(a) || isNaN(b)) {
    return NaN;
  }

  if (b === 0) {
    throw new Error("Cannot divide by zero");
  }
  return a / b;
}
