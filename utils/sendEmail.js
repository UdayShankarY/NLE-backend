const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter once when server starts
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email server is ready");
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"TheDecorParty" <${process.env.EMAIL_USER}>`,
      to,
      replyTo: process.env.EMAIL_USER,
      subject,

      // Plain text improves spam score
      text: `
Thank you for choosing TheDecorParty.

Your booking has been received successfully.

If you have any questions, simply reply to this email.

Regards,
TheDecorParty Team
`,

      // HTML version
      html,

      headers: {
        "X-Mailer": "TheDecorParty",
      },
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
    console.log("Message ID:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email sending failed");
    console.error(error);

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = sendEmail;