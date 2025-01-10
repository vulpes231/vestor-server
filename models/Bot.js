const { Schema, default: mongoose } = require("mongoose");

const botSchema = new Schema({
  name: {
    type: String,
  },
  amountManaged: {
    type: Number,
    required: true,
  },
  roi: {
    type: Number,
    required: true,
    default: 0,
  },
  trades: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Bot = mongoose.model("Bot", botSchema);
module.exports = Bot;
