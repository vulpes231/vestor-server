const { Schema, default: mongoose } = require("mongoose");
const User = require("./User");
const Wallet = require("./Wallet");
const Bot = require("./Bot");

const investSchema = new Schema({
  packageName: {
    type: String,
  },
  yield: {
    type: Number,
  },
  minPool: {
    type: Number,
  },
  maxPool: {
    type: Number,
  },

  period: {
    type: Number,
  },
});

investSchema.statics.createPlan = async function (planData) {
  try {
    const newPlan = {
      packageName: planData.packageName,
      yield: planData.yield,
      minPool: planData.minPool,
      maxPool: planData.maxPool,
      period: planData.period,
    };
    await Invest.create(newPlan);
    return newPlan;
  } catch (error) {
    throw error;
  }
};
investSchema.statics.editPlan = async function (planData, planId) {
  try {
    const plan = await Invest.findById(planId);
    if (!plan) {
      throw new Error("Invalid plan");
    }

    if (planData.packageName) {
      plan.packageName = planData.packageName;
    }
    if (planData.yield) {
      plan.yield = planData.yield;
    }
    if (planData.minPool) {
      plan.minPool = planData.minPool;
    }
    if (planData.maxPool) {
      plan.maxPool = planData.maxPool;
    }
    if (planData.period) {
      plan.period = planData.period;
    }

    await plan.save();
    return plan;
  } catch (error) {
    throw error;
  }
};

investSchema.statics.buyPlan = async function (planId, userId, amount) {
  const parsedAmt = parseFloat(amount);
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }

    const planInfo = await Invest.findById(planId);
    if (!planInfo) {
      throw new Error("Invalid plan!");
    }

    const userWallets = await Wallet.find({ ownerId: user._id });

    const investWallet = userWallets.find(
      (wallet) => wallet.walletName.toLowerCase() === "invest"
    );
    if (!investWallet) {
      throw new Error("Invalid wallet data!");
    }

    if (parsedAmt < planInfo.minPool) {
      throw new Error(`Minimum is ${planInfo.minPool} USD`);
    }

    if (investWallet.balance < parsedAmt) {
      throw new Error("Insufficient funds!");
    }

    investWallet.balance -= parsedAmt;
    await investWallet.save();

    const newUserBot = await Bot.create({
      name: planInfo.packageName,
      amountManaged: parsedAmt,
      owner: user._id,
    });

    return newUserBot;
  } catch (error) {
    throw error;
  }
};

const Invest = mongoose.model("Invest", investSchema);
module.exports = Invest;
