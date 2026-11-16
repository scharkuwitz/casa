import type { ListQuery, TodoStatusValue } from "@/lib/validation";

export const STATUS_LABEL: Record<TodoStatusValue, string> = {
  TODO: "Хийх",
  IN_PROGRESS: "Явагдаж буй",
  DONE: "Дууссан",
  CANCELLED: "Цуцлагдсан",
};

export const STATUS_TONE: Record<TodoStatusValue, string> = {
  TODO: "text-status-todo",
  IN_PROGRESS: "text-status-progress",
  DONE: "text-status-done",
  CANCELLED: "text-status-cancelled",
};

/** Gantt bar progress per status. */
export const STATUS_PROGRESS: Record<TodoStatusValue, number> = {
  TODO: 0,
  IN_PROGRESS: 50,
  DONE: 100,
  CANCELLED: 0,
};

/** Date -> "YYYY-MM-DD" (UTC), for <input type="date"> values. */
export const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

/** Date -> "2026-11-10" (UTC): compact and unambiguous. */
export const formatDate = toDateInput;

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
