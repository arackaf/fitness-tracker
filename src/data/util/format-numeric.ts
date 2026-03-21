export const formatNumericForDisplay = (
  value: string | number | null | undefined,
): string => {
  if (value == null || value === "") {
    return "";
  }

  const numericValue = Number(value);
  // Keep original text if it isn't a valid number.
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }
  return numericValue.toString();
};
