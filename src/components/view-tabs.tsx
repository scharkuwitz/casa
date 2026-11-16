import Link from "next/link";
import { cn } from "@/lib/utils";
import { listHref } from "@/lib/todo-ui";
import type { ListQuery } from "@/lib/validation";

const TABS = [
  ["list", "Жагсаалт"],
  ["gantt", "Гант"],
] as const;

/** Wikipedia-style underline tabs. */
export function ViewTabs({ query }: { query: ListQuery }) {
  return (
    <nav aria-label="Харагдац" className="flex gap-4 border-b">
      {TABS.map(([view, label]) => (
        <Link
          key={view}
          href={listHref(query, { view })}
          aria-current={query.view === view ? "page" : undefined}
          className={cn(
            "-mb-px border-b-2 py-1 text-sm hover:no-underline",
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
