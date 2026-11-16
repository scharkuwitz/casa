"use client";

import { Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export type AttachmentItem = { id: string; fileName: string; size: number };

const formatSize = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1024 / 1024).toFixed(1)} MB`;

async function errorOf(res: Response) {
  try {
    return ((await res.json()) as { error?: string }).error ?? res.statusText;
  } catch {
    return res.statusText || `Request failed (${res.status})`;
  }
}

export function Attachments({
  todoId,
  items,
  maxFiles,
  maxMb,
}: {
  todoId: string;
  items: AttachmentItem[];
  maxFiles: number;
  maxMb: number;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const full = items.length >= maxFiles;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(undefined);
    const tooBig = [...files].find((f) => f.size > maxMb * 1024 * 1024);
    if (tooBig) return setError(`“${tooBig.name}” exceeds ${maxMb} MB.`);
    const body = new FormData();
    for (const f of files) body.append("file", f);
    setBusy(true);
    try {
      const res = await fetch(`/api/todos/${todoId}/attachments`, {
        method: "POST",
        body,
      });
      if (!res.ok) setError(await errorOf(res));
      else startTransition(() => router.refresh());
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(item: AttachmentItem) {
    if (!window.confirm(`Delete “${item.fileName}”?`)) return;
    setError(undefined);
    const res = await fetch(`/api/attachments/${item.id}`, {
      method: "DELETE",
    });
    if (!res.ok && res.status !== 404) setError(await errorOf(res));
    else startTransition(() => router.refresh());
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No attachments.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <Paperclip
                className="text-muted-foreground size-4 shrink-0"
                aria-hidden
              />
              <a
                href={`/api/attachments/${a.id}`}
                className="min-w-0 flex-1 truncate"
                download
              >
                {a.fileName}
              </a>
              <span className="text-muted-foreground shrink-0">
                {formatSize(a.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Delete ${a.fileName}`}
                onClick={() => remove(a)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={input}
          type="file"
          multiple
          hidden
          aria-label="Choose files to attach"
          onChange={(e) => upload(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={busy || full}
          onClick={() => input.current?.click()}
        >
          {busy ? "Uploading…" : "Attach files"}
        </Button>
        <span className="text-muted-foreground text-xs">
          {full
            ? `Limit of ${maxFiles} attachments reached.`
            : `Up to ${maxMb} MB each, ${maxFiles} per todo.`}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-destructive mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
