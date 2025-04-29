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
      // walletAddress,
      userId,
      method,
      coin,
      bankName,
      account,
      routing,
      address,
      btcAddress,
      ethErcAddress,
      ethArbAddress,
      usdtErcAddress,
      usdtTrcAddress,
    } = req.body;

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
      if (!bankName || !account || !routing || !address) {
        return res.status(400).json({
          success: false,
          message:
            "For bank method, bankName, account, routing, and address are required",
        });
      }

      // Update bank info
      user.bankDepositInfo = {
        bankName,
        account,
        routing,
        address,
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

      // Validate coin types and corresponding addresses
      const coinAddressMap = {
        btc: btcAddress,
        usdtErc: usdtErcAddress,
        usdtTrc: usdtTrcAddress,
        ethArb: ethArbAddress,
        ethErc: ethErcAddress,
      };

      if (!Object.keys(coinAddressMap).includes(coin)) {
        return res.status(400).json({
          success: false,
          message: "Invalid coin type",
        });
      }

      const address = coinAddressMap[coin];
      if (!address) {
        return res.status(400).json({
          success: false,
          message: `Address is required for ${coin}`,
        });
      }

      // Update wallet info
      user.walletDepositInfo = user.walletDepositInfo || {};
      user.walletDepositInfo[coin] = address;
    }

    // Save user with updated info
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Deposit information updated successfully",
      data: {
        method,
        ...(method === "bank"
          ? user.bankDepositInfo
          : { coin, address: user.walletDepositInfo[coin] }),
      },
    });
  } catch (error) {
    console.error("Error updating deposit address:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
