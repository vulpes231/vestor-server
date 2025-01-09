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

transactionSchema.statics.depositFunds = async function () {
  try {
  } catch (error) {
    throw error;
  }
};

transactionSchema.statics.withdrawFunds = async function () {
  try {
  } catch (error) {
    throw error;
  }
};

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
