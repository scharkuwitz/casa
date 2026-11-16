"use client";

import { useState, useTransition } from "react";
import { nativeControl } from "@/components/field";
import { STATUS_LABEL } from "@/lib/todo-ui";
import { TODO_STATUSES, type TodoStatusValue } from "@/lib/validation";
import { updateTodoStatus } from "@/server/todos";

export function StatusSelect({
  id,
  status,
}: {
  id: string;
  status: TodoStatusValue;
}) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <>
      <select
        aria-label="Status"
        aria-invalid={!!error}
        title={error}
        disabled={pending}
        value={value}
        className={`${nativeControl} w-auto min-w-28`}
        onChange={(e) => {
          const next = e.target.value as TodoStatusValue;
          const prev = value;
          setValue(next);
          setError(undefined);
          startTransition(async () => {
            const res = await updateTodoStatus(id, next);
            if (!res?.ok) {
              setValue(prev);
              setError(res?.message ?? "Could not update status");
            }
          });
        }}
      >
        {TODO_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </>
  );
}
