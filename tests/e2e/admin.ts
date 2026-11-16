/** Admin the e2e suite logs in as; override when running against an external server. */
export const E2E_ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "e2e-admin@example.com",
  password: process.env.E2E_ADMIN_PASSWORD ?? "e2e-password-1234",
};
