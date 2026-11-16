"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { stringValues, type ActionState } from "@/lib/action-state";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { categorySchema, idSchema } from "@/lib/validation";

const duplicate = (formData: FormData): ActionState => ({
  ok: false,
  message: "Тодруулсан талбаруудыг засна уу.",
  fieldErrors: { name: ["Ийм нэртэй ангилал аль хэдийн байна"] },
  values: stringValues(formData),
});

function isUniqueViolation(e: unknown) {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "P2002"
  );
}

export async function createCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Тодруулсан талбаруудыг засна уу.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: stringValues(formData),
    };
  }
  try {
    await db.category.create({ data: parsed.data });
  } catch (e) {
    if (isUniqueViolation(e)) return duplicate(formData);
    throw e;
  }
  revalidatePath("/categories");
  return { ok: true, message: "Ангилал нэмэгдлээ." };
}

export async function updateCategory(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();
  const categoryId = idSchema.parse(id);
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Тодруулсан талбаруудыг засна уу.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: stringValues(formData),
    };
  }
  try {
    const { count } = await db.category.updateMany({
      where: { id: categoryId },
      data: parsed.data,
    });
    if (!count)
      return { ok: false, message: "Энэ ангилал байхгүй болсон байна." };
  } catch (e) {
    if (isUniqueViolation(e)) return duplicate(formData);
    throw e;
  }
  revalidatePath("/categories");
  revalidatePath("/");
  return { ok: true, message: "Хадгалагдлаа." };
}

/** Todos in the category are kept (categoryId set to null by the schema). */
export async function deleteCategory(id: string): Promise<void> {
  await requireSession();
  await db.category.deleteMany({ where: { id: idSchema.parse(id) } });
  revalidatePath("/categories");
  revalidatePath("/");
}
