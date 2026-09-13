import type { Page, APIRequestContext } from "@playwright/test";

export class AceshPage {
  constructor(private page: Page) {}

  async gotoSettings() {
    await this.page.goto("/settings/acesh");
  }

  async gotoDashboard() {
    await this.page.goto("/dashboard/acesh");
  }

  get toast() {
    return this.page.locator("[data-sonner-toast]").first();
  }

  get modelDiagram() {
    return this.page.getByTestId("acesh-model-diagram");
  }

  get scoreCard() {
    return this.page.getByTestId("acesh-score-card");
  }

  async setWeight(label: string, value: string) {
    const input = this.page.getByLabel(label);
    await input.fill(value);
  }
}

export async function loginAdminViaApi(request: APIRequestContext, email: string, password: string) {
  const res = await request.post("/api/auth/sign-in/email", { data: { email, password } });
  return res;
}
