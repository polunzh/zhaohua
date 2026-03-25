export function formatRequest(
  method: string,
  path: string,
  status: number | undefined,
  elapsedMs: number,
): string {
  const statusStr = status != null ? String(status) : "---";
  return `${method} ${path} → ${statusStr} (${elapsedMs}ms)`;
}
