const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

const sendReminderEmail = async (toEmail, userName, meetingTime) => {
  console.log(`[DEBUG Email] Starting sendReminderEmail to ${toEmail}`);
  console.log(`[DEBUG Email] SMTP_USER exists: ${!!process.env.SMTP_USER}, SMTP_PASS exists: ${!!process.env.SMTP_PASS}`);
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`📧 [MOCK] Reminder email to ${toEmail} — Meeting at ${meetingTime}`);
    console.log(`   Hey ${userName}, don't forget to log your standup before ${meetingTime}!`);
    return { mock: true, to: toEmail };
  }
  
  console.log(`[DEBUG Email] Using real SMTP, creating transporter...`);

  const transporter = createTransporter();

  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const [hours, minutes] = meetingTime.split(':');
  const hour12 = parseInt(hours) % 12 || 12;
  const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
  const displayTime = `${hour12}:${minutes} ${ampm}`;

  const mailOptions = {
    from: `"StandTrack" <${fromEmail}>`,
    to: toEmail,
    subject: `⏰ StandTrack Reminder — Meeting at ${displayTime}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <div style="background: #0f172a; border-radius: 12px; padding: 32px; color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; background: #10b981; border-radius: 8px; padding: 8px 12px; font-weight: bold; color: white; font-size: 16px;">ST</div>
            <h1 style="margin: 12px 0 0; font-size: 20px; color: #f8fafc;">StandTrack Reminder</h1>
          </div>

          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Hey <strong style="color: #f8fafc;">${userName}</strong>,
          </p>

          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
            Your daily standup meeting is at <strong style="color: #10b981; font-size: 16px;">${displayTime}</strong>. 
            Don't forget to log what you worked on today!
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Open StandTrack
            </a>
          </div>

          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">
            You're receiving this because you enabled reminders in StandTrack.
          </p>
        </div>
      </div>
    `
  };

  try {
    console.log(`[DEBUG Email] Sending mail with options:`, { to: mailOptions.to, subject: mailOptions.subject });
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Reminder sent to ${toEmail} — Message ID: ${info.messageId}`);
    console.log(`[DEBUG Email] Email sent successfully`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${toEmail}:`, error.message);
    console.error(`[DEBUG Email] Error details:`, error);
    throw error;
  }
};

module.exports = { sendReminderEmail };

