// mailService.js
const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "server105.web-hosting.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const sendMail = async (email, subject, message) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: email,
    subject: subject,
    html: message, // This tells the email client to render as HTML
    text: convertHtmlToText(message), // Fallback for plain text clients
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email: ", error);
    const fs = require("fs");
    fs.appendFileSync(
      "mailerror_log.txt",
      `Error sending email: ${error.message}\n`
    );
  }
};

// Simple HTML-to-text conversion function
function convertHtmlToText(html) {
  return html
    .replace(/<style[^>]*>.*<\/style>/gms, "") // Remove style tags
    .replace(/<script[^>]*>.*<\/script>/gms, "") // Remove script tags
    .replace(/<[^>]+>/g, "") // Remove all HTML tags
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .trim();
}

module.exports = {
  sendMail,
};
