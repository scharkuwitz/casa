"use client";

import { Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export type AttachmentItem = { id: string; fileName: string; size: number };

const formatSize = (n: number) =>
  n < 1024
    ? `${n} Б`
    : n < 1024 * 1024
      ? `${(n / 1024).toFixed(1)} КБ`
      : `${(n / 1024 / 1024).toFixed(1)} МБ`;

async function errorOf(res: Response) {
  try {
    return ((await res.json()) as { error?: string }).error ?? res.statusText;
  } catch {
    return res.statusText || `Хүсэлт амжилтгүй (${res.status})`;
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
    if (tooBig)
      return setError(`“${tooBig.name}” файл ${maxMb} МБ-аас том байна.`);
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
      setError("Байршуулж чадсангүй. Холболтоо шалгаад дахин оролдоно уу.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  async function remove(item: AttachmentItem) {
    if (!window.confirm(`“${item.fileName}” файлыг устгах уу?`)) return;
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
        <p className="text-muted-foreground text-sm">Хавсралт алга.</p>
      ) : (
        <ul className="divide-y border">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 px-3 py-1.5 text-sm"
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
                aria-label={`${a.fileName} устгах`}
                onClick={() => remove(a)}
              >
                Устгах
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
          aria-label="Хавсаргах файл сонгох"
          onChange={(e) => upload(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={busy || full}
          onClick={() => input.current?.click()}
        >
          {busy ? "Байршуулж байна…" : "Файл хавсаргах"}
        </Button>
        <span className="text-muted-foreground text-xs">
          {full
            ? `${maxFiles} хавсралтын хязгаарт хүрсэн.`
            : `Тус бүр ${maxMb} МБ хүртэл, нэг ажилд ${maxFiles} хүртэл.`}
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
