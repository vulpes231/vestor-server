// mailService.js
const nodemailer = require("nodemailer");

// Create a transporter using SMTP transport
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
  }
};

module.exports = {
  sendMail,
};
