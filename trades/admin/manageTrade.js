const Trade = require("../../models/Trade");

const createTrade = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });

  const { market, amount, roi, userId, botId } = req.body;
  if (!amount || !market || !userId || !botId)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const tradeData = { market, amount, roi, userId, botId };
    await Trade.createNewTrade(tradeData);
    res.status(200).json({ message: "New position opened." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTrade = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });

  const { tradeId, roi } = req.body;
  if (!tradeId || !roi)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const tradeData = { tradeId, roi };
    await Trade.editTrade(tradeData);
    res.status(200).json({ message: "Position updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closePosition = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });

  const { tradeId, userId } = req.body;
  if (!tradeId || !userId)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const tradeData = { tradeId, userId };
    await Trade.closeTrade(tradeData);
    res.status(200).json({ message: "Position closed." });
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

const getTradeById = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });
  const { tradeId } = req.params;
  if (!tradeId) return res.status(403).json({ message: "Trade ID required!" });
  try {
    const trade = await Trade.findById(tradeId);
    res.status(200).json({ trade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrade,
  getAllTrades,
  updateTrade,
  closePosition,
  getTradeById,
};
