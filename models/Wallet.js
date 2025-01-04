const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const walletSchema = new Schema({
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
  },
  walletName: {
    type: String,
    required: true,
  },
});

walletSchema.statics.getUserWallets = async function (userId) {
  const User = require("./User");
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const userWallets = await Wallet.find({ ownerId: user._id });
    return userWallets;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
