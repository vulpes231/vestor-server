const Trade = require("../../models/Trade");

const createTrade = async (req, res) => {
  const adminId = req.adminId;
  if (!adminId) return res.status(403).json({ message: "Forbidden" });

  const {
    assetName,
    assetSymbol,
    amount,
    roi,
    sl,
    tp,
    leverage,
    type,
    userId,
    date,
  } = req.body;
  if (!amount || !assetName || !assetSymbol || !userId || !type || !date)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const tradeData = {
      userId,
      assetName,
      assetSymbol,
      amount,
      roi: roi || 0,
      sl,
      tp,
      leverage,
      type,
      date,
    };
    await Trade.createNewTrade(tradeData);
    res.status(200).json({ message: "New position opened." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTrade = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });

  const { tradeId, roi, action } = req.body;
  if (!tradeId || !roi || !action)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const tradeData = { tradeId, roi, action };
    await Trade.editTrade(tradeData);
    res.status(200).json({ message: "Position updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const closePosition = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin) return res.status(403).json({ message: "Forbidden access!" });

  const { tradeId } = req.body;
  if (!tradeId) return res.status(400).json({ message: "Bad request!" });
  try {
    const tradeData = { tradeId };
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
