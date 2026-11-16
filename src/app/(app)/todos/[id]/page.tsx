import { notFound } from "next/navigation";
import { Attachments } from "@/components/attachments";
import { DeleteButton } from "@/components/delete-button";
import { StatusBadge } from "@/components/status-badge";
import { TodoForm } from "@/components/todo-form";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { MAX_ATTACHMENTS_PER_TODO, MAX_UPLOAD_BYTES } from "@/lib/storage";
import { formatDate, toDateInput } from "@/lib/todo-ui";
import { idSchema, type TodoStatusValue } from "@/lib/validation";
import { deleteTodo, updateTodo } from "@/server/todos";

export default async function TodoPage({ params }: PageProps<"/todos/[id]">) {
  await requireSession();
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();
  const id = parsedId.data;

  const [todo, categories] = await Promise.all([
    db.todo.findUnique({
      where: { id },
      include: {
        category: true,
        attachments: {
          orderBy: { createdAt: "asc" },
          select: { id: true, fileName: true, size: true },
        },
      },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!todo) notFound();

  const rows: [string, React.ReactNode][] = [
    ["Төлөв", <StatusBadge key="s" status={todo.status as TodoStatusValue} />],
    ["Ангилал", todo.category?.name ?? "—"],
    ["Эхлэх", formatDate(todo.startDate)],
    ["Дуусах", formatDate(todo.endDate)],
    ["Үүсгэсэн", formatDate(todo.createdAt)],
  ];

  return (
    <>
      <h1>{todo.title}</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_16rem]">
        <div className="min-w-0">
          <h2>Засах</h2>
          <div className="mt-3">
            <TodoForm
              action={updateTodo.bind(null, todo.id)}
              categories={categories}
              submitLabel="Өөрчлөлт хадгалах"
              defaults={{
                title: todo.title,
                description: todo.description,
                status: todo.status,
                startDate: toDateInput(todo.startDate),
                endDate: toDateInput(todo.endDate),
                categoryId: todo.categoryId ?? "",
              }}
            />
          </div>
          <h2 className="mt-8">Хавсралт</h2>
          <div className="mt-3">
            <Attachments
              todoId={todo.id}
              items={todo.attachments}
              maxFiles={MAX_ATTACHMENTS_PER_TODO}
              maxMb={MAX_UPLOAD_BYTES / 1024 / 1024}
            />
          </div>
          <h2 className="mt-8">Устгах</h2>
          <p className="text-muted-foreground mt-3 mb-3 text-sm">
            Энэ ажил болон бүх хавсралтыг устгана. Буцаах боломжгүй.
          </p>
          <form action={deleteTodo.bind(null, todo.id)}>
            <DeleteButton confirmText={`“${todo.title}” ажлыг устгах уу?`}>
              Ажил устгах
            </DeleteButton>
          </form>
        </div>
        <aside className="order-first h-fit border text-sm lg:order-last">
          <div className="border-b px-3 py-1.5 font-semibold">Мэдээлэл</div>
          <dl className="divide-y">
            {rows.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[6rem_1fr] items-center gap-2 px-3 py-1.5"
              >
                <dt className="text-muted-foreground">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {todo.description && (
            <p className="border-t px-3 py-1.5 whitespace-pre-wrap">
              {todo.description}
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
