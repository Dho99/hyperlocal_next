import type { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}
  async goto() {
    await this.page.goto("/halal");
  }
  async login(email: string, password: string) {
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password", { exact: true }).fill(password);
    await this.page.getByRole("button", { name: "Masuk Sekarang" }).click();
  }
  async gotoRegister() {
    await this.page.getByRole("link", { name: "Daftar Gratis" }).click();
  }
  get errorAlert() {
    return this.page.getByRole("alert");
  }
  get verificationCard() {
    return this.page.getByText("Verifikasi Email Diperlukan");
  }
  get resendButton() {
    return this.page.getByRole("button", { name: /Kirim Ulang/i });
  }
}
