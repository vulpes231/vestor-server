const User = require("../../models/User");
const { sendMail } = require("../../utils/mailer");
const crypto = require("crypto");
const { FRONTEND_BASE_URL, FRONTEND_BASE_URL_DEV } = process.env;
const bcrypt = require("bcryptjs");

const resetPassword = async (req, res) => {
  const { email } = req.body;

  console.log(req.body);

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email address is required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "If this email exists in our system, you'll receive a password reset link",
      });
    }

    // Generate reset token and set expiry (1 hour from now)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Create secure reset URL
    const resetUrl = `${FRONTEND_BASE_URL}/validate?token=${resetToken}&id=${user._id}`;

    // HTML email template
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3748;">Password Reset Request</h2>
        <p>Hello ${user.name || "there"},</p>
        <p>We received a request to reset your password for your Vestor Market account.</p>
        <p>Please click the button below to reset your password:</p>
        
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4299e1; 
                  color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Reset Password
        </a>
        
        <p>This link will expire in 1 hour. If you didn't request a password reset, 
           please ignore this email or contact support if you have questions.</p>
        
        <p>Best regards,<br>The Vestor Market Team</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #718096;">
          If you're having trouble with the button above, copy and paste this link into your browser:
          <br>${resetUrl}
        </p>
      </div>
    `;

    const subject = "Vestor Market - Password Reset Request";

    await sendMail(user.email, subject, message);

    res.status(200).json({
      success: true,
      message: "Password reset instructions have been sent to your email",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

const verifyAndReset = async (req, res) => {
  const { token, id, newPassword } = req.body;

  if (!token || !id || !newPassword)
    return res.status(400).json({ message: "Bad request!", success: false });

  try {
    const user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found!", success: false });

    // 1. Check if token matches
    if (user.resetToken !== token)
      return res
        .status(401)
        .json({ message: "Invalid token!", success: false });

    if (Date.now() > user.resetTokenExpiry) {
      return res
        .status(401)
        .json({ message: "Token expired!", success: false });
    }

    user.resetToken = null;
    user.resetTokenExpiry = null;

    const hashedPass = await bcrypt.hash(newPassword, 10);

    user.password = hashedPass;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error resetting password!",
    });
  }
};

module.exports = { resetPassword, verifyAndReset };
