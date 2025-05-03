const Admin = require("../../models/Admin");
const User = require("../../models/User");

const signoutAdmin = async (req, res) => {
  const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  try {
    await Admin.logoutAdmin(adminId);
    res.clearCookie("jwt");
    res.status(204).json({ message: "Logged out successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminInfo = async (req, res) => {
  const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  console.log(adminId);
  try {
    const admin = await Admin.getAdmin(adminId);
    res.status(200).json({ admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  // const adminId = req.adminId;
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const adminGetUser = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Access forbidden!" });

  const { userId } = req.params;
  if (!userId) return res.status(400).json({ message: "Bad request!" });

  try {
    const userInfo = await User.findById(userId);
    res.status(200).json({ userInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const setUserDepositAddress = async (req, res) => {
  try {
    // Destructure request body
    const {
      userId,
      method,
      coin,
      bankName,
      account,
      bankAddress,
      routing,
      address,
    } = req.body;

    console.log(req.body);

    // Validate required fields
    if (!userId || !method) {
      return res.status(400).json({
        success: false,
        message: "Wallet address, user ID, and method are required fields",
      });
    }

    // Validate method
    if (!["bank", "crypto"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid method. Must be either 'bank' or 'crypto'",
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Handle bank deposit method
    if (method === "bank") {
      // Validate bank fields
      if (!bankName || !account || !routing || !bankAddress) {
        return res.status(400).json({
          success: false,
          message:
            "method, bankName, account, routing, and bank address are required",
        });
      }

      // Update bank info
      user.bankDepositInfo = {
        bankName,
        account,
        routing,
        bankAddress,
      };
    }
    // Handle crypto deposit method
    else {
      // Validate coin field
      if (!coin) {
        return res.status(400).json({
          success: false,
          message: "Coin type is required for crypto method",
        });
      }

      if (
        !user.walletDepositInfo ||
        typeof user.walletDepositInfo !== "object" ||
        Array.isArray(user.walletDepositInfo)
      ) {
        user.walletDepositInfo = {};
      }

      // Set the address for the specific coin
      user.walletDepositInfo[coin] = address;
    }

    // Save user with updated info
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Deposit information updated successfully",
    });
  } catch (error) {
    console.error("Error updating deposit address:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const disableWithdrawal = async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message)
    return res.status(400).json({ message: "All fields required!" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found!" });

    if (!user.canWithdraw)
      return res.status(400).json({ message: "Already disabled!" });

    user.customWithdrawalMsg = message;

    user.canWithdraw = false;
    await user.save();

    return res.status(200).json({ message: "Withdrawal disabled." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const enableWithdrawal = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "All fields required!" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "user not found!" });

    user.customWithdrawalMsg = "";

    user.canWithdraw = true;
    await user.save();

    return res.status(200).json({ message: "Withdrawal disabled." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAdminInfo,
  signoutAdmin,
  getAllUsers,
  adminGetUser,
  setUserDepositAddress,
  disableWithdrawal,
  enableWithdrawal,
};
