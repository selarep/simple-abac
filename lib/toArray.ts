export function toArray<T>(element: T | T[]): T[] {
  return Array.isArray(element) ? element : [element];
}