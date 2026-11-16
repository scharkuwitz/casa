/** Shape returned by server actions used with useActionState. */
export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  /** Submitted string values, echoed back so forms can re-fill after an error. */
  values?: Record<string, string>;
} | null;

export function stringValues(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !k.startsWith("$ACTION")) out[k] = v;
  }
  return out;
}
