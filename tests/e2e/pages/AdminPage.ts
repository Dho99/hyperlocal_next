import type { Page } from "@playwright/test";

export class AdminPage {
  constructor(private page: Page) {}
  async gotoDashboard() {
    await this.page.goto("/dashboard");
  }
  async gotoDestinations() {
    await this.page.goto("/destinations");
  }
  async gotoAceshSettings() {
    await this.page.goto("/settings/acesh");
  }
  async gotoValidasiDestinasi() {
    await this.page.goto("/validasi/destinasi");
  }
  get sidebar() {
    return this.page.locator("aside");
  }
  get dashboardHeading() {
    return this.page.getByRole("heading").first();
  }
}
