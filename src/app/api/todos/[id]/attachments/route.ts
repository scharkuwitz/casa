import { db } from "@/lib/db";
import { isSameOrigin, json } from "@/lib/http";
import { getSession } from "@/lib/session";
import {
  displayFileName,
  MAX_ATTACHMENTS_PER_TODO,
  MAX_UPLOAD_BYTES,
  removeStoredFile,
  safeMimeType,
  writeUpload,
} from "@/lib/storage";
import { idSchema } from "@/lib/validation";

// Route handler (not a server action) so uploads are not subject to the action body-size limit.
// Auth is checked here; this path is excluded from proxy.ts, whose body buffering would truncate
// large uploads.
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/todos/[id]/attachments">,
) {
  if (!(await getSession())) return json({ error: "Unauthorized" }, 401);
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);

  const parsedId = idSchema.safeParse((await ctx.params).id);
  if (!parsedId.success) return json({ error: "Not found" }, 404);
  const todoId = parsedId.data;

  const todo = await db.todo.findUnique({
    where: { id: todoId },
    select: { id: true, _count: { select: { attachments: true } } },
  });
  if (!todo) return json({ error: "Not found" }, 404);
  const slots = MAX_ATTACHMENTS_PER_TODO - todo._count.attachments;
  if (slots <= 0)
    return json(
      {
        error: `A todo can have at most ${MAX_ATTACHMENTS_PER_TODO} attachments.`,
      },
      400,
    );

  // Reject oversized bodies before buffering them (the real per-file check follows).
  const declared = Number(request.headers.get("content-length"));
  if (declared > MAX_UPLOAD_BYTES * slots + 1024 * 1024)
    return json({ error: "Upload is too large." }, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Expected multipart form data." }, 400);
  }
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return json({ error: "No file provided." }, 400);
  if (files.length > slots)
    return json(
      { error: `Only ${slots} more attachment(s) allowed for this todo.` },
      400,
    );
  for (const f of files) {
    if (f.size === 0)
      return json({ error: `“${displayFileName(f.name)}” is empty.` }, 400);
    if (f.size > MAX_UPLOAD_BYTES)
      return json(
        {
          error: `“${displayFileName(f.name)}” exceeds ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
        },
        413,
      );
  }

  const created = [];
  for (const f of files) {
    const storedName = await writeUpload(todoId, f);
    try {
      created.push(
        await db.attachment.create({
          data: {
            todoId,
            fileName: displayFileName(f.name),
            storedName,
            mimeType: safeMimeType(f.type),
            size: f.size,
          },
        }),
      );
    } catch (e) {
      await removeStoredFile(todoId, storedName); // no orphan file without a row
      throw e;
    }
  }
  return json(
    { attachments: created.map((a) => ({ id: a.id, fileName: a.fileName })) },
    201,
  );
}
