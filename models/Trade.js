const { Schema, default: mongoose } = require("mongoose");
const { format } = require("date-fns");
const User = require("./User");
const Bot = require("./Bot");

const tradeSchema = new Schema({
  date: {
    type: String,
  },
  market: {
    type: String,
  },
  amount: {
    type: Number,
  },
  roi: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Bot",
  },
  createdFor: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

tradeSchema.statics.createNewTrade = async function (tradeData) {
  try {
    const user = await User.findById(tradeData.userId);
    if (!user) {
      throw new Error("Invalid userId");
    }

    const bot = await Bot.findById(tradeData.botId);
    if (!bot) {
      throw new Error("Plan not found!");
    }
    const currentDate = format(new Date(), "EEE d MMM, yyyy");
    const newTradeData = {
      date: currentDate,
      market: tradeData.market,
      amount: tradeData.amount,
      roi: tradeData.roi || 0,
      status: "open",
      createdBy: bot._id,
      createdFor: user._id,
    };
    const newTrade = await Trade.create(newTradeData);

    bot.trades += 1;
    await bot.save();
    return newTrade;
  } catch (error) {
    throw error;
  }
};

tradeSchema.statics.getTrades = async function () {
  try {
    const trades = await Trade.find();
    return trades;
  } catch (error) {
    throw error;
  }
};

tradeSchema.statics.getUsertrades = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Invalid userId");
    }
    const userTrades = await Trade.find({ createdFor: user._id });
    return userTrades;
  } catch (error) {
    throw error;
  }
};

tradeSchema.statics.getActiveTradeCount = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Invalid userId");
    }
    const userTrades = await Trade.find({ createdFor: user._id });
    const activeTrades = userTrades.find((trade) => trade.status === "open");
    const count = activeTrades.length;
    return count;
  } catch (error) {
    throw error;
  }
};

tradeSchema.statics.getTotalProfit = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Invalid userId");
    }

    const userTrades = await Trade.find({ createdFor: user._id });

    const totalProfit = userTrades.reduce((total, trade) => {
      return total + trade.roi;
    }, 0);

    return totalProfit;
  } catch (error) {
    throw error;
  }
};

const Trade = mongoose.model("Trade", tradeSchema);
module.exports = Trade;
