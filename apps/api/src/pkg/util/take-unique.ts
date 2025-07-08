import { InternalServerError } from "@/pkg/errors";

export function takeUnique<T>(arr: T[]): T {
  return arr[0] as T;
}
export function takeUniqueOrNull<T>(arr: T[]): T | null {
  return arr[0] ?? null;
}

export function takeUniqueOrThrow<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new InternalServerError("No unique item found in array, this should never happen");
  }
  return arr[0] as T;
}
