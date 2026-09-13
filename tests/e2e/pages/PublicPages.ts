import type { Page } from "@playwright/test";

export class PublicPages {
  constructor(private page: Page) {}
  async gotoHome() {
    await this.page.goto("/");
  }
  async gotoDestinasi() {
    await this.page.goto("/destinasi");
  }
  async gotoPeta() {
    await this.page.goto("/peta");
  }
  get hero() {
    return this.page.locator("main").first();
  }
  get navbar() {
    return this.page.getByRole("navigation");
  }
}
