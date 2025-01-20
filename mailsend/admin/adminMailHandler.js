const { sendMail } = require("../../utils/mailer");

const sendMailToUser = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access" });

  const { message, subject, email } = req.body;
  if (!message || !subject || !email)
    return res.status(400).json({ message: "Incomplete Data" });
  try {
    await sendMail(email, subject, message);
    res.status(200).json({ message: "Mail sent succesfully." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send mail." });
  }
};

module.exports = { sendMailToUser };
