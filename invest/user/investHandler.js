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

const newPlan = async (req, res) => {
  const { packageName, yield, minPool, maxPool, period } = req.body;

  if (!packageName || !yield || !minPool || !maxPool || !period)
    return res.status(400).json({ message: "Bad request!" });
  try {
    const planData = { packageName, yield, minPool, maxPool, period };
    await Invest.createPlan(planData);
    res.status(200).json({ message: "New plan added." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePlan = async (req, res) => {
  const { packageName, yield, minPool, maxPool, period, planId } = req.body;

  try {
    const planData = { packageName, yield, minPool, maxPool, period };
    await Invest.editPlan(planData, planId);
    res.status(200).json({ message: "Plan updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await Invest.find();
    res.status(200).json({ plans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { buyBot, getUserBots, getPlans, newPlan, updatePlan };
