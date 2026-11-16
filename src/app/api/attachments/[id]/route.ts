import { db } from "@/lib/db";
import { isSameOrigin, json } from "@/lib/http";
import { getSession } from "@/lib/session";
import {
  contentDisposition,
  openStoredFile,
  removeStoredFile,
  safeMimeType,
} from "@/lib/storage";
import { idSchema } from "@/lib/validation";

async function load(ctx: RouteContext<"/api/attachments/[id]">) {
  const id = idSchema.safeParse((await ctx.params).id);
  if (!id.success) return null;
  return db.attachment.findUnique({ where: { id: id.data } });
}

/** The only way files leave the server: authenticated, forced download, never sniffed. */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/attachments/[id]">,
) {
  if (!(await getSession())) return json({ error: "Нэвтрээгүй байна." }, 401);
  const att = await load(ctx);
  if (!att) return json({ error: "Олдсонгүй." }, 404);

  let file;
  try {
    file = await openStoredFile(att.todoId, att.storedName);
  } catch {
    return json({ error: "Файл серверээс олдсонгүй." }, 404);
  }
  return new Response(file.stream, {
    headers: {
      "Content-Type": safeMimeType(att.mimeType),
      "Content-Length": String(file.size),
      "Content-Disposition": contentDisposition(att.fileName),
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(
  request: Request,
  ctx: RouteContext<"/api/attachments/[id]">,
) {
  if (!(await getSession())) return json({ error: "Нэвтрээгүй байна." }, 401);
  if (!isSameOrigin(request)) return json({ error: "Хориглосон хүсэлт." }, 403);
  const att = await load(ctx);
  if (!att) return json({ error: "Олдсонгүй." }, 404);

  await db.attachment.delete({ where: { id: att.id } });
  await removeStoredFile(att.todoId, att.storedName);
  return new Response(null, { status: 204 });
}
