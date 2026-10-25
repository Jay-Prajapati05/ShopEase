import nodemailer from "nodemailer";

/**
 * sendEmail.js
 *
 * Sends transactional emails via:
 * 1. Brevo HTTPS REST API (Recommended for production, especially on platforms like Render where outbound SMTP ports 25/465/587 are blocked).
 * 2. SMTP (via Nodemailer) if SMTP_HOST is configured.
 * 3. Terminal Console Fallback (for zero-setup local development).
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.text - Plain text version of the message
 * @param {string} options.html - Rich HTML version of the message
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const {
    BREVO_API_KEY,
    BREVO_SENDER_EMAIL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_FROM,
  } = process.env;

  const from = EMAIL_FROM || "ShopEase Support <noreply@shopease.com>";

  // 1. Brevo HTTPS REST API (Preferred in production / Render)
  if (BREVO_API_KEY) {
    const senderEmail = (BREVO_SENDER_EMAIL || EMAIL_FROM || "").trim();
    if (!senderEmail) {
      console.error(
        "❌ [EMAIL] BREVO_SENDER_EMAIL is missing in .env! Must be a verified email in Brevo."
      );
      throw new Error(
        "BREVO_SENDER_EMAIL must be configured when using BREVO_API_KEY (must be a verified email in Brevo)."
      );
    }

    console.log(`📤 [BREVO] Dispatching HTTPS email to: ${to} (Sender: ${senderEmail})...`);

    const payload = {
      sender: {
        name: "ShopEase Support",
        email: senderEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout to prevent hanging

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.message || `Brevo API error: HTTP ${response.status}`;
        console.error("❌ [BREVO] API dispatch failed! Response:", data);
        throw new Error(errorMsg);
      }

      console.log(`✅ [BREVO] Email accepted by Brevo! Message ID:`, data.messageId);
      return { messageId: data.messageId || "brevo-delivered" };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        console.error("❌ [BREVO] Request timed out after 8 seconds.");
        throw new Error("Brevo API request timed out after 8 seconds.");
      }
      throw err;
    }
  }

  // 2. SMTP via Nodemailer (if SMTP host and credentials are provided)
  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465, // true for port 465, false for 587 / 2525
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    return info;
  }

  // 3. Dev fallback: Print to console so local offline development is seamless
  console.log("\n=======================================================");
  console.log("📧 [DEV EMAIL FALLBACK] (No email provider configured)");
  console.log(`To:      ${to}`);
  console.log(`From:    ${from}`);
  console.log(`Subject: ${subject}`);
  console.log("-------------------------------------------------------");
  console.log(text);
  console.log("=======================================================\n");

  return { messageId: "dev-console-logged" };
};

export default sendEmail;

