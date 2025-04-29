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

const buyAsset = async (req, res) => {
  const userId = req.userId;

  const { assetName, assetSymbol, amount, roi, sl, tp, leverage, type } =
    req.body;
  if (!amount || !assetName || !assetSymbol || !userId || !type)
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
    };
    await Trade.createNewTrade(tradeData);
    res.status(200).json({ message: "New position opened." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sellAsset = async (req, res) => {
  const userId = req.userId;
  const { tradeId } = req.body;
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

module.exports = { activeTrades, userTrades, totalProfit, buyAsset, sellAsset };
