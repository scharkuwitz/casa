import { DeleteButton } from "@/components/delete-button";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/server/categories";
import { CategoryForm } from "./category-form";

export default async function CategoriesPage() {
  await requireSession();
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { todos: true } } },
  });

  return (
    <>
      <h1>Categories</h1>
      <h2 className="mt-6">Add category</h2>
      <div className="mt-4">
        <CategoryForm
          action={createCategory}
          defaults={{ name: "", color: "#3366cc" }}
          submitLabel="Add"
          resetOnSuccess
        />
      </div>

      <h2 className="mt-10">All categories</h2>
      {categories.length === 0 ? (
        <p className="text-muted-foreground mt-3">No categories yet.</p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {categories.map((c) => (
            <li key={c.id} className="space-y-2 p-3">
              <CategoryForm
                action={updateCategory.bind(null, c.id)}
                defaults={{ name: c.name, color: c.color }}
                submitLabel="Save"
              />
              <form
                action={deleteCategory.bind(null, c.id)}
                className="flex items-center gap-3"
              >
                <DeleteButton
                  size="sm"
                  confirmText={`Delete category “${c.name}”? Its ${c._count.todos} todo(s) will be kept without a category.`}
                />
                <span className="text-muted-foreground text-xs">
                  Used by {c._count.todos} todo{c._count.todos === 1 ? "" : "s"}
                </span>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
