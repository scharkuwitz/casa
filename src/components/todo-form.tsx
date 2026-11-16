"use client";

import { useActionState } from "react";
import { Field, nativeControl } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";
import { STATUS_LABEL } from "@/lib/todo-ui";
import { TODO_STATUSES } from "@/lib/validation";

export type TodoFormDefaults = {
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  categoryId: string;
};

export function TodoForm({
  action,
  defaults,
  categories,
  submitLabel,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: TodoFormDefaults;
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const v = { ...defaults, ...state?.values };
  const err = state?.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      key={JSON.stringify(state?.values ?? null)}
      className="max-w-2xl space-y-4"
    >
      <Field label="Title" htmlFor="title" errors={err.title}>
        <Input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={v.title}
          aria-invalid={!!err.title}
        />
      </Field>
      <Field label="Description" htmlFor="description" errors={err.description}>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={5000}
          defaultValue={v.description}
          className={`${nativeControl} h-auto py-1.5`}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="status" errors={err.status}>
          <select
            id="status"
            name="status"
            defaultValue={v.status}
            className={nativeControl}
          >
            {TODO_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" htmlFor="categoryId" errors={err.categoryId}>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={v.categoryId}
            className={nativeControl}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Start date" htmlFor="startDate" errors={err.startDate}>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            required
            defaultValue={v.startDate}
            aria-invalid={!!err.startDate}
          />
        </Field>
        <Field label="End date" htmlFor="endDate" errors={err.endDate}>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            required
            defaultValue={v.endDate}
            aria-invalid={!!err.endDate}
          />
        </Field>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {state?.message && (
          <p
            role="status"
            className={
              state.ok ? "text-status-done text-sm" : "text-destructive text-sm"
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
