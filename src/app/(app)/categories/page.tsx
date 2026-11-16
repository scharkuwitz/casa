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
      <h1>Ангилал</h1>
      <h2 className="mt-5">Ангилал нэмэх</h2>
      <div className="mt-4">
        <CategoryForm
          action={createCategory}
          defaults={{ name: "", color: "#9c2233" }}
          submitLabel="Нэмэх"
          resetOnSuccess
        />
      </div>

      <h2 className="mt-8">Бүх ангилал</h2>
      {categories.length === 0 ? (
        <p className="text-muted-foreground mt-3">Ангилал алга.</p>
      ) : (
        <ul className="mt-4 divide-y border">
          {categories.map((c) => (
            <li key={c.id} className="space-y-2 p-2.5">
              <CategoryForm
                action={updateCategory.bind(null, c.id)}
                defaults={{ name: c.name, color: c.color }}
                submitLabel="Хадгалах"
              />
              <form
                action={deleteCategory.bind(null, c.id)}
                className="flex items-center gap-3"
              >
                <DeleteButton
                  size="sm"
                  confirmText={`“${c.name}” ангиллыг устгах уу? Холбогдсон ${c._count.todos} ажил ангилалгүй үлдэнэ.`}
                />
                <span className="text-muted-foreground text-xs">
                  {c._count.todos} ажилд ашиглагдаж байна
                </span>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
