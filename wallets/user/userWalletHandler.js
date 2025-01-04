const Wallet = require("../../models/Wallet");

const fetchWallets = async (req, res) => {
  try {
    const userId = req.userId;
    const wallets = await Wallet.getUserWallets(userId);
    res.status(200).json({ wallets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { fetchWallets };
