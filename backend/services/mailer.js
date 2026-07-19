const nodemailer = require('nodemailer');

// Email notifications are optional: if neither Resend nor SMTP is configured,
// every send is skipped with a log line and the site works exactly as before.
// Preferred: RESEND_API_KEY (HTTPS API — Railway blocks outbound SMTP ports).
//   Optional: RESEND_FROM (default onboarding@resend.dev; requires a domain
//   verified in Resend to use your own address)
// Fallback: SMTP_USER + SMTP_PASS, with optional SMTP_HOST (default
//   smtp.zoho.eu) and SMTP_PORT (default 465)
// Recipient: NOTIFY_EMAIL (default contact@vermillionpavilion.com; an
//   unverified Resend account can only deliver to its own signup address)

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.zoho.eu',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000
  });
}

async function sendViaResend({ subject, text, replyTo, to }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Vermillion Pavilion <onboarding@resend.dev>',
      to,
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Resend API ${response.status}: ${body}`);
  }
}

// Fire-and-forget: never throws, so a mail failure can't break the API response
async function sendNotification({ subject, text, replyTo }) {
  const to = process.env.NOTIFY_EMAIL || 'contact@vermillionpavilion.com';

  try {
    if (process.env.RESEND_API_KEY) {
      await sendViaResend({ subject, text, replyTo, to });
    } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await getTransporter().sendMail({
        from: `"Vermillion Pavilion" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        ...(replyTo ? { replyTo } : {})
      });
    } else {
      console.log(`Email notification skipped (no email service configured): ${subject}`);
      return;
    }
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
