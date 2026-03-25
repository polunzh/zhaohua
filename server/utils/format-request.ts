export function formatRequest(
  method: string,
  path: string,
  status: number | undefined,
  elapsed: number,
): string {
  return `${method} ${path} ${status ?? "---"} (${elapsed}ms)`;
}
