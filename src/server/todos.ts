"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { stringValues, type ActionState } from "@/lib/action-state";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { removeTodoUploads } from "@/lib/storage";
import {
  idSchema,
  statusSchema,
  todoDatesSchema,
  todoSchema,
} from "@/lib/validation";

function invalid(error: z.ZodError, formData?: FormData): ActionState {
  return {
    values: formData && stringValues(formData),
    ok: false,
    message: "Please fix the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

async function categoryMissing(categoryId: string | null) {
  if (!categoryId) return false;
  return !(await db.category.findUnique({ where: { id: categoryId } }));
}

const categoryError = (formData: FormData): ActionState => ({
  ok: false,
  message: "Please fix the highlighted fields.",
  fieldErrors: { categoryId: ["Category does not exist"] },
  values: stringValues(formData),
});

export async function createTodo(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();
  const parsed = todoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  if (await categoryMissing(parsed.data.categoryId))
    return categoryError(formData);

  const todo = await db.todo.create({ data: parsed.data });
  revalidatePath("/");
  redirect(`/todos/${todo.id}`);
}

export async function updateTodo(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();
  const todoId = idSchema.parse(id);
  const parsed = todoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return invalid(parsed.error, formData);
  if (await categoryMissing(parsed.data.categoryId))
    return categoryError(formData);

  const existing = await db.todo.findUnique({ where: { id: todoId } });
  if (!existing) return { ok: false, message: "This todo no longer exists." };

  await db.todo.update({ where: { id: todoId }, data: parsed.data });
  revalidatePath("/");
  revalidatePath(`/todos/${todoId}`);
  return { ok: true, message: "Saved." };
}

/** Bound to a <form action>; deletes the todo and its upload directory. */
export async function deleteTodo(id: string): Promise<void> {
  await requireSession();
  const todoId = idSchema.parse(id);
  await db.todo.deleteMany({ where: { id: todoId } });
  await removeTodoUploads(todoId);
  revalidatePath("/");
  redirect("/");
}

export async function updateTodoStatus(
  id: string,
  status: string,
): Promise<ActionState> {
  await requireSession();
  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) return { ok: false, message: "Invalid status." };
  const { count } = await db.todo.updateMany({
    where: { id: idSchema.parse(id) },
    data: { status: parsedStatus.data },
  });
  if (!count) return { ok: false, message: "This todo no longer exists." };
  revalidatePath("/");
  revalidatePath(`/todos/${id}`);
  return { ok: true };
}

/** Used by Gantt drag-to-reschedule (M5). Dates are "YYYY-MM-DD". */
export async function updateTodoDates(
  id: string,
  startDate: string,
  endDate: string,
): Promise<ActionState> {
  await requireSession();
  const parsed = todoDatesSchema.safeParse({ startDate, endDate });
  if (!parsed.success) return invalid(parsed.error);
  const { count } = await db.todo.updateMany({
    where: { id: idSchema.parse(id) },
    data: parsed.data,
  });
  if (!count) return { ok: false, message: "This todo no longer exists." };
  revalidatePath("/");
  revalidatePath(`/todos/${id}`);
  return { ok: true };
}
