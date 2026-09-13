import type { Page } from "@playwright/test";

export class RegisterPage {
  constructor(private page: Page) {}
  async goto() {
    await this.page.goto("/register");
  }
  async register(name: string, email: string, password: string) {
    await this.page.getByLabel("Nama Lengkap").fill(name);
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password", { exact: true }).fill(password);
    await this.page.getByLabel("Konfirmasi").fill(password);
    await this.page.getByRole("checkbox", { name: /Syarat/i }).check();
    await this.page.getByRole("button", { name: "Buat Akun Sekarang" }).click();
  }
  get successCard() {
    return this.page.getByText("Verifikasi Email Anda");
  }
  get resendButton() {
    return this.page.getByRole("button", { name: /Kirim Ulang/i });
  }
}
