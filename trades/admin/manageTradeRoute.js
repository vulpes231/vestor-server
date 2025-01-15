const { Router } = require("express");
const {
  getAllTrades,
  createTrade,
  updateTrade,
  closePosition,
} = require("./manageTrade");

const router = Router();

router.route("/").get(getAllTrades).post(createTrade).put(updateTrade);
router.route("/close").post(closePosition);

module.exports = router;
