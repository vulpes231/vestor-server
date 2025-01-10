const Invest = require("../../models/Invest");

const createPool = async (req, res) => {
  const isAdmin = req.isAdmin;
  if (!isAdmin)
    return res
      .status(403)
      .json({ message: "You're not allowed on this server!" });

  const { packageName, yield, minPool, maxPool, period } = req.body;
  if (!packageName || !yield || !maxPool || !minPool || !period)
    return res.status(400).json({ message: `Incomplete data!` });

  try {
    const planData = {
      packageName,
      yield,
      minPool,
      maxPool,
      period,
    };
    await Invest.createPlan(planData);
    res.status(201).json({ message: "Plan created." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPool };
