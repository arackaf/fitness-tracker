import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateForPg = (val: Date) => {
  return format(val, "yyyy-MM-dd'T'HH:mm:ss");
};
