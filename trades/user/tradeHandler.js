const Trade = require("../../models/Trade");

const activeTrades = async (req, res) => {
  const userId = req.userId;
  try {
    const activeCount = await Trade.getActiveTradeCount(userId);
    res.status(200).json({ activeCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const userTrades = async (req, res) => {
  const userId = req.userId;
  try {
    const userTrades = await Trade.getUsertrades(userId);
    res.status(200).json({ userTrades });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const totalProfit = async (req, res) => {
  const userId = req.userId;
  try {
    const totalProfit = await Trade.getTotalProfit(userId);
    res.status(200).json({ totalProfit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { activeTrades, userTrades, totalProfit };
