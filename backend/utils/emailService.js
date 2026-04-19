const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
  // If SMTP credentials are not set, skip silently (dev mode)
  if (!process.env.SMTP_USER || process.env.SMTP_USER === "your_mailtrap_user") {
    console.log(`[Email skipped – SMTP not configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@docbook.com",
      to,
      subject,
      text,
    };

    if (html) {
      mailOptions.html = html;
    }

    await transporter.sendMail(mailOptions);

    console.log(`[Email sent] To: ${to} | Subject: ${subject}`);
  } catch (err) {
    // Never crash the caller — just log the failure
    console.error(`[Email failed] To: ${to} | Error: ${err.message}`);
  }
};

module.exports = { sendEmail };
