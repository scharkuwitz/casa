import type { ListQuery, TodoStatusValue } from "@/lib/validation";

export const STATUS_LABEL: Record<TodoStatusValue, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const STATUS_TONE: Record<TodoStatusValue, string> = {
  TODO: "bg-status-todo/12 text-status-todo",
  IN_PROGRESS: "bg-status-progress/12 text-status-progress",
  DONE: "bg-status-done/12 text-status-done",
  CANCELLED: "bg-status-cancelled/12 text-status-cancelled",
};

/** Date -> "YYYY-MM-DD" (UTC), for <input type="date"> values. */
export const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

/** Date -> "10 Nov 2026" (UTC). */
export const formatDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/** Builds "/?…" from the current list query with overrides; defaults are omitted. */
export function listHref(
  q: ListQuery,
  override: Partial<Record<keyof ListQuery, string | undefined>> = {},
) {
  const merged: Record<string, string | undefined> = { ...q, ...override };
  const params = new URLSearchParams();
  if (merged.status) params.set("status", merged.status);
  if (merged.category) params.set("category", merged.category);
  if (merged.view && merged.view !== "list") params.set("view", merged.view);
  if (merged.sort && merged.sort !== "start") params.set("sort", merged.sort);
  if (merged.dir && merged.dir !== "asc") params.set("dir", merged.dir);
  const s = params.toString();
  return s ? `/?${s}` : "/";
}
