"use client";

import { Button } from "@/components/ui/button";

/** Submit button that asks for confirmation before the parent <form action> runs. */
export function DeleteButton({
  confirmText,
  children = "Устгах",
  size = "default",
}: {
  confirmText: string;
  children?: React.ReactNode;
  size?: "default" | "sm";
}) {
  return (
    <Button
      type="submit"
      variant="destructive"
      size={size}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
