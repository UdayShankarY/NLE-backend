const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {

    await transporter.sendMail({
      from: `"Next Level Events" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html   // ✅ send HTML email
    });

    console.log("Email sent successfully to:", to);

  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

module.exports = sendEmail;