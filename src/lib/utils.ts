import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number in Indian currency format
 * Shows values in Lakhs (L) for < 1 Crore
 * Shows values in Crores (CR) for >= 1 Crore
 */
export function formatIndianCurrency(value: number, decimals: number = 1): string {
  const ONE_LAKH = 100000;
  const ONE_CRORE = 10000000;
  
  if (value >= ONE_CRORE) {
    // Show in Crores
    return `₹${(value / ONE_CRORE).toFixed(decimals)}CR`;
  } else if (value >= ONE_LAKH) {
    // Show in Lakhs
    return `₹${(value / ONE_LAKH).toFixed(decimals)}L`;
  } else {
    // Show actual value for small amounts
    return `₹${value.toFixed(0)}`;
  }
}

/**
 * Format value for chart display (without ₹ symbol)
 * Used in chart tooltips and axis labels
 */
export function formatChartValue(value: number, decimals: number = 1): string {
  const ONE_LAKH = 100000;
  const ONE_CRORE = 10000000;
  
  if (value >= ONE_CRORE) {
    return `${(value / ONE_CRORE).toFixed(decimals)}CR`;
  } else if (value >= ONE_LAKH) {
    return `${(value / ONE_LAKH).toFixed(decimals)}L`;
  } else {
    return value.toFixed(0);
  }
}
