import "server-only";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { idSchema } from "@/lib/validation";

const mb = Number(process.env.MAX_UPLOAD_MB);
export const MAX_UPLOAD_BYTES = (mb > 0 ? mb : 10) * 1024 * 1024;
export const MAX_ATTACHMENTS_PER_TODO = 10;

// <uuid> or <uuid>.<ext>; the only shape we ever write, so it is also the only shape we read.
const STORED_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]{1,10})?$/;

// Upload paths are runtime data outside the build. Without the `turbopackIgnore` comments the
// file tracer treats them as "dynamic fs access" and copies the whole project (.env, db, ...)
// into the standalone output.
export function uploadRoot() {
  return path.resolve(
    /*turbopackIgnore: true*/ process.env.UPLOAD_DIR ?? "./uploads",
  );
}

/** Absolute per-todo upload directory; throws if the id could escape the root. */
export function todoUploadDir(todoId: string) {
  const id = idSchema.parse(todoId);
  const root = uploadRoot();
  const dir = path.join(/*turbopackIgnore: true*/ root, id);
  if (!dir.startsWith(root + path.sep)) throw new Error("Invalid upload path");
  return dir;
}

export async function removeTodoUploads(todoId: string) {
  await fs.rm(todoUploadDir(todoId), { recursive: true, force: true });
}

/** Absolute path of a stored file; throws on any name we did not generate. */
export function attachmentPath(todoId: string, storedName: string) {
  if (!STORED_NAME.test(storedName)) throw new Error("Invalid stored name");
  return path.join(/*turbopackIgnore: true*/ todoUploadDir(todoId), storedName);
}

/** Display-only name: no directories, no control characters, bounded length. */
export function displayFileName(raw: string) {
  const base = raw.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return (clean || "file").slice(0, 200);
}

/** Writes the file under a random name (the client filename never touches the disk path). */
export async function writeUpload(todoId: string, file: File) {
  const ext = path.extname(file.name).toLowerCase();
  const safeExt = /^\.[a-z0-9]{1,10}$/.test(ext) ? ext : "";
  const storedName = `${randomUUID()}${safeExt}`;
  const target = attachmentPath(todoId, storedName);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(await file.arrayBuffer()), {
    flag: "wx",
  });
  return storedName;
}

export async function removeStoredFile(todoId: string, storedName: string) {
  await fs.rm(attachmentPath(todoId, storedName), { force: true });
}

export async function openStoredFile(todoId: string, storedName: string) {
  const p = attachmentPath(todoId, storedName);
  const stat = await fs.stat(/*turbopackIgnore: true*/ p);
  const stream = Readable.toWeb(
    createReadStream(/*turbopackIgnore: true*/ p),
  ) as ReadableStream;
  return { stream, size: stat.size };
}

/** `attachment` disposition with an ASCII fallback plus RFC 5987 UTF-8 name. */
export function contentDisposition(name: string) {
  const ascii = name.replace(/[^\x20-\x7e]|["\\%]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/** Only well-formed `type/subtype` values are echoed back; anything else downloads as octet-stream. */
export function safeMimeType(type: string) {
  return /^[\w.+-]+\/[\w.+-]+$/.test(type) ? type : "application/octet-stream";
}
