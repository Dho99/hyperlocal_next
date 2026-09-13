import { test as base, expect } from "@playwright/test";

type AuthFixtures = {
  anonPage: import("@playwright/test").Page;
};

export const test = base.extend<AuthFixtures>({
  anonPage: async ({ browser }, use) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await use(page);
    await ctx.close();
  },
});

export { expect };

export async function loginViaUi(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/halal");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk Sekarang" }).click();
}

export async function loginViaApi(request: import("@playwright/test").APIRequestContext, email: string, password: string) {
  const res = await request.post("/api/auth/sign-in/email", {
    data: { email, password },
  });
  return res;
}
