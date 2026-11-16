import Link from "next/link";
import { cn } from "@/lib/utils";
import { listHref } from "@/lib/todo-ui";
import type { ListQuery } from "@/lib/validation";

const TABS = [
  ["list", "List"],
  ["gantt", "Gantt"],
] as const;

/** Wikipedia "Article / Talk"-style underline tabs. */
export function ViewTabs({ query }: { query: ListQuery }) {
  return (
    <nav aria-label="View" className="flex gap-1 border-b">
      {TABS.map(([view, label]) => (
        <Link
          key={view}
          href={listHref(query, { view })}
          aria-current={query.view === view ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 px-3 py-1.5 text-sm hover:no-underline",
            query.view === view
              ? "border-primary text-foreground font-semibold"
              : "text-muted-foreground border-transparent",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
