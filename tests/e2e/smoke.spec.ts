import { expect, test } from "@playwright/test";

const admin = {
  email: "e2e-admin@example.com",
  password: "e2e-password-1234",
};

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
  await page.getByLabel("Email").fill(admin.email);
  await page.getByLabel("Password").fill("wrong-password");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel("Password").fill(admin.password);
  await page.locator('button[type="submit"]').click();
  await expect(page).not.toHaveURL(/\/login/);

  await page.goto("/todos/new");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Start date").fill("2026-11-10");
  await page.getByLabel("End date").fill("2026-11-12");
  await page.getByRole("button", { name: "Create todo" }).click();

  await page.goto("/");
  await expect(page.getByRole("link", { name: title })).toBeVisible();

  await page
    .getByRole("navigation", { name: "View" })
    .getByText("Gantt")
    .click();
  await expect(page).toHaveURL(/view=gantt/);
  await expect(page.locator(".gantt-host .bar-wrapper").first()).toBeVisible();

  await page.goto("/");
  await page.getByRole("link", { name: title }).click();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete todo" }).click();
  await page.goto("/");
  await expect(page.getByRole("link", { name: title })).toHaveCount(0);
});
