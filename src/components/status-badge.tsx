import { cn } from "@/lib/utils";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/todo-ui";
import type { TodoStatusValue } from "@/lib/validation";

export function StatusBadge({ status }: { status: TodoStatusValue }) {
  return (
    <span
      className={cn(
        "inline-block border border-current px-1.5 text-xs font-medium whitespace-nowrap",
        STATUS_TONE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
