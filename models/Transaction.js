const { default: mongoose } = require("mongoose");
const User = require("./User");
const Wallet = require("./Wallet");
const { format } = require("date-fns");

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
    },
    amount: {
      type: Number,
    },
    coin: {
      type: String,
    },
    status: {
      type: String,
    },
    date: {
      type: String,
    },
    memo: {
      type: String,
    },
    walletType: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.statics.createTransaction = async function (
  transactionData,
  userId
) {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found!");
    }
    const userWallets = await Wallet.find({ ownerId: user._id });
    if (userWallets.length < 0) {
      throw new Error("You have no active wallets");
    }
    // console.log(userWallets);

    const depositAccount = userWallets.find(
      (wallet) => wallet.walletName.toLowerCase() === "deposit"
    );
    if (!depositAccount) {
      throw new Error("User has no deposit wallet");
    }

    console.log("Balance before", depositAccount.balance);

    const parsedAmt = parseFloat(transactionData.amount);
    depositAccount.balance += parsedAmt;
    await depositAccount.save();

    const newTransaction = {
      owner: user._id,
      type: transactionData.type,
      amount: transactionData.amount,
      coin: transactionData.coin,
      date: transactionData.date,
      memo: transactionData.memo,
      status: "pending",
    };
    await Transaction.create(newTransaction);
    console.log("Balance after", depositAccount.balance);

    return newTransaction;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.depositFunds = async function (
  transactionData,
  userId
) {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found!");
    }
    const depositTrnx = {
      owner: user._id,
      type: "deposit",
      amount: transactionData.amount,
      coin: transactionData.coin,
      memo: transactionData.memo || "Funds deposit",
      status: "pending",
    };
    await Transaction.create(depositTrnx);
    return depositTrnx;
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.withdrawFunds = async function (
  transactionData,
  userId
) {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      throw new Error("User not found!");
    }
    const parsedAmt = parseFloat(transactionData.amount);
    const userWallets = await Wallet.find({ ownerId: user._id });
    if (userWallets.length < 0) {
      throw new Error("You have no active wallets");
    }
    // console.log(userWallets);

    const withdrawAccount = userWallets.find(
      (wallet) => wallet.walletName.toLowerCase() === transactionData.walletType
    );
    if (!withdrawAccount) {
      throw new Error("Invalid withdraw from wallet");
    }

    if (withdrawAccount.balance < parsedAmt) {
      throw new Error("Insufficient balance!");
    }

    console.log("Balance before", withdrawAccount.balance);

    withdrawAccount.balance -= parsedAmt;
    await withdrawAccount.save();

    const newWithdrawal = {
      owner: user._id,
      type: transactionData.type,
      amount: transactionData.amount,
      coin: transactionData.coin,
      memo: transactionData.memo || "Withdrawal",
      walletType: transactionData.walletType,
      status: "pending",
    };
    await Transaction.create(newWithdrawal);
    console.log("Balance after", withdrawAccount.balance);

    return newWithdrawal;
  } catch (error) {
    throw error;
  }
};

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
