import Link from "next/link";
import { GanttViewLoader } from "@/components/gantt-view-loader";
import { ListFilters } from "@/components/list-filters";
import { TodoList } from "@/components/todo-list";
import { buttonVariants } from "@/components/ui/button";
import { ViewTabs } from "@/components/view-tabs";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { toDateInput } from "@/lib/todo-ui";
import {
  parseListQuery,
  type ListQuery,
  type TodoStatusValue,
} from "@/lib/validation";

const ORDER_FIELD = {
  start: "startDate",
  end: "endDate",
  title: "title",
  status: "status",
} as const;

function orderBy(q: ListQuery) {
  const primary = { [ORDER_FIELD[q.sort]]: q.dir };
  return [
    primary,
    { startDate: "asc" as const },
    { createdAt: "asc" as const },
  ];
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  await requireSession();
  const query = parseListQuery(await searchParams);

  const [todos, categories] = await Promise.all([
    db.todo.findMany({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.category && { categoryId: query.category }),
      },
      orderBy: orderBy(query),
      include: {
        category: { select: { name: true, color: true } },
        _count: { select: { attachments: true } },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  const filtered = !!(query.status || query.category);

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <h1 className="flex-1">Todos</h1>
        <Link href="/todos/new" className={buttonVariants()}>
          New todo
        </Link>
      </div>
      <div className="mt-4">
        <ViewTabs query={query} />
      </div>
      <div className="mt-4">
        <ListFilters query={query} categories={categories} />
      </div>
      <div className="mt-4">
        {todos.length === 0 ? (
          <p className="text-muted-foreground">
            {filtered ? (
              "No todos match these filters."
            ) : (
              <>
                No todos yet.{" "}
                <Link href="/todos/new">Create the first one</Link>.
              </>
            )}
          </p>
        ) : query.view === "gantt" ? (
          <GanttViewLoader
            todos={todos.map((t) => ({
              id: t.id,
              title: t.title,
              start: toDateInput(t.startDate),
              end: toDateInput(t.endDate),
              status: t.status as TodoStatusValue,
            }))}
          />
        ) : (
          <TodoList todos={todos} query={query} />
        )}
      </div>
    </>
  );
}
