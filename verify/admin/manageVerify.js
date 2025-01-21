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
    res.status(200).json({ message: "Account verified" });
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

const getUserVerifyRequest = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin)
    return res
      .status(403)
      .json({ message: "You're not allowed on this server!" });

  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "Bad request!" });
  try {
    const verifyRequest = await Verification.find({ initiator: userId });
    if (!verifyRequest)
      return res.status(404).json({ message: "No pending request." });
    res.status(200).json({ verifyRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  approveVerification,
  rejectVerification,
  getAllVerifyRequest,
  getUserVerifyRequest,
};
