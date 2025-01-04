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

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
