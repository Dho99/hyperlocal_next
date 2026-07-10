import { createTransport, type Transporter } from "nodemailer";

let _diagnosed = false;
let _transporter: Transporter | null = null;
let _transporterPromise: Promise<Transporter | null> | null = null;

async function getTransporter(): Promise<Transporter | null> {
  // Return cached transporter if already verified
  if (_transporter) return _transporter;

  // If verification is in progress, wait for it
  if (_transporterPromise) return _transporterPromise;

  const user = process.env.GMAIL_USER;
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  if (!user || !appPassword) {
    if (!_diagnosed) {
      _diagnosed = true;
      process.stderr.write(
        [
          "",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "📧 GMAIL — DIAGNOSTIC",
          "   ❌ GMAIL_USER or GMAIL_APP_PASSWORD is not set in .env",
          "   👉 Enable 2FA then generate an App Password at",
          "      https://myaccount.google.com/apppasswords",
          "   Fallback: links logged to stderr (dev) / discarded (prod)",
          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
          "",
        ].join("\n") + "\n",
      );
    }
    return null;
  }

  // Create and verify eagerly so the first sendMail doesn't pay the
  // SMTP handshake cost (DNS + TLS + AUTH — can take 3-5 seconds).
  _transporterPromise = (async () => {
    const transporter = createTransport({
      service: "gmail",
      auth: { user, pass: appPassword },
    });

    try {
      await transporter.verify();
      console.log("📧 Gmail transporter verified — ready to send");
      _transporter = transporter;
      return transporter;
    } catch (error) {
      console.error("📧 Gmail transporter verification failed:", error);
      return null;
    } finally {
      _transporterPromise = null;
    }
  })();

  return _transporterPromise;
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

async function sendWithRetry(
  transporter: Transporter,
  mailOptions: { from: string; to: string; subject: string; html: string; text: string },
  label: string,
): Promise<void> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);

      // Rate-limit → back off and retry
      if (errMsg.includes("Too many") || errMsg.includes("450") || errMsg.includes("rate")) {
        const delay = (attempt + 1) * 3000;
        console.warn(`📧 Gmail rate-limited (${label}), retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // Auth error → don't retry
      if (errMsg.includes("auth") || errMsg.includes("535") || errMsg.includes("534")) {
        console.error(`📧 Gmail auth error (${label}):`, errMsg);
        break;
      }

      // Network error → retry
      if (errMsg.includes("ECONN") || errMsg.includes("ETIMEDOUT") || errMsg.includes("socket")) {
        const delay = (attempt + 1) * 1000;
        console.warn(`📧 Gmail connection error (${label}), retrying in ${delay / 1000}s...`);
        _transporter = null;
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      // Unknown error → don't retry
      console.error(`📧 Gmail error (${label}):`, errMsg);
      break;
    }
  }
}

export async function sendPasswordResetEmail(
  data: { user: { email: string; name: string }; url: string; token: string },
  _request?: Request,
) {
  const transporter = await getTransporter();
  if (!transporter) {
    fallbackLog(data);
    return;
  }

  await sendWithRetry(
    transporter,
    {
      from: `Hyperlocal <${process.env.GMAIL_USER!}>`,
      to: data.user.email,
      subject: "Reset Password — Hyperlocal",
      ...passwordResetEmailContent(data),
    },
    "password reset",
  );
}

export async function sendVerificationEmail(
  data: { user: { email: string; name: string }; url: string; token: string },
  _request?: Request,
) {
  const transporter = await getTransporter();
  if (!transporter) {
    fallbackLog(data);
    return;
  }

  await sendWithRetry(
    transporter,
    {
      from: `Hyperlocal <${process.env.GMAIL_USER!}>`,
      to: data.user.email,
      subject: "Verifikasi Email — Hyperlocal",
      ...verificationEmailContent(data),
    },
    "verification",
  );
}

// ─── Templates ────────────────────────────────────────────────────────────

function verificationEmailContent(data: {
  user: { name: string };
  url: string;
}): { html: string; text: string } {
  const text = [
    `Halo ${data.user.name},`,
    "",
    "Terima kasih telah mendaftar di Hyperlocal.",
    "Gunakan link berikut untuk memverifikasi alamat email Anda:",
    "",
    data.url,
    "",
    "Link ini berlaku selama 1 jam.",
    "Jika Anda tidak mendaftar di Hyperlocal, abaikan email ini.",
  ].join("\n");

  const html = `
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

  return { html, text };
}

function passwordResetEmailContent(data: {
  user: { name: string };
  url: string;
}): { html: string; text: string } {
  const text = [
    `Halo ${data.user.name},`,
    "",
    "Kami menerima permintaan reset password untuk akun Hyperlocal Anda.",
    "Gunakan link berikut untuk membuat password baru:",
    "",
    data.url,
    "",
    "Link ini berlaku selama 1 jam.",
    "Jika Anda tidak meminta reset password, abaikan email ini — akun Anda tetap aman.",
  ].join("\n");

  const html = `
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

  return { html, text };
}
