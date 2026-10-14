import nodemailer from "nodemailer";

/**
 * sendEmail.js
 *
 * Sends transactional emails via SMTP (Mailtrap / Ethereal in dev, Brevo / Resend in prod).
 *
 * Developer convenience fallback:
 * If SMTP credentials are not configured in .env, it logs the clickable reset link
 * directly to the terminal console so local manual testing is never blocked.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.text - Plain text version of the message
 * @param {string} options.html - Rich HTML version of the message
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  const from = EMAIL_FROM || "ShopEase Support <noreply@shopease.com>";

  // If SMTP credentials are fully provided, dispatch via Nodemailer
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

  // Dev fallback: Print to console so development workflow is seamless
  console.log("\n=======================================================");
  console.log("📧 [DEV EMAIL FALLBACK] (No SMTP credentials configured)");
  console.log(`To:      ${to}`);
  console.log(`From:    ${from}`);
  console.log(`Subject: ${subject}`);
  console.log("-------------------------------------------------------");
  console.log(text);
  console.log("=======================================================\n");

  return { messageId: "dev-console-logged" };
};

export default sendEmail;
