const { Router } = require("express");
const {
  getAllTrades,
  createTrade,
  updateTrade,
  closePosition,
  getTradeById,
} = require("./manageTrade");

const router = Router();

router.route("/").get(getAllTrades).post(createTrade).put(updateTrade);
router.route("/close").post(closePosition);
router.route("/:tradeId").get(getTradeById);

module.exports = router;
