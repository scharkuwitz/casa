import { z } from "zod";

export const TODO_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
] as const;
export type TodoStatusValue = (typeof TODO_STATUSES)[number];

/** Date-only "YYYY-MM-DD" string -> Date at UTC midnight. */
export const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Огноог YYYY-MM-DD хэлбэрээр оруулна уу")
  .refine(
    (s) => {
      const d = new Date(`${s}T00:00:00.000Z`);
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
    },
    {
      message: "Буруу огноо",
    },
  )
  .transform((s) => new Date(`${s}T00:00:00.000Z`));

export const idSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, "Буруу ID");

export const statusSchema = z.enum(TODO_STATUSES);

const dateRange = <T extends { startDate: Date; endDate: Date }>(v: T) =>
  v.endDate >= v.startDate;
const dateRangeIssue = {
  path: ["endDate"],
  message: "Дуусах огноо нь эхлэх огнооноос хойш эсвэл ижил байх ёстой",
};

export const todoSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Гарчиг оруулна уу")
      .max(200, "Хамгийн ихдээ 200 тэмдэгт"),
    description: z
      .string()
      .max(5000, "Хамгийн ихдээ 5000 тэмдэгт")
      .default("")
      .transform((v) => v.replace(/\r\n/g, "\n")),
    status: statusSchema.default("TODO"),
    startDate: dateOnly,
    endDate: dateOnly,
    categoryId: z
      .string()
      .optional()
      .transform((v) => (v ? v : null)),
  })
  .refine(dateRange, dateRangeIssue);
export type TodoInput = z.output<typeof todoSchema>;

export const todoDatesSchema = z
  .object({ startDate: dateOnly, endDate: dateOnly })
  .refine(dateRange, dateRangeIssue);

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Нэр оруулна уу")
    .max(50, "Хамгийн ихдээ 50 тэмдэгт"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Өнгийг #9c2233 шиг hex хэлбэрээр оруулна уу"),
});
export type CategoryInput = z.output<typeof categorySchema>;

export const VIEWS = ["list", "gantt"] as const;
export const SORT_KEYS = ["start", "end", "title", "status"] as const;

/** Parses `?status=&category=&sort=&dir=&view=`; anything invalid falls back to the default. */
export function parseListQuery(
  sp: Record<string, string | string[] | undefined>,
) {
  const first = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const status = statusSchema.safeParse(first("status"));
  const category = idSchema.safeParse(first("category"));
  const sort = z.enum(SORT_KEYS).safeParse(first("sort"));
  const dir = z.enum(["asc", "desc"]).safeParse(first("dir"));
  const view = z.enum(VIEWS).safeParse(first("view"));
  return {
    status: status.success ? status.data : undefined,
    category: category.success ? category.data : undefined,
    sort: sort.success ? sort.data : ("start" as const),
    dir: dir.success ? dir.data : ("asc" as const),
    view: view.success ? view.data : ("list" as const),
  };
}
export type ListQuery = ReturnType<typeof parseListQuery>;
