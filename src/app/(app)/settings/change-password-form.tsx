"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function ChangePasswordForm() {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const next = String(form.get("newPassword"));
    if (next !== String(form.get("confirm"))) {
      setMessage({ ok: false, text: "New passwords do not match." });
      return;
    }
    setPending(true);
    setMessage(null);
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("currentPassword")),
      newPassword: next,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) {
      setMessage({
        ok: false,
        text: error.message ?? "Could not change password.",
      });
      return;
    }
    formEl.reset();
    setMessage({ ok: true, text: "Password changed." });
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm space-y-3">
      <div className="space-y-1">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>
      {message && (
        <p
          role="status"
          className={
            message.ok ? "text-status-done text-sm" : "text-destructive text-sm"
          }
        >
          {message.text}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
