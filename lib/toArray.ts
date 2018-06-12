export function toArray(element: string | string[]): string[] {
  return Array.isArray(element) ? element : [element];
}