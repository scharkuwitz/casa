import Link from "next/link";
import { nativeControl } from "@/components/field";
import { Button } from "@/components/ui/button";
import { STATUS_LABEL } from "@/lib/todo-ui";
import { TODO_STATUSES, type ListQuery } from "@/lib/validation";

/** Plain GET form: works without JS and keeps the URL the single source of truth. */
export function ListFilters({
  query,
  categories,
}: {
  query: ListQuery;
  categories: { id: string; name: string }[];
}) {
  const filtered = !!(query.status || query.category);
  return (
    <form className="flex flex-wrap items-end gap-2" action="/" method="get">
      {query.view !== "list" && (
        <input type="hidden" name="view" value={query.view} />
      )}
      {query.sort !== "start" && (
        <input type="hidden" name="sort" value={query.sort} />
      )}
      {query.dir !== "asc" && (
        <input type="hidden" name="dir" value={query.dir} />
      )}
      <label className="text-sm">
        <span className="text-muted-foreground mb-0.5 block text-xs">
          Төлөв
        </span>
        <select
          name="status"
          defaultValue={query.status ?? ""}
          className={`${nativeControl} w-auto min-w-32`}
        >
          <option value="">Бүгд</option>
          {TODO_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="text-muted-foreground mb-0.5 block text-xs">
          Ангилал
        </span>
        <select
          name="category"
          defaultValue={query.category ?? ""}
          className={`${nativeControl} w-auto min-w-32`}
        >
          <option value="">Бүгд</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="outline">
        Шүүх
      </Button>
      {filtered && (
        <Link
          href={query.view === "list" ? "/" : `/?view=${query.view}`}
          className="text-sm"
        >
          Шүүлтүүр арилгах
        </Link>
      )}
    </form>
  );
}
