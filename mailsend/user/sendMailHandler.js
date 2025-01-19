const { generateOTP } = require("../../utils/generateCode");
const { sendMail } = require("../../utils/mailer");

const sendLoginCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Bad request!" });

  try {
    const subject = "Vestor Login OTP Code";
    const code = generateOTP();
    const message = `Your login verification code is ${code}`;
    await sendMail(email, subject, message);
    res.status(200).json({ message: "Login code sent.", code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendLoginCode };
