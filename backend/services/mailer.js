const nodemailer = require('nodemailer');

// Email notifications are optional: if SMTP credentials are not configured,
// every send is skipped with a log line and the site works exactly as before.
// Required env vars: SMTP_USER, SMTP_PASS
// Optional: SMTP_HOST (default smtp.zoho.eu), SMTP_PORT (default 465),
//           NOTIFY_EMAIL (default contact@vermillionpavilion.com)

function isConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.eu',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Fire-and-forget: never throws, so a mail failure can't break the API response
async function sendNotification({ subject, text, replyTo }) {
  if (!isConfigured()) {
    console.log(`Email notification skipped (SMTP not configured): ${subject}`);
    return;
  }

  try {
    await getTransporter().sendMail({
      from: `"Vermillion Pavilion" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL || 'contact@vermillionpavilion.com',
      subject,
      text,
      ...(replyTo ? { replyTo } : {})
    });
    console.log(`Email notification sent: ${subject}`);
  } catch (err) {
    console.error(`Email notification failed (${subject}):`, err.message);
  }
}

function notifyInquiry({ name, email, message, paintingTitle, catalogNumber }) {
  const paintingLine = paintingTitle || catalogNumber
    ? `Painting: ${paintingTitle || 'Unknown title'}${catalogNumber ? ` (catalogue no. ${catalogNumber})` : ''}\n`
    : '';

  return sendNotification({
    subject: `New inquiry from ${name}`,
    replyTo: email,
    text:
      `New inquiry via vermillionpavilion.com\n\n` +
      `From: ${name} <${email}>\n` +
      paintingLine +
      `\n${message}\n\n` +
      `Reply to this email to respond directly, or manage it in the admin panel.`
  });
}

function notifySubscription({ name, email }) {
  return sendNotification({
    subject: `New mailing list subscriber: ${name}`,
    text:
      `New mailing list subscription via vermillionpavilion.com\n\n` +
      `Name: ${name}\nEmail: ${email}`
  });
}

module.exports = { notifyInquiry, notifySubscription };
