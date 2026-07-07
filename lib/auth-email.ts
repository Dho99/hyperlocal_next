import { Resend } from "resend";

let _diagnosed = false;

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (!_diagnosed) {
      _diagnosed = true;
      process.stderr.write(
        [
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "📧 RESEND — DIAGNOSTIC",
          "   ❌ RESEND_API_KEY is not set in .env",
          "   👉 Get a key at https://resend.com/api-keys",
          "   Fallback: links logged to stderr (dev) / discarded (prod)",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "",
        ].join("\n") + "\n",
      );
    }
    return null;
  }
  return new Resend(apiKey);
}

function fallbackLog(data: {
  user: { email: string; name: string };
  url: string;
}) {
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) return;

  process.stderr.write(
    [
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "📧 VERIFICATION LINK (dev fallback)",
      `   To:      ${data.user.email}`,
      `   Name:    ${data.user.name}`,
      `   Link:    ${data.url}`,
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
    ].join("\n") + "\n",
  );
}

export async function sendPasswordResetEmail(
  data: { user: { email: string; name: string }; url: string; token: string },
  _request?: Request,
) {
  const resend = getResend();

  if (!resend) {
    fallbackLog(data);
    return;
  }

  const isDev = process.env.NODE_ENV === "development";
  const from = isDev
    ? "Hyperlocal <onboarding@resend.dev>"
    : process.env.RESEND_FROM_ADDRESS || "Hyperlocal <noreply@resend.dev>";

  const sent = await resend.emails.send({
    from,
    to: data.user.email,
    subject: "Reset Password — Hyperlocal",
    html: passwordResetEmailTemplate(data),
  });

  if (sent.error) {
    console.error("Resend: failed to send password reset email:", sent.error);
  }
}

export async function sendVerificationEmail(
  data: { user: { email: string; name: string }; url: string; token: string },
  _request?: Request,
) {
  const resend = getResend();

  if (!resend) {
    fallbackLog(data);
    return;
  }

  const isDev = process.env.NODE_ENV === "development";

  // Resend's shared test sender for dev (no domain verification needed).
  // For production, set RESEND_FROM_ADDRESS to your verified domain.
  const from = isDev
    ? "Hyperlocal <onboarding@resend.dev>"
    : process.env.RESEND_FROM_ADDRESS || "Hyperlocal <noreply@resend.dev>";

  const sent = await resend.emails.send({
    from,
    to: data.user.email,
    subject: "Verifikasi Email — Hyperlocal",
    html: verificationEmailTemplate(data),
  });

  if (sent.error) {
    console.error("Resend: failed to send verification email:", sent.error);
  }
}

function verificationEmailTemplate(data: {
  user: { name: string };
  url: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
          <tr>
            <td style="background-color:#16a34a;padding:32px 40px;text-align:center">
              <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700">Verifikasi Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px">
              <p style="color:#3f3f46;font-size:15px;line-height:1.6;margin:0 0 16px">
                Halo <strong>${data.user.name}</strong>,
              </p>
              <p style="color:#3f3f46;font-size:15px;line-height:1.6;margin:0 0 24px">
                Terima kasih telah mendaftar di <strong>Hyperlocal</strong>. Klik tombol di bawah untuk memverifikasi alamat email Anda dan mengaktifkan akun.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${data.url}" style="display:inline-block;background-color:#16a34a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;text-align:center">
                      Verifikasi Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:24px 0 0">
                Atau salin dan buka link ini di browser:
              </p>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:4px 0 0;word-break:break-all">
                <a href="${data.url}" style="color:#16a34a">${data.url}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;text-align:center">
              <p style="color:#a1a1aa;font-size:12px;line-height:1.5;margin:0">
                Link ini berlaku selama 1 jam. Jika Anda tidak mendaftar di Hyperlocal, abaikan email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function passwordResetEmailTemplate(data: {
  user: { name: string };
  url: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
          <tr>
            <td style="background-color:#d97706;padding:32px 40px;text-align:center">
              <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:700">Reset Password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px">
              <p style="color:#3f3f46;font-size:15px;line-height:1.6;margin:0 0 16px">
                Halo <strong>${data.user.name}</strong>,
              </p>
              <p style="color:#3f3f46;font-size:15px;line-height:1.6;margin:0 0 24px">
                Kami menerima permintaan reset password untuk akun <strong>Hyperlocal</strong> Anda. Klik tombol di bawah untuk membuat password baru.
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${data.url}" style="display:inline-block;background-color:#d97706;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;text-align:center">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:24px 0 0">
                Atau salin dan buka link ini di browser:
              </p>
              <p style="color:#71717a;font-size:13px;line-height:1.5;margin:4px 0 0;word-break:break-all">
                <a href="${data.url}" style="color:#d97706">${data.url}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;text-align:center">
              <p style="color:#a1a1aa;font-size:12px;line-height:1.5;margin:0">
                Link ini berlaku selama 1 jam. Jika Anda tidak meminta reset password, abaikan email ini — akun Anda tetap aman.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
