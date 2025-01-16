const Verification = require("../../models/Verification");

const approveVerification = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin)
    return res
      .status(403)
      .json({ message: "You're not allowed on this server!" });

  const { verifyId, userId } = req.body;

  try {
    const verifyData = { verifyId, userId };
    await Verification.approveAccount(verifyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectVerification = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin)
    return res
      .status(403)
      .json({ message: "You're not allowed on this server!" });

  const { verifyId, userId } = req.body;

  try {
    const verifyData = { verifyId, userId };
    await Verification.rejectAccount(verifyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllVerifyRequest = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin)
    return res
      .status(403)
      .json({ message: "You're not allowed on this server!" });

  try {
    await Verification.getVerifications();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  approveVerification,
  rejectVerification,
  getAllVerifyRequest,
};
