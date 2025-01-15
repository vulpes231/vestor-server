const Trade = require("../../models/Trade");

const createTrade = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });

  const { date, market, amount, roi, userId, botId } = req.body;
  if (!date || !amount || !market || !userId || !botId)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const tradeData = { date, market, amount, roi, userId, botId };
    await Trade.createNewTrade(tradeData);
    res.status(200).json({ message: "New position opened." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTrades = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });
  try {
    const trades = await Trade.getTrades();
    res.status(200).json({ trades });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTrade, getAllTrades };
