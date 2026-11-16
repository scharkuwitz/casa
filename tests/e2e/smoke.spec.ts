import { expect, test } from "@playwright/test";
import { E2E_ADMIN as admin } from "./admin";

test("health endpoint is public and minimal", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: "ok" });
});

test("unauthenticated access is gated", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  const res = await request.get("/api/attachments/does-not-exist", {
    maxRedirects: 0,
  });
  expect(res.status()).toBe(401);
});

test("login, create a todo, see it in list and Gantt, delete it", async ({
  page,
}) => {
  const title = `E2E todo ${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("Имэйл").fill(admin.email);
  await page.getByLabel("Нууц үг").fill("wrong-password");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Нууц үг").fill(admin.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/todos/new");
  await page.getByLabel("Нэр").fill(title);
  await page.getByLabel("Эхлэх огноо").fill("2026-11-10");
  await page.getByLabel("Дуусах огноо").fill("2026-11-12");
  await page.getByRole("button", { name: "Ажил үүсгэх" }).click();

  await page.goto("/");
  await expect(page.getByRole("link", { name: title })).toBeVisible();

  await page
    .getByRole("navigation", { name: "Харагдац" })
    .getByText("Гант")
    .click();
  await expect(page).toHaveURL(/view=gantt/);
  await expect(page.locator(".gantt-host .bar-wrapper").first()).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: title }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Ажил устгах" }).click();
  await page.goto("/");
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);
});
