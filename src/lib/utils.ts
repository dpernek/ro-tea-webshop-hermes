import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return (
    new Intl.NumberFormat("hr-HR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " kn"
  );
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}
