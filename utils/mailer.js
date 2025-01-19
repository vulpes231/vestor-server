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
    text: message,
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

module.exports = {
  sendMail,
};
