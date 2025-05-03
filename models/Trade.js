const { Schema, default: mongoose } = require("mongoose");
const { format } = require("date-fns");
const User = require("./User");
const Bot = require("./Bot");
const Wallet = require("./Wallet");
const { calculatePercentageChange } = require("../utils/generateCode");
const Asset = require("./Asset");

const tradeSchema = new Schema(
  {
    market: {
      type: String,
    },
    symbol: {
      type: String,
    },
    type: {
      type: String,
    },
    img: {
      type: String,
    },
    amount: {
      type: Number,
    },
    entry: {
      type: Number,
    },
    tp: {
      type: Number,
    },
    sl: {
      type: Number,
    },
    qty: {
      type: Number,
    },
    leverage: {
      type: String,
    },
    roi: {
      type: Number,
      default: 0,
    },
    percentageChange: {
      type: String,
      default: "0",
    },
    status: {
      type: String,
    },
    date: {
      type: String,
    },
    createdFor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

tradeSchema.statics.createNewTrade = async function (tradeData) {
  try {
    const user = await User.findById(tradeData.userId);
    if (!user) {
      throw new Error("Invalid userId");
    }

    if (!user.isProfileComplete) {
      throw new Error("Complete profile!");
    }
    if (!user.isKYCVerified) {
      throw new Error("Complete account verification!");
    }

    const userWallets = await Wallet.find({ ownerId: user._id });
    const investWallet = userWallets.find(
      (wallet) => wallet.walletName === "Invest"
    );

    const assets = await Asset.getAllAssets();
    const assetData = assets.find(
      (ast) => ast.symbol === tradeData.assetSymbol
    );

    const cost = parseFloat(tradeData.amount);
    const tradePrice = parseFloat(assetData.price);

    if (isNaN(cost) || isNaN(tradePrice)) {
      throw new Error("Invalid amount or entry price");
    }

    if (investWallet.balance < cost) {
      throw new Error("Insufficient funds in Investment wallet!");
    }

    investWallet.balance -= cost;

    await investWallet.save();

    const change = calculatePercentageChange(cost, tradeData.roi);

    const quant = cost / tradePrice;
    if (isNaN(quant)) {
      throw new Error("Invalid quantity calculation");
    }

    const newTradeData = {
      market: assetData.name,
      symbol: assetData.symbol,
      type: tradeData.type,
      img: assetData.img,
      amount: cost,
      entry: assetData.price,
      tp: tradeData.tp || null,
      sl: tradeData.sl || null,
      leverage: tradeData.leverage || null,
      qty: quant,
      roi: tradeData.roi || 0,
      status: "open",
      createdFor: user._id,
      percentageChange: change,
      date: tradeData.date,
    };

    const newTrade = await Trade.create(newTradeData);
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

tradeSchema.statics.editTrade = async function (tradeData) {
  try {
    const trade = await this.findById(tradeData.tradeId);
    if (!trade) {
      throw new Error("Invalid tradeId");
    }

    if (tradeData.roi && tradeData.action) {
      const amount = parseFloat(tradeData.roi);

      if (tradeData.action === "add") {
        trade.roi += amount;
      } else if (tradeData.action === "subtract") {
        trade.roi -= amount;
      } else {
        throw new Error("Invalid action. Use 'add' or 'subtract'.");
      }

      // After updating ROI, update percentageChange
      trade.percentageChange = calculatePercentageChange(
        trade.amount,
        trade.roi
      );

      // Save the updated trade
      await trade.save();
    }

    return trade;
  } catch (error) {
    throw error;
  }
};

tradeSchema.statics.closeTrade = async function (tradeData) {
  try {
    const trade = await Trade.findById(tradeData.tradeId);
    if (!trade) {
      throw new Error("Invalid tradeId");
    }

    const user = await User.findById(trade.createdFor);
    if (!user) {
      throw new Error("Invalid userId");
    }

    const userWallets = await Wallet.find({ ownerId: user._id });
    const investWallet = userWallets.find(
      (wallet) => wallet.walletName === "Invest"
    );

    if (trade.roi > 0) {
      investWallet.balance += trade.roi;
    } else {
      investWallet.balance -= trade.roi;
    }
    await investWallet.save();

    trade.status = "closed";
    await trade.save();

    return true;
  } catch (error) {
    throw error;
  }
};

const Trade = mongoose.model("Trade", tradeSchema);
module.exports = Trade;
