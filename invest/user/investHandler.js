const Bot = require("../../models/Bot");
const Invest = require("../../models/Invest");

const buyBot = async (req, res) => {
  const userId = req.userId;
  const { planId, amount } = req.body;
  if (!planId || !amount)
    return res.status(400).json({ message: "Bad request!" });
  try {
    await Invest.buyPlan(planId, userId, amount);
    res.status(200).json({ message: "Plan purchased successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserBots = async (req, res) => {
  const userId = req.userId;
  try {
    const userBots = await Bot.find({ owner: userId });
    res.status(200).json({ userBots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { buyBot, getUserBots };
