import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  errors,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  errors?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !errors?.length && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      {errors?.map((e) => (
        <p key={e} role="alert" className="text-destructive text-xs">
          {e}
        </p>
      ))}
    </div>
  );
}

export const nativeControl =
  "border-input bg-card focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3 aria-invalid:border-destructive";
