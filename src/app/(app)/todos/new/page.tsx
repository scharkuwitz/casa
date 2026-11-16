import { TodoForm } from "@/components/todo-form";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { toDateInput } from "@/lib/todo-ui";
import { createTodo } from "@/server/todos";

export default async function NewTodoPage() {
  await requireSession();
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  const today = toDateInput(new Date());
  return (
    <>
      <h1>New todo</h1>
      <p className="text-muted-foreground mt-3 text-sm">
        You can attach files once the todo has been created.
      </p>
      <div className="mt-4">
        <TodoForm
          action={createTodo}
          categories={categories}
          submitLabel="Create todo"
          defaults={{
            title: "",
            description: "",
            status: "TODO",
            startDate: today,
            endDate: today,
            categoryId: "",
          }}
        />
      </div>
    </>
  );
}
