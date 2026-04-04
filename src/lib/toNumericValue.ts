export const toNumericValue = (value: string | number | null | undefined) => {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "string") {
    return Number(value);
  }

  return value;
};
