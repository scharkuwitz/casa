"use client";

import { useActionState } from "react";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/action-state";

export function CategoryForm({
  action,
  defaults,
  submitLabel,
  resetOnSuccess = false,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaults: { name: string; color: string };
  submitLabel: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const v = {
    ...(resetOnSuccess && state?.ok ? {} : defaults),
    ...state?.values,
  };
  const err = state?.fieldErrors ?? {};
  const uid = defaults.name || "new";

  return (
    <form
      action={formAction}
      key={JSON.stringify(state?.values ?? null)}
      className="flex flex-wrap items-start gap-3"
    >
      <div className="min-w-48 flex-1">
        <Field label="Name" htmlFor={`name-${uid}`} errors={err.name}>
          <Input
            id={`name-${uid}`}
            name="name"
            required
            maxLength={50}
            defaultValue={v.name ?? defaults.name}
            aria-invalid={!!err.name}
          />
        </Field>
      </div>
      <Field label="Color" htmlFor={`color-${uid}`} errors={err.color}>
        <input
          id={`color-${uid}`}
          name="color"
          type="color"
          defaultValue={v.color ?? defaults.color}
          className="border-input bg-card h-8 w-14 cursor-pointer rounded-lg border p-0.5"
        />
      </Field>
      <div className="flex items-center gap-2 self-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {state?.message && (
          <span
            role="status"
            className={
              state.ok ? "text-status-done text-sm" : "text-destructive text-sm"
            }
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
