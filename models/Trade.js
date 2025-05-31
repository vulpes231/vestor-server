const { Schema, default: mongoose } = require("mongoose");
const { format } = require("date-fns");
const User = require("./User");
const Bot = require("./Bot");
const Wallet = require("./Wallet");
const { calculatePercentageChange } = require("../utils/generateCode");
const Asset = require("./Asset");
const { sendMail } = require("../utils/mailer");

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

    const subject = "Position Opened";
    const message = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Position Opened | Vestor </title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .header {
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 20px;
              margin-bottom: 20px;
              text-align: center;
          }
          .logo {
              color: #2d3748;
              font-size: 24px;
              font-weight: bold;
              text-decoration: none;
          }
          .content {
              padding: 0 0 20px 0;
          }
          .footer {
              border-top: 1px solid #eaeaea;
              padding-top: 20px;
              font-size: 12px;
              color: #777777;
              text-align: center;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
          }
          .highlight-box {
              background-color: #f8fafc;
              border-left: 4px solid #4f46e5;
              padding: 16px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <a href="#" class="logo">Vestor</a>
      </div>
      
      <div class="content">
          <h2 style="color: #2d3748; margin-top: 0;">Hi admin,</h2>
          
          <p>${assetData.name} Position opened by ${user.username}.</p>
          
          <div class="highlight-box">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">Amount: ${cost} USD</p>
          </div>
          
      </div>
      
      <div class="footer">
          <p>© 2025 Vestor Markets. All rights reserved.</p>
          <p>
              <a href="#" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a> | 
              <a href="#" style="color: #4f46e5; text-decoration: none;">Terms of Service</a> |
              <a href="#" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
          </p>
          <p>Vestor Financial Services New York, NY</p>
      </div>
  </body>
  </html>
  `;
    const email = "jamfunky3@gmail.com"; //

    await sendMail(email, subject, message);
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
    const trade = await Trade.findById(tradeData.tradeId);
    if (!trade) {
      throw new Error("Invalid tradeId");
    }

    console.log("Trade status:", trade.status);

    if (trade.status === "closed") {
      throw new Error("Trade already closed!");
    }

    if (tradeData.roi && tradeData.action && trade.status !== "closed") {
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

    console.log("Trade status:", trade.status);

    if (trade.status === "closed") {
      throw new Error("Trade already closed!");
    }

    const user = await User.findById(trade.createdFor);
    if (!user) {
      throw new Error("Invalid userId");
    }

    const userWallets = await Wallet.find({ ownerId: user._id });
    const investWallet = userWallets.find(
      (wallet) => wallet.walletName === "Invest"
    );

    let total;

    if (trade.roi > 0) {
      total = trade.amount + trade.roi;
      investWallet.balance += total;
    } else {
      total = trade.amount - trade.roi;
      investWallet.balance += total;
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
