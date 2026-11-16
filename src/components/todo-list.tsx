import Link from "next/link";
import { Paperclip } from "lucide-react";
import { StatusSelect } from "@/components/status-select";
import { listHref } from "@/lib/todo-ui";
import { formatDate } from "@/lib/todo-ui";
import type { ListQuery, TodoStatusValue } from "@/lib/validation";

export type ListTodo = {
  id: string;
  title: string;
  status: string;
  startDate: Date;
  endDate: Date;
  category: { name: string; color: string } | null;
  _count: { attachments: number };
};

const DAY = 86_400_000;
const durationDays = (t: ListTodo) =>
  Math.round((t.endDate.getTime() - t.startDate.getTime()) / DAY) + 1;

function SortHeader({
  query,
  sortKey,
  children,
}: {
  query: ListQuery;
  sortKey: ListQuery["sort"];
  children: React.ReactNode;
}) {
  const active = query.sort === sortKey;
  const nextDir = active && query.dir === "asc" ? "desc" : "asc";
  return (
    <th
      aria-sort={
        active ? (query.dir === "asc" ? "ascending" : "descending") : "none"
      }
    >
      <Link
        href={listHref(query, { sort: sortKey, dir: nextDir })}
        className="hover:no-underline"
      >
        {children}
        {active && (query.dir === "asc" ? " ↑" : " ↓")}
      </Link>
    </th>
  );
}

export function TodoList({
  todos,
  query,
}: {
  todos: ListTodo[];
  query: ListQuery;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table>
        <thead>
          <tr>
            <SortHeader query={query} sortKey="title">
              Title
            </SortHeader>
            <th>Category</th>
            <SortHeader query={query} sortKey="status">
              Status
            </SortHeader>
            <SortHeader query={query} sortKey="start">
              Start
            </SortHeader>
            <SortHeader query={query} sortKey="end">
              End
            </SortHeader>
            <th>Days</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((t) => (
            <tr key={t.id}>
              <td>
                <Link href={`/todos/${t.id}`}>{t.title}</Link>
                {t._count.attachments > 0 && (
                  <span
                    className="text-muted-foreground ml-2 inline-flex items-center gap-0.5 align-middle text-xs"
                    title={`${t._count.attachments} attachment(s)`}
                  >
                    <Paperclip className="size-3" aria-hidden />
                    {t._count.attachments}
                  </span>
                )}
              </td>
              <td>
                {t.category ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: t.category.color }}
                    />
                    {t.category.name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td>
                <StatusSelect id={t.id} status={t.status as TodoStatusValue} />
              </td>
              <td className="text-muted-foreground whitespace-nowrap">
                {formatDate(t.startDate)}
              </td>
              <td className="text-muted-foreground whitespace-nowrap">
                {formatDate(t.endDate)}
              </td>
              <td className="text-muted-foreground">{durationDays(t)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
